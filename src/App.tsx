import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { PlayerProvider } from './features/player/PlayerContext'
import { FavoritesProvider } from './features/favorites/FavoritesContext'

function App() {
  return (
    <FavoritesProvider>
      <PlayerProvider>
        <RouterProvider router={router} />
      </PlayerProvider>
    </FavoritesProvider>
  )
}

export default App
