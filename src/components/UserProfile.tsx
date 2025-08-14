'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, storage, db } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { Camera, Upload, User, Music, Award, Users } from 'lucide-react'

interface UserProfileData {
  displayName: string
  bio: string
  location: string
  genre: string
  experience: string
  profileImageUrl: string
  stats: {
    battles: number
    wins: number
    views: number
    followers: number
  }
  socialLinks: {
    instagram: string
    youtube: string
    soundcloud: string
    tiktok: string
  }
}

export default function UserProfile() {
  const [user, loading] = useAuthState(auth)
  const [profileData, setProfileData] = useState<UserProfileData>({
    displayName: '',
    bio: '',
    location: '',
    genre: '',
    experience: '',
    profileImageUrl: '',
    stats: { battles: 0, wins: 0, views: 0, followers: 0 },
    socialLinks: { instagram: '', youtube: '', soundcloud: '', tiktok: '' }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user profile data
  const loadProfile = async () => {
    if (!user) return
    
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', user.uid))
      if (profileDoc.exists()) {
        setProfileData(profileDoc.data() as UserProfileData)
      } else {
        // Initialize with user data
        setProfileData(prev => ({
          ...prev,
          displayName: user.displayName || '',
          profileImageUrl: user.photoURL || ''
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  // Save profile data
  const saveProfile = async () => {
    if (!user) return

    try {
      await setDoc(doc(db, 'profiles', user.uid), {
        ...profileData,
        updatedAt: new Date(),
        userId: user.uid
      })

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: profileData.profileImageUrl
      })

      setIsEditing(false)
      console.log('Profile saved successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  // Handle profile image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const imageRef = ref(storage, `profiles/${user.uid}/avatar_${Date.now()}`)
      const uploadTask = uploadBytesResumable(imageRef, file)

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          setIsUploading(false)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          setProfileData(prev => ({ ...prev, profileImageUrl: downloadURL }))
          setIsUploading(false)
          setUploadProgress(0)
        }
      )
    } catch (error) {
      console.error('Error uploading image:', error)
      setIsUploading(false)
    }
  }

  // Load profile on component mount
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
    </div>
  }

  if (!user) {
    return <div className="text-center p-8">
      <p className="text-white">Please sign in to view your profile</p>
    </div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              {profileData.profileImageUrl ? (
                <img 
                  src={profileData.profileImageUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
            </div>
            
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="text-white text-sm">{Math.round(uploadProgress)}%</div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Display Name"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
                <textarea
                  placeholder="Bio - Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 resize-none"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                  />
                  <select
                    value={profileData.genre}
                    onChange={(e) => setProfileData(prev => ({ ...prev, genre: e.target.value }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select Genre</option>
                    <option value="hip-hop">Hip-Hop</option>
                    <option value="rap">Rap</option>
                    <option value="trap">Trap</option>
                    <option value="drill">Drill</option>
                    <option value="r&b">R&B</option>
                    <option value="freestyle">Freestyle</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profileData.displayName || 'Anonymous User'}
                </h1>
                <p className="text-gray-300 mb-4">
                  {profileData.bio || 'No bio yet...'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {profileData.location && (
                    <span className="text-gray-400">📍 {profileData.location}</span>
                  )}
                  {profileData.genre && (
                    <span className="text-gray-400">🎵 {profileData.genre}</span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button onClick={saveProfile} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                    Save Profile
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
          <Music className="w-8 h-8 text-pink-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{profileData.stats.battles}</div>
          <div className="text-gray-300 text-sm">Battles</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
          <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{profileData.stats.wins}</div>
          <div className="text-gray-300 text-sm">Wins</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{profileData.stats.views.toLocaleString()}</div>
          <div className="text-gray-300 text-sm">Views</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{profileData.stats.followers}</div>
          <div className="text-gray-300 text-sm">Followers</div>
        </div>
      </div>

      {/* Social Links */}
      {isEditing && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Social Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="url"
              placeholder="Instagram URL"
              value={profileData.socialLinks.instagram}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, instagram: e.target.value }
              }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
            />
            <input
              type="url"
              placeholder="YouTube URL"
              value={profileData.socialLinks.youtube}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, youtube: e.target.value }
              }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
            />
            <input
              type="url"
              placeholder="SoundCloud URL"
              value={profileData.socialLinks.soundcloud}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, soundcloud: e.target.value }
              }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
            />
            <input
              type="url"
              placeholder="TikTok URL"
              value={profileData.socialLinks.tiktok}
              onChange={(e) => setProfileData(prev => ({
                ...prev,
                socialLinks: { ...prev.socialLinks, tiktok: e.target.value }
              }))}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
            />
          </div>
        </div>
      )}
    </div>
  )
}
