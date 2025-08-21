// src/components/posts/PostCard.jsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { likePost } from '../../store/postSlice'
import { Heart, MessageCircle, Eye, User, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const [isLiking, setIsLiking] = useState(false)
  const [mediaError, setMediaError] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    dispatch(likePost(post.id))
    setIsLiking(false)
  }

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return ''
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    const cleanMediaUrl = mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`
    return `${cleanBaseUrl}${cleanMediaUrl}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center space-x-3 p-4">
        <Link to={`/user/${post.author.id}`}>
          {post.author.profileImage ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${post.author.profileImage}`}
              alt={post.author.username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={20} className="text-gray-600" />
            </div>
          )}
        </Link>

        <div className="flex-1">
          <Link
            to={`/user/${post.author.id}`}
            className="font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            @{post.author.username}
          </Link>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Earnings Badge */}
        {post.totalEarnings > 0 && (
          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            <DollarSign size={12} />
            <span>${post.totalEarnings.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Post Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-gray-900">
            {post.caption.length > 200 ? (
              <>
                {post.caption.slice(0, 200)}...{' '}
                <Link
                  to={`/posts/${post.id}`}
                  className="text-primary hover:underline"
                >
                  Read more
                </Link>
              </>
            ) : (
              post.caption
            )}
          </p>
        </div>
      )}

      {/* Post Media */}
      <div className="relative">
        {post.mediaType === 'image' ? (
          <img
            src={getMediaUrl(post.mediaUrl)}
            alt="Post content"
            className="w-full max-h-96 object-cover cursor-pointer"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error('Media loading error:', e)
              setMediaError(true)
            }}
          />
        ) : (
          <video
            src={getMediaUrl(post.mediaUrl)}
            controls
            className="w-full max-h-96"
            crossOrigin="anonymous"
            preload="metadata"
          />
        )}

        {mediaError && (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Failed to load media</p>
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Actions */}
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 transition-colors ${
                post.isLiked
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart
                size={20}
                className={post.isLiked ? 'fill-current' : ''}
              />
              <span className="text-sm font-medium">{post.likesCount}</span>
            </button>

            <Link
              to={`/posts/${post.id}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </Link>

            <div className="flex items-center space-x-2 text-gray-600">
              <Eye size={20} />
              <span className="text-sm font-medium">{post.viewsCount}</span>
            </div>
          </div>

          {/* View Post Link */}
          <Link
            to={`/posts/${post.id}`}
            className="text-primary hover:text-blue-600 text-sm font-medium transition-colors"
          >
            View Post
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostCard