
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserProfile } from '../store/userSlice'
import { postService } from '../services/postService'
import {  Calendar, FileText, Users as UsersIcon, Eye, Heart, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import Loading from '../components/common/Loading'

const UserProfile = () => {
  const { userId } = useParams()
  const dispatch = useDispatch()
  const { currentUserProfile, isLoading } = useSelector((state) => state.users)
  const [userPosts, setUserPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId))
      
      // Fetch user posts
      const fetchUserPosts = async () => {
        try {
          setPostsLoading(true)
          const response = await postService.getUserPosts(userId, 1, 12)
          // console.log(response)
          setUserPosts(response.posts)
        } catch (error) {
          console.error('Failed to fetch user posts:', error)
        } finally {
          setPostsLoading(false)
        }
      }

      fetchUserPosts()
    }
  }, [dispatch, userId])

  if (isLoading) {
    return <Loading text="Loading profile..." />
  }

  if (!currentUserProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {currentUserProfile.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${currentUserProfile.profileImage}`}
                  alt={currentUserProfile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                  {currentUserProfile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                @{currentUserProfile.username}
              </h1>
              
              {currentUserProfile.bio && (
                <p className="text-gray-600 mb-4">{currentUserProfile.bio}</p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <FileText size={16} />
                  <span>{currentUserProfile.stats.postsCount} posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Joined {format(new Date(currentUserProfile.memberSince), 'MMM yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Posts ({currentUserProfile.stats.postsCount})
          </h2>

          {postsLoading ? (
            <Loading text="Loading posts..." />
          ) : userPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <div key={post.id} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {post.mediaType === 'image' ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${post.mediaUrl}`}
                        alt="Post"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <video
                        src={`${import.meta.env.VITE_API_BASE_URL}${post.mediaUrl}`}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex space-x-6 text-white text-sm">
                        <div className="flex items-center space-x-1">
                          <Heart size={16} className="fill-current" />
                          <span>{post.likesCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle size={16} />
                          <span>{post.commentsCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye size={16} />
                          <span>{post.viewsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile