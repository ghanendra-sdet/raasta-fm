import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { PlayerProvider } from './features/player/PlayerContext'
import { FavoritesProvider } from './features/favorites/FavoritesContext'
import { PlaylistsProvider } from './features/playlists/PlaylistsContext'

function App() {
  return (
    <FavoritesProvider>
      <PlaylistsProvider>
        <PlayerProvider>
          <RouterProvider router={router} />
        </PlayerProvider>
      </PlaylistsProvider>
    </FavoritesProvider>
  )
}

export default App
