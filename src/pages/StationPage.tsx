import { useParams } from 'react-router-dom'

export default function StationPage() {
  const { stationId } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Station / Playlist</h1>
      <p className="mt-2 text-neutral-400">
        Station/playlist view for <span className="text-neutral-200">{stationId}</span> lands here
        once the music-provider abstraction is wired up (Step 8+).
      </p>
    </div>
  )
}
