import { test, expect } from '@playwright/test'

test('"/" is the public landing route and renders Driver Mode, not the normal app nav', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('navigation')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Home' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'My Playlists' })).toHaveCount(0)
  await expect(page.getByText('Raasta FM')).toBeVisible()

  // No exit/navigation link back to the rest of the app — this is a
  // dead-end public review experience with the menu fully disabled.
  await expect(page.getByRole('link')).toHaveCount(0)

  // No legacy FloatingPlayer card (a different, larger blur strength than
  // the current player pill's `.backdrop-blur-md`).
  await expect(page.locator('.backdrop-blur')).toHaveCount(0)
})

test('experimental Driver Mode: loads, no nav chrome, visible YouTube embed, controls', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (err) => pageErrors.push(err.message))

  const response = await page.goto('/driver-mode')
  expect(response?.status()).toBeLessThan(400)

  // No normal app navigation chrome.
  await expect(page.getByRole('navigation')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'My Playlists' })).toHaveCount(0)

  // The required, visible YouTube iframe eventually appears (real network
  // call to youtube.com — generous timeout).
  const iframe = page.locator('iframe[src*="youtube"]')
  await expect(iframe).toBeVisible({ timeout: 20_000 })

  // No horizontal overflow.
  const hasOverflow = await page.evaluate(
    () => document.body.scrollWidth > document.documentElement.clientWidth,
  )
  expect(hasOverflow).toBe(false)

  // Our own playback controls are present alongside the embed (not
  // overlaid on top of it — separate elements in the layout).
  await expect(page.getByRole('button', { name: 'Previous track' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next track' })).toBeVisible()
  await expect(page.getByRole('button', { name: /^(Play|Pause)$/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Favorite' })).toBeVisible()

  // No seek/progress UI of Raasta FM's own.
  await expect(page.locator('main input[type="range"]')).toHaveCount(0)

  // No exit/navigation link — the menu is fully disabled for this
  // dead-end public review experience.
  await expect(page.getByRole('link')).toHaveCount(0)

  // Filter out third-party noise from the embedded YouTube iframe itself —
  // we only care about errors from our own application code.
  const ownErrors = pageErrors.filter((message) => !message.includes('youtube.com'))
  expect(ownErrors).toEqual([])
})

test('experimental Driver Mode: play resolves to either real playback or a clear error — never hangs', async ({
  page,
}) => {
  // This playlist is real third-party content; individual videos can have
  // embedding disabled by their rights holder (common for commercial Hindi
  // music uploads — see docs/MUSIC-SOURCE.md known limitations). The
  // provider auto-skips those, but this test doesn't assume the outcome —
  // it asserts the loading state always resolves to one clear result
  // within a bounded time, never an indefinite spinner.
  await page.goto('/driver-mode')
  await expect(page.locator('iframe[src*="youtube"]')).toBeVisible({ timeout: 20_000 })

  await page.getByRole('button', { name: 'Play' }).click()

  await expect(page.getByText(/tuning in/i)).toHaveCount(0, { timeout: 15_000 })

  const playing = await page
    .getByRole('button', { name: 'Pause' })
    .isVisible()
    .catch(() => false)
  const errorShown = await page
    .locator('p.text-rose-400')
    .isVisible()
    .catch(() => false)

  expect(playing || errorShown).toBe(true)
})
