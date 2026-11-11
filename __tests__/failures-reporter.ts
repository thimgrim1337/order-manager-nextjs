import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import type { Reporter, TestModule } from 'vitest/node';

/**
 * Writes each failed test's title, file, failure screenshot and errors to `outputFile` once a run
 * ends, as `__tests__/e2e/helpers/failures-reporter.ts` does for Playwright, so a red run stays
 * readable after its terminal output is cut or scrolled away.
 */
export default class FailuresReporter implements Reporter {
  private readonly outputFile: string;

  constructor(outputFile: string) {
    this.outputFile = outputFile;
  }

  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const failures = testModules.flatMap((testModule) =>
      [...testModule.children.allTests('failed')].map((test) => {
        const screenshots = test
          .artifacts()
          .flatMap((artifact) =>
            artifact.type === 'internal:failureScreenshot' && artifact.attachments[0]?.originalPath
              ? [`  screenshot: ${relative(process.cwd(), artifact.attachments[0].originalPath)}`]
              : [],
          );
        const errors = (test.result().errors ?? []).map((error) =>
          stripVTControlCharacters(error.message),
        );
        return [
          `✘ [${test.project.name}] ${test.fullName}`,
          `  at ${relative(process.cwd(), testModule.moduleId)}`,
          ...screenshots,
          ...errors,
        ].join('\n');
      }),
    );

    mkdirSync(dirname(this.outputFile), { recursive: true });
    writeFileSync(
      this.outputFile,
      failures.length ? `${failures.join('\n\n')}\n` : 'No failed tests.\n',
    );
  }
}
