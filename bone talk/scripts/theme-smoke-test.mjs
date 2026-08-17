import { chromium } from 'playwright'

const URL = process.env.BONETALK_URL ?? 'http://localhost:5174/'
const results = []

function pass(name, detail = '') {
  results.push({ name, ok: true, detail })
  console.log(`✓ ${name}${detail ? `: ${detail}` : ''}`)
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail })
  console.error(`✗ ${name}${detail ? `: ${detail}` : ''}`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(err.message))

try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })

  const initialTheme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  )
  if (initialTheme === 'light' || initialTheme === 'dark') {
    pass('Default theme attribute set', initialTheme)
  } else {
    fail('Default theme attribute set', String(initialTheme))
  }

  const toggle = page.locator('button[aria-label*="Switch to"]').first()
  await toggle.waitFor({ state: 'visible', timeout: 10000 })
  pass('Theme toggle renders in navbar')

  const startLabel = await toggle.getAttribute('aria-label')
  const goingDark = startLabel === 'Switch to dark mode'

  await toggle.click()
  await page.waitForTimeout(400)

  const afterToggle = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('bonetalk-theme'),
  }))

  if (goingDark && afterToggle.theme === 'dark' && afterToggle.stored === 'dark') {
    pass('Moon click switches to dark mode')
  } else if (!goingDark && afterToggle.theme === 'light' && afterToggle.stored === 'light') {
    pass('Sun click switches to light mode')
  } else {
    fail('Theme toggle updates DOM + localStorage', JSON.stringify(afterToggle))
  }

  await page.reload({ waitUntil: 'networkidle' })
  const afterReload = await page.evaluate(() => ({
    theme: document.documentElement.getAttribute('data-theme'),
    stored: localStorage.getItem('bonetalk-theme'),
  }))

  if (afterReload.theme === afterToggle.theme && afterReload.stored === afterToggle.stored) {
    pass('Theme persists after refresh', afterReload.theme)
  } else {
    fail('Theme persists after refresh', JSON.stringify(afterReload))
  }

  const backToggle = page.locator('button[aria-label*="Switch to"]').first()
  await backToggle.click()
  await page.waitForTimeout(400)

  const backTheme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  )
  if (backTheme !== afterReload.theme) {
    pass('Toggle switches back', backTheme)
  } else {
    fail('Toggle switches back', backTheme)
  }

  await page.evaluate(() => {
    localStorage.setItem('bonetalk-theme', 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  })
  await page.reload({ waitUntil: 'networkidle' })

  const bodyBg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor
  )
  if (bodyBg === 'rgb(8, 9, 9)') {
    pass('Dark mode body background', bodyBg)
  } else {
    fail('Dark mode body background', bodyBg)
  }

  const pipeline = page.locator('section[aria-label="System pipeline"]')
  await pipeline.scrollIntoViewIfNeeded()
  if (await pipeline.isVisible()) {
    pass('System Pipeline section visible')
  } else {
    fail('System Pipeline section visible')
  }

  const pipelineScroll = page.locator(
    'section[aria-label="System pipeline"] .overflow-x-auto'
  )
  if (await pipelineScroll.count()) {
    await pipelineScroll.evaluate((el) => {
      el.scrollLeft = 320
    })
    pass('Pipeline horizontal scroll works')
  } else {
    fail('Pipeline horizontal scroll container missing')
  }

  const emg = page.locator('section#technology')
  await emg.scrollIntoViewIfNeeded()
  const canvasCount = await emg.locator('canvas').count()
  if (canvasCount > 0) {
    pass('EMG canvas renders', String(canvasCount))
  } else {
    fail('EMG canvas renders')
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle' })

  const mobileThemeToggle = page.locator('button[aria-label*="Switch to"]').first()
  const mobileMenu = page.locator('button[aria-label="Open menu"]')

  if (await mobileThemeToggle.isVisible()) {
    pass('Mobile theme toggle visible')
  } else {
    fail('Mobile theme toggle visible')
  }

  if (await mobileMenu.isVisible()) {
    pass('Mobile menu button visible')
  } else {
    fail('Mobile menu button visible')
  }

  if (consoleErrors.length === 0) {
    pass('No browser console errors')
  } else {
    fail('No browser console errors', consoleErrors.join(' | '))
  }
} catch (error) {
  fail('Smoke test execution', error instanceof Error ? error.message : String(error))
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length > 0 ? 1 : 0)
