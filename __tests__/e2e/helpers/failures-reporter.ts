import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

/**
 * Writes each failed test's title, location, attached files (trace, screenshot) and errors to `outputFile` once the run ends,
 * so a red run stays readable after its terminal output is cut or scrolled away.
 */
export default class FailuresReporter implements Reporter {
  private readonly failures: string[] = [];

  private readonly outputFile: string;

  constructor({ outputFile }: { outputFile: string }) {
    this.outputFile = outputFile;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === test.expectedStatus) return;

    const where = `${relative(process.cwd(), test.location.file)}:${test.location.line}`;
    const errors = result.errors.map((error) => stripVTControlCharacters(error.message ?? ''));
    const attachments = result.attachments.flatMap(({ name, path }) =>
      path ? [`  ${name}: ${relative(process.cwd(), path)}`] : [],
    );
    this.failures.push(
      [
        `✘ ${test.titlePath().filter(Boolean).join(' › ')} (${result.status}, retry ${result.retry})`,
        `  at ${where}`,
        ...attachments,
        ...errors,
      ].join('\n'),
    );
  }

  onEnd() {
    mkdirSync(dirname(this.outputFile), { recursive: true });
    writeFileSync(
      this.outputFile,
      this.failures.length ? `${this.failures.join('\n\n')}\n` : 'No failed tests.\n',
    );
  }

  printsToStdio() {
    return false;
  }
}
