'use client'

import MediaUpload from '@/components/MediaUpload'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()

  const handleUploadComplete = (videoId: string, videoData: any) => {
    // Redirect to feed or video page after upload
    router.push('/feed')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <MediaUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  )
}