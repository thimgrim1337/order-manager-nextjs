// Screenshot a page of the running dev server: pnpm screenshot <path> <out.png>
import { chromium } from '@playwright/test';

const [path = '/', out = 'screenshot.png'] = process.argv.slice(2);
const base = process.env.BASE_URL ?? 'http://localhost:3000';

const browser = await chromium.launch({
  executablePath: process.env.CI ? undefined : '/usr/bin/chromium',
});
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
  await page.screenshot({ path: out, fullPage: true });
  console.log(out);
} finally {
  await browser.close();
}
