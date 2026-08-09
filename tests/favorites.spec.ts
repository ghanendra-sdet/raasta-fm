import { test, expect } from '@playwright/test'

test('favorites journey: favorite from player, view, persist across reload, play, remove', async ({
  page,
}) => {
  // Browse a category and start playing.
  await page.goto('/category/mood-night-drive')
  await page.getByRole('button', { name: /play night drive demo track 1/i }).click()
  await expect(page).toHaveURL(/\/now-playing/)
  await expect(page.getByText('Night Drive Demo Track 1')).toBeVisible()

  // Favorite the track from the player.
  await page.getByRole('button', { name: 'Favorite' }).click()
  await expect(page.getByRole('button', { name: 'Remove from favorites' })).toBeVisible()

  // Open Favorites and confirm the track appears.
  await page.getByRole('link', { name: 'Favorites' }).click()
  await expect(page).toHaveURL(/\/favorites/)
  await expect(page.getByText('1 song')).toBeVisible()
  await expect(page.getByText('Night Drive Demo Track 1')).toBeVisible()

  // Play the favorite from the Favorites page.
  await page.getByRole('button', { name: 'Play Night Drive Demo Track 1' }).click()
  await expect(page).toHaveURL(/\/now-playing/)
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  // A hard reload resets the in-memory playback queue (expected — only
  // Favorites are persisted), but the favorite itself must survive.
  await page.reload()
  await page.goto('/favorites')
  await expect(page.getByText('1 song')).toBeVisible()
  await expect(page.getByText('Night Drive Demo Track 1')).toBeVisible()

  // Remove the favorite and confirm the intentional empty state.
  await page.getByRole('button', { name: 'Remove Night Drive Demo Track 1 from favorites' }).click()
  await expect(page.getByText(/no favorites yet/i)).toBeVisible()
})
