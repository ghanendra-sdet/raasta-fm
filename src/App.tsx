import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { PlayerProvider } from './features/player/PlayerContext'
import { FavoritesProvider } from './features/favorites/FavoritesContext'
import { PlaylistsProvider } from './features/playlists/PlaylistsContext'
import { RecentlyPlayedProvider } from './features/recently-played/RecentlyPlayedContext'

function App() {
  return (
    <FavoritesProvider>
      <PlaylistsProvider>
        <PlayerProvider>
          <RecentlyPlayedProvider>
            <RouterProvider router={router} />
          </RecentlyPlayedProvider>
        </PlayerProvider>
      </PlaylistsProvider>
    </FavoritesProvider>
  )
}

export default App
