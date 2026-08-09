import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { PlayerProvider } from './features/player/PlayerContext'

function App() {
  return (
    <PlayerProvider>
      <RouterProvider router={router} />
    </PlayerProvider>
  )
}

export default App
