const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (directError) {
    const moduleRoot = process.env.PLAYWRIGHT_MODULES_DIR || process.env.CODEX_NODE_MODULES;
    if (moduleRoot) return require(path.join(moduleRoot, 'playwright'));
    throw new Error('未找到Playwright。请在本机安装playwright，或设置PLAYWRIGHT_MODULES_DIR指向包含playwright的node_modules。');
  }
}

const { chromium } = loadPlaywright();

const baseUrl = process.env.PROTOTYPE_URL || 'http://127.0.0.1:8765/04_%E4%BA%A7%E5%93%81%E5%8E%9F%E5%9E%8B/index.html';
const artifactDir = process.env.PROTOTYPE_ARTIFACT_DIR || path.join(__dirname, 'artifacts');

(async () => {
  fs.mkdirSync(artifactDir, { recursive: true });
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHANNEL) launchOptions.channel = process.env.PLAYWRIGHT_CHANNEL;
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) launchOptions.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  const browser = await chromium.launch(launchOptions);
  const consoleErrors = [];
  const externalRequests = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== '127.0.0.1') externalRequests.push(request.url());
    });

    const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.equal(await page.title(), 'BOM交付守门人 | 2026 AI先锋未来人才大赛');
    assert.equal(await page.locator('.material-button').count(), 5);
    await page.waitForFunction(() => /4 SET[\s\S]*4 SET[\s\S]*3 SET/.test(document.querySelector('#conflictStrip')?.innerText || ''), null, { timeout: 3000 });
    assert.match(await page.locator('#conflictStrip').innerText(), /4 SET[\s\S]*4 SET[\s\S]*3 SET/);
    await page.screenshot({ path: path.join(artifactDir, '01-overview.png'), fullPage: true });

    await page.getByRole('button', { name: '模拟延误3天' }).click();
    await page.getByRole('tab', { name: '基线与延误场景' }).click();
    assert.match(await page.locator('#scenarioPanel').innerText(), /18h[\s\S]*-54h/);
    await page.screenshot({ path: path.join(artifactDir, '02-delay-simulation.png'), fullPage: true });

    await page.getByRole('button', { name: '开始闭环演示' }).click();
    await page.getByRole('dialog', { name: /干预闭环/ }).waitFor({ state: 'visible', timeout: 3000 });
    assert.equal(await page.getByRole('dialog', { name: /干预闭环/ }).count(), 1);
    await page.getByRole('button', { name: '生成并预览飞书卡片' }).click();
    await page.getByText('飞书AI解释与卡片触达').waitFor({ timeout: 3000 });
    await page.screenshot({ path: path.join(artifactDir, '03-feishu-ai-card.png'), fullPage: true });

    await page.getByRole('button', { name: '载入模拟更正回执' }).click();
    await page.getByText('人工复核AI候选事实').waitFor({ timeout: 4000 });
    assert.match(await page.getByRole('dialog', { name: /干预闭环/ }).innerText(), /3 SET[\s\S]*4 SET/);
    await page.getByRole('button', { name: '确认候选事实并重算' }).click();
    await page.getByText('后端门控后申请关闭').waitFor();
    await page.screenshot({ path: path.join(artifactDir, '04-evidence-review.png'), fullPage: true });

    await page.getByRole('button', { name: '提交关闭申请' }).click();
    await page.getByText('案例关闭回执').waitFor();
    assert.match(await page.getByRole('dialog', { name: /干预闭环/ }).innerText(), /simulated[\s\S]*true/);
    await page.getByRole('button', { name: '返回工作台' }).click();
    assert.equal(await page.locator('#countdown').innerText(), '已关闭');
    assert.match(await page.locator('#activityList').innerText(), /CASE_CLOSED/);

    await page.getByRole('button', { name: '安全与可信' }).click();
    await page.getByRole('button', { name: '签名错误' }).click();
    assert.match(await page.locator('#securityOutput').innerText(), /INVALID_SIGNATURE/);
    await page.getByRole('button', { name: '不可信文档指令' }).click();
    assert.match(await page.locator('#securityOutput').innerText(), /<img src=x onerror=alert\('xss'\)>/);
    await page.screenshot({ path: path.join(artifactDir, '05-security-gates.png'), fullPage: true });

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const mobileErrors = [];
    mobile.on('console', (message) => { if (message.type() === 'error') mobileErrors.push(message.text()); });
    mobile.on('pageerror', (error) => mobileErrors.push(error.message));
    await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
    const width = await mobile.evaluate(() => ({ viewport: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(width.scroll <= width.viewport + 1, `mobile horizontal overflow: ${JSON.stringify(width)}`);
    assert.equal(await mobile.locator('.material-button').count(), 5);
    await mobile.screenshot({ path: path.join(artifactDir, '06-mobile-390x844.png'), fullPage: true });
    assert.deepEqual(mobileErrors, []);

    assert.deepEqual(consoleErrors, []);
    assert.deepEqual(externalRequests, []);
    process.stdout.write(JSON.stringify({ status: 'PASS', screenshots: 6, consoleErrors: 0, externalRequests: 0, mobileWidth: width }) + '\n');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
