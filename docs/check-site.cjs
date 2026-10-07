// Run after Jekyll build; see README for browser dependency setup.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174/ax-study/';
const out = process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(), 'ax-study-qa');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base);
    await page.locator('.project-card').first().waitFor();
    const travelCard = page.locator('.showcase-card a[href$="/travel/jeonju-gunsan/"]');
    assert.equal(await travelCard.count(), 1, 'home must contain one public travel card');
    const travelUrl = await travelCard.getAttribute('href');
    const travelResponse = await page.goto(new URL(travelUrl, base).href);
    assert.equal(travelResponse.status(), 200);
    assert.equal(await page.locator('#day1').count(), 1);
    assert.equal(await page.locator('#day2').count(), 1);
    const travelText = await page.locator('body').innerText();
    assert.match(travelText, /첫째 날/);
    assert.match(travelText, /둘째 날/);
    assert.doesNotMatch(travelText, /\b20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}\b|\d{1,2}\s*월\s*\d{1,2}\s*일|\d{1,2}:\d{2}|체크인|체크아웃|호텔|예약번호|동행인\s*[:：]|출발지\s*[:：]/i, 'public travel page must omit private itinerary details');
    const travelHtml = await page.content();
    assert.doesNotMatch(travelHtml, /20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}/i, 'must not embed calendar dates in metadata');
    assert.equal(await page.locator('.travel-page img').count(), 0, 'public page uses an inline illustration, not imported image assets');
    await page.locator('.theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.screenshot({ path: path.join(out, 'travel-dark.png'), fullPage: true, animations: 'disabled' });
    await page.locator('.theme-toggle').click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `travel overflow at ${width}px`);
      await page.screenshot({ path: path.join(out, `travel-${width}.png`), fullPage: true, animations: 'disabled' });
    }
    await page.goto(base);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('href'), '#main-content', 'first keyboard stop must skip navigation');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('id'), 'main-content');
    const total = await page.locator('.project-card').count();
    assert.equal(total, JSON.parse(fs.readFileSync(process.env.DATA_FILE || path.join(__dirname, '../_data/experiments.json'))).length);
    assert.equal(Number(await page.locator('.metric-highlight strong').textContent()), total, 'project total must follow data');
    for (const category of ['personal', 'automation', 'learning', 'all']) {
      await page.locator(`[data-filter="${category}"]`).click();
      const expected = category === 'all' ? total : await page.locator(`.project-card[data-category="${category}"]`).count();
      assert.equal(await page.locator('.project-card:visible').count(), expected, category);
      assert.equal(Number(await page.locator(`[data-filter="${category}"] span`).textContent()), expected, `${category} badge must follow data`);
      assert.equal(await page.locator('.filter-count').textContent(), `${expected}개 항목`);
      assert.equal(await page.locator(`[data-filter="${category}"]`).getAttribute('aria-pressed'), 'true');
    }
    await page.locator('.theme-toggle').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await page.screenshot({ path: path.join(out, 'desktop-dark.png'), fullPage: true, animations: 'disabled' });
    await page.locator('.theme-toggle').click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow at ${width}px`);
      await page.screenshot({ path: path.join(out, `home-${width}.png`), fullPage: true, animations: 'disabled' });
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const links = await page.locator('a[href]').evaluateAll(nodes => [...new Set(nodes.map(node => node.href))]);
    for (const link of links.filter(link => link.startsWith(base))) {
      const response = await page.goto(link.split('#')[0]);
      assert.ok(response && response.status() === 200, link);
      const hash = new URL(link).hash;
      if (hash) assert.ok(await page.evaluate(id => !!document.getElementById(id), decodeURIComponent(hash.slice(1))), `missing anchor: ${link}`);
    }
    for (const route of ['portfolio/', 'about/']) {
      await page.goto(new URL(route, base).href);
      assert.equal(await page.locator('h1').count(), 1);
      await page.setViewportSize({ width: 320, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow`);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: public travel card and privacy, first/second day page, project filters, theme persistence, four viewport sizes, internal links, detail pages, no JS errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
