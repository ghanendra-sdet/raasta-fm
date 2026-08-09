import { test, expect } from '@playwright/test'

test('playlists journey: create, add tracks, play, persist, edit, delete', async ({ page }) => {
  // Create a playlist.
  await page.goto('/playlists')
  await page.getByLabel('Playlist name').fill('Morning Drive')
  await page.getByRole('button', { name: 'Create playlist' }).click()
  await expect(page).toHaveURL(/\/playlists\/.+/)
  await expect(page.getByRole('heading', { name: 'Morning Drive' })).toBeVisible()
  await expect(page.getByText('This playlist is empty.')).toBeVisible()

  const playlistUrl = page.url()

  // Play a track from a category, then add it to the playlist.
  await page.goto('/category/mood-feel-good')
  await page.getByRole('button', { name: /play feel good demo track 1/i }).click()
  await expect(page).toHaveURL(/\/now-playing/)

  await page.getByText('Add to playlist').click()
  await page.getByRole('button', { name: 'Add to Morning Drive' }).click()
  await expect(page.getByText('Added to Morning Drive.')).toBeVisible()

  // Add a second track — the disclosure stays open across track changes,
  // so no need to reopen it.
  await page.getByRole('button', { name: 'Next track' }).click()
  await page.getByRole('button', { name: 'Add to Morning Drive' }).click()

  // Open the playlist and verify both tracks.
  await page.goto(playlistUrl)
  await expect(page.getByText('2 songs')).toBeVisible()
  await expect(page.getByText('Feel Good Demo Track 1')).toBeVisible()
  await expect(page.getByText('Feel Good Demo Track 2')).toBeVisible()

  // Play the playlist.
  await page.getByRole('button', { name: 'Play playlist Morning Drive' }).click()
  await expect(page).toHaveURL(/\/now-playing/)
  await expect(page.getByText('Feel Good Demo Track 1')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  // Reload and confirm the playlist persists.
  await page.goto(playlistUrl)
  await page.reload()
  await expect(page.getByText('2 songs')).toBeVisible()

  // Remove a track.
  await page.getByRole('button', { name: 'Remove Feel Good Demo Track 2 from playlist' }).click()
  await expect(page.getByText('1 song')).toBeVisible()

  // Rename the playlist.
  await page.getByRole('button', { name: 'Rename playlist' }).click()
  await page.getByLabel('Rename playlist').fill('Sunday Drive')
  await page.getByRole('button', { name: 'Save playlist name' }).click()
  await expect(page.getByRole('heading', { name: 'Sunday Drive' })).toBeVisible()

  // Delete the playlist and confirm the empty My Playlists state.
  await page.getByRole('button', { name: 'Delete playlist' }).click()
  await expect(page).toHaveURL(/\/playlists$/)
  await expect(page.getByText(/no playlists yet/i)).toBeVisible()
})
