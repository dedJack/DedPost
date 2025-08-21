// src/pages/PostDetails.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostDetails, likePost, addComment } from '../../store/postSlice'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Heart, MessageCircle, Eye, User, Send, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Loading from '../common/Loading'
import toast from 'react-hot-toast'

const PostDetails = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentPost, isLoading } = useSelector((state) => state.posts)
  const { user } = useSelector((state) => state.auth)
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetails(postId))
    }
  }, [dispatch, postId])

  const handleLike = async () => {
    if (isLiking || !currentPost) return
    setIsLiking(true)
    await dispatch(likePost(currentPost._id || currentPost.id))
    setIsLiking(false)
  }

  const onSubmit = async (data) => {
    try {
      setIsCommenting(true)
      await dispatch(
        addComment({
          postId: currentPost._id || currentPost.id,
          content: data.content,
        })
      )
      reset()
      toast.success('Comment added successfully')
      dispatch(fetchPostDetails(postId)) // refresh comments
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setIsCommenting(false)
    }
  }

  if (isLoading) {
    return <Loading text="Loading post..." />
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">
            The post you're looking for doesn't exist.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Post Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Post Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
                <Link to={`/user/${currentPost.author.id}`}>
                  {currentPost.author.profileImage ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${currentPost.author.profileImage}`}
                      alt={currentPost.author.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-600" />
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <Link
                    to={`/user/${currentPost.author.id}`}
                    className="font-semibold text-gray-900 hover:text-primary transition-colors"
                  >
                    @{currentPost.author.username}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(currentPost.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Earnings Badge */}
                {currentPost.totalEarnings > 0 && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    <DollarSign size={14} />
                    <span className="font-medium">
                      ${currentPost.totalEarnings.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Post Caption */}
              {currentPost.caption && (
                <div className="p-6 border-b border-gray-200">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {currentPost.caption}
                  </p>
                </div>
              )}

              {/* Post Media */}
              <div className="flex justify-center bg-black">
                {currentPost.mediaType === 'image' ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${currentPost.mediaUrl}`}
                    alt="Post content"
                    className="max-w-full max-h-96 object-contain"
                  />
                ) : (
                  <video
                    src={`${import.meta.env.VITE_API_BASE_URL}${currentPost.mediaUrl}`}
                    controls
                    className="max-w-full max-h-96"
                  />
                )}
              </div>

              {/* Post Actions */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-8">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center space-x-2 transition-colors ${
                      currentPost.isLiked
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      size={24}
                      className={currentPost.isLiked ? 'fill-current' : ''}
                    />
                    <span className="font-medium">
                      {currentPost.likesCount} likes
                    </span>
                  </button>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageCircle size={24} />
                    <span className="font-medium">
                      {currentPost.commentsCount} comments
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Eye size={24} />
                    <span className="font-medium">
                      {currentPost.viewsCount} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Comment */}
              {user && (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 border-b border-gray-200"
                >
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      {user.profileImage ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${user.profileImage}`}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex space-x-3">
                        <input
                          {...register('content', {
                            required: 'Comment cannot be empty',
                            maxLength: {
                              value: 500,
                              message: 'Comment must be less than 500 characters',
                            },
                            validate: (value) =>
                              value.trim().length > 0 ||
                              'Comment cannot be empty',
                          })}
                          type="text"
                          className="flex-1 input-field"
                          placeholder="Add a comment..."
                        />
                        <button
                          type="submit"
                          disabled={isCommenting}
                          className="btn-primary px-4"
                        >
                          {isCommenting ? (
                            <div className="w-5 h-5 spinner"></div>
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
                      {errors.content && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.content.message}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Comments Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Comments ({currentPost.commentsCount})
              </h2>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {currentPost.comments && currentPost.comments.length > 0 ? (
                  currentPost.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {comment.author.profileImage ? (
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}${comment.author.profileImage}`}
                            alt={comment.author.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-100 rounded-lg px-3 py-2">
                          <Link
                            to={`/user/${comment.author.id}`}
                            className="font-medium text-gray-900 hover:text-primary transition-colors text-sm"
                          >
                            @{comment.author.username}
                          </Link>
                          <p className="text-gray-700 text-sm mt-1">
                            {comment.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            {formatDistanceToNow(
                              new Date(comment.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                          {comment.likesCount > 0 && (
                            <span>{comment.likesCount} likes</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle
                      size={48}
                      className="mx-auto mb-4 opacity-50"
                    />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetails
