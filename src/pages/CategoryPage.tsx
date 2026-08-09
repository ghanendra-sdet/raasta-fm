import { useParams } from 'react-router-dom'

export default function CategoryPage() {
  const { categoryId } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Category</h1>
      <p className="mt-2 text-neutral-400">
        Track listing for <span className="text-neutral-200">{categoryId}</span> lands here in Step
        7.
      </p>
    </div>
  )
}
