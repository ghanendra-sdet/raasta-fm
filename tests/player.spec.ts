import { test, expect } from '@playwright/test'

test('critical player journey: browse a category, play, pause, next', async ({ page }) => {
  await page.goto('/category/mood-romantic')
  await expect(page.getByRole('heading', { name: 'Romantic' })).toBeVisible()

  await page.getByRole('button', { name: /play romantic demo track 1/i }).click()

  await expect(page).toHaveURL(/\/now-playing/)
  await expect(page.getByText('Romantic Demo Track 1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  // No seek/progress UI anywhere on the player page.
  await expect(page.locator('input[type="range"]')).toHaveCount(0)
  await expect(page.getByRole('slider')).toHaveCount(0)

  await page.getByRole('button', { name: 'Pause' }).click()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()

  await page.getByRole('button', { name: 'Next track' }).click()
  await expect(page.getByText('Romantic Demo Track 2')).toBeVisible()
})
