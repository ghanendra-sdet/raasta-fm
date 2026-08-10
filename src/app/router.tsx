import { createBrowserRouter } from 'react-router-dom'
import AppLayout from './AppLayout'
import Home from '../pages/Home'
import CategoryPage from '../pages/CategoryPage'
import StationPage from '../pages/StationPage'
import PlayerPage from '../pages/PlayerPage'
import Favorites from '../pages/Favorites'
import Playlists from '../pages/Playlists'
import PlaylistDetail from '../pages/PlaylistDetail'
import DriverMode from '../pages/DriverMode'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Temporary public-review configuration: Home moved off "/" so
      // Driver Mode (below) can be the public landing experience for the
      // 10-user experiment. Not deleted — still fully reachable at
      // /home. Revert by swapping the two paths back.
      { path: '/home', element: <Home /> },
      { path: '/category/:categoryId', element: <CategoryPage /> },
      { path: '/station/:stationId', element: <StationPage /> },
      { path: '/now-playing', element: <PlayerPage /> },
      { path: '/favorites', element: <Favorites /> },
      { path: '/playlists', element: <Playlists /> },
      { path: '/playlists/:playlistId', element: <PlaylistDetail /> },
    ],
  },
  // Rendered outside AppLayout on purpose — Driver Mode has no nav chrome.
  // "/" and "/driver-mode" both render it: "/" is the temporary public
  // landing route for the review experiment, "/driver-mode" remains the
  // permanent, explicit entry point.
  { path: '/', element: <DriverMode /> },
  { path: '/driver-mode', element: <DriverMode /> },
])
