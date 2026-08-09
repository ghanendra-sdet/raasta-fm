import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './AppLayout'
import Home from '../pages/Home'
import CategoryPage from '../pages/CategoryPage'
import StationPage from '../pages/StationPage'
import PlayerPage from '../pages/PlayerPage'
import Favorites from '../pages/Favorites'
import Playlists from '../pages/Playlists'
import DriverMode from '../pages/DriverMode'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/category/:categoryId', element: <CategoryPage /> },
      { path: '/station/:stationId', element: <StationPage /> },
      { path: '/now-playing', element: <PlayerPage /> },
      { path: '/favorites', element: <Favorites /> },
      { path: '/playlists', element: <Playlists /> },
    ],
  },
  // Rendered outside AppLayout on purpose — Driver Mode has no nav chrome.
  { path: '/driver-mode', element: <DriverMode /> },
])
