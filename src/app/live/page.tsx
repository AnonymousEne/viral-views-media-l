'use client'

import Livestream from '@/components/Livestream'
import { useSearchParams } from 'next/navigation'

export default function LivestreamPage() {
  const searchParams = useSearchParams()
  const streamId = searchParams.get('streamId')
  const isStreamer = searchParams.get('mode') === 'stream'

  return (
    <div className="min-h-screen">
      <Livestream streamId={streamId || undefined} isStreamer={isStreamer} />
    </div>
  )
}