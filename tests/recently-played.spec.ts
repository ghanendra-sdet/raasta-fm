import { test, expect, type Page } from '@playwright/test'

async function recentTitles(page: Page): Promise<string[]> {
  return page.$$eval('main li p.text-neutral-100', (els) =>
    els.map((el) => el.textContent?.trim() ?? ''),
  )
}

test('recently played journey: record, order, replay, persist, clear', async ({ page }) => {
  // Play a first track.
  await page.goto('/category/mood-sad')
  await page.getByRole('button', { name: /play sad songs demo track 1/i }).click()
  await expect(page).toHaveURL(/\/now-playing/)
  // The "played" record and its localStorage persistence happen in a
  // passive effect after this commit — give it a moment before a hard
  // navigation, which would otherwise race ahead of that flush.
  await page.waitForTimeout(200)

  await page.goto('/')
  await expect(page.getByText(/no songs played yet/i)).toHaveCount(0)
  expect(await recentTitles(page)).toEqual(['Sad Songs Demo Track 1'])

  // Play a second track — it should appear first.
  await page.goto('/category/mood-sad')
  await page.getByRole('button', { name: /play sad songs demo track 2/i }).click()
  await expect(page).toHaveURL(/\/now-playing/)
  // The "played" record and its localStorage persistence happen in a
  // passive effect after this commit — give it a moment before a hard
  // navigation, which would otherwise race ahead of that flush.
  await page.waitForTimeout(200)

  await page.goto('/')
  expect(await recentTitles(page)).toEqual(['Sad Songs Demo Track 2', 'Sad Songs Demo Track 1'])

  // Replay the first track from the Recently Played section — it should
  // move to the top without creating a duplicate entry.
  await page.getByRole('button', { name: 'Play Sad Songs Demo Track 1' }).click()
  await expect(page).toHaveURL(/\/now-playing/)
  // The "played" record and its localStorage persistence happen in a
  // passive effect after this commit — give it a moment before a hard
  // navigation, which would otherwise race ahead of that flush.
  await page.waitForTimeout(200)

  await page.goto('/')
  expect(await recentTitles(page)).toEqual(['Sad Songs Demo Track 1', 'Sad Songs Demo Track 2'])

  // Reload and confirm the order persists.
  await page.reload()
  expect(await recentTitles(page)).toEqual(['Sad Songs Demo Track 1', 'Sad Songs Demo Track 2'])

  // Clear history and confirm the empty state.
  await page.getByRole('button', { name: 'Clear recently played' }).click()
  await page.getByRole('button', { name: 'Confirm clear recently played history' }).click()
  await expect(page.getByText(/no songs played yet/i)).toBeVisible()
  expect(await recentTitles(page)).toEqual([])
})
