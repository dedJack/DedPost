
// // src/pages/Profile.jsx
// import React, { useState, useEffect } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { useForm } from 'react-hook-form'
// import { updateProfile } from '../store/authSlice'
// import { fetchUserStats } from '../store/userSlice'
// import { Camera, Edit3, Save, X, DollarSign, Eye, Heart, MessageCircle } from 'lucide-react'
// import { format } from 'date-fns'

// const Profile = () => {
//   const dispatch = useDispatch()
//   const { user } = useSelector((state) => state.auth)
//   const { userStats } = useSelector((state) => state.users)
//   const [isEditing, setIsEditing] = useState(false)
//   const [selectedFile, setSelectedFile] = useState(null)
//   const [previewUrl, setPreviewUrl] = useState(null)

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm()

//   useEffect(() => {
//     if (user) {
//       dispatch(fetchUserStats(user.id))
//       reset({
//         username: user.username,
//         bio: user.bio || '',
//       })
//     }
//   }, [user, dispatch, reset])

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0]
//     if (file) {
//       setSelectedFile(file)
//       const url = URL.createObjectURL(file)
//       setPreviewUrl(url)
//     }
//   }

//   const onSubmit = (data) => {
//     const formData = {
//       ...data,
//       avatar: selectedFile,
//     }
//     dispatch(updateProfile(formData)).then(() => {
//       setIsEditing(false)
//       setSelectedFile(null)
//       setPreviewUrl(null)
//     })
//   }

//   const handleCancel = () => {
//     setIsEditing(false)
//     setSelectedFile(null)
//     setPreviewUrl(null)
//     reset({
//       username: user.username,
//       bio: user.bio || '',
//     })
//   }

//   if (!user) return null

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Profile Header */}
//         <div className="bg-white rounded-lg shadow-md p-8 mb-8">
//           <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
//             {/* Profile Image */}
//             <div className="relative">
//               <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
//                 {previewUrl ? (
//                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
//                 ) : user.profileImage ? (
//                   <img
//                     src={`${import.meta.env.VITE_API_BASE_URL}${user.profileImage}`}
//                     alt={user.username}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
//                     {user.username.charAt(0).toUpperCase()}
//                   </div>
//                 )}
//               </div>
//               {isEditing && (
//                 <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
//                   <Camera size={16} />
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileSelect}
//                     className="hidden"
//                   />
//                 </label>
//               )}
//             </div>

//             {/* Profile Info */}
//             <div className="flex-1">
//               {isEditing ? (
//                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                   <div>
//                     <input
//                       {...register('username', {
//                         required: 'Username is required',
//                         minLength: {
//                           value: 3,
//                           message: 'Username must be at least 3 characters',
//                         },
//                       })}
//                       className="text-2xl font-bold input-field"
//                       placeholder="Username"
//                     />
//                     {errors.username && (
//                       <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <textarea
//                       {...register('bio', {
//                         maxLength: {
//                           value: 500,
//                           message: 'Bio must be less than 500 characters',
//                         },
//                       })}
//                       className="input-field resize-none"
//                       rows={3}
//                       placeholder="Tell us about yourself..."
//                     />
//                     {errors.bio && (
//                       <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
//                     )}
//                   </div>

//                   <div className="flex space-x-3">
//                     <button type="submit" className="btn-primary">
//                       <Save size={16} />
//                       Save Changes
//                     </button>
//                     <button
//                       type="button"
//                       onClick={handleCancel}
//                       className="btn-secondary"
//                     >
//                       <X size={16} />
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               ) : (
//                 <div>
//                   <div className="flex items-center space-x-4 mb-4">
//                     <h1 className="text-2xl font-bold text-gray-900">@{user.username}</h1>
//                     <button
//                       onClick={() => setIsEditing(true)}
//                       className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
//                     >
//                       <Edit3 size={16} />
//                       <span>Edit</span>
//                     </button>
//                   </div>
                  
//                   <p className="text-gray-600 mb-4">
//                     {user.bio || 'No bio yet. Click edit to add one!'}
//                   </p>

//                   <div className="flex flex-wrap gap-6 text-sm text-gray-500">
//                     <span>{user.postsCount} posts</span>
//                     <span>Member since {format(new Date(user.createdAt || Date.now()), 'MMM yyyy')}</span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Earnings Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <DollarSign className="w-6 h-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Total Earnings</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   ${user.totalEarnings?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-yellow-100 rounded-lg">
//                 <DollarSign className="w-6 h-6 text-yellow-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Pending</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   ${user.pendingEarnings?.toFixed(2) || '0.00'}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Eye className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Total Views</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   {userStats?.engagement?.totalViews || 0}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <div className="flex items-center space-x-3">
//               <div className="p-2 bg-red-100 rounded-lg">
//                 <Heart className="w-6 h-6 text-red-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600">Total Likes</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   {userStats?.engagement?.totalLikes || 0}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Posts */}
//         {userStats?.topPosts && userStats.topPosts.length > 0 && (
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Posts</h2>
//             <div className="space-y-4">
//               {userStats.topPosts.map((post) => (
//                 <div key={post.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
//                   <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
//                     <img
//                       src={`${import.meta.env.VITE_API_BASE_URL}${post.mediaUrl}`}
//                       alt="Post"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-gray-900 font-medium truncate">{post.caption}</p>
//                     <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
//                       <span className="flex items-center space-x-1">
//                         <Eye size={14} />
//                         <span>{post.stats.views}</span>
//                       </span>
//                       <span className="flex items-center space-x-1">
//                         <Heart size={14} />
//                         <span>{post.stats.likes}</span>
//                       </span>
//                       <span className="flex items-center space-x-1">
//                         <MessageCircle size={14} />
//                         <span>{post.stats.comments}</span>
//                       </span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-green-600 font-medium">
//                       ${post.stats.earnings.toFixed(2)}
//                     </p>
//                     <p className="text-xs text-gray-500">earned</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Profile


// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { updateProfile } from '../store/authSlice'
import { fetchUserStats } from '../store/userSlice'
import { Camera, Edit3, Save, X, DollarSign, Eye, Heart, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'

const Profile = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { userStats, statsLoading } = useSelector((state) => state.users)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (user) {
      // Use the correct user ID field - try both _id and id
      const userId = user._id || user.id
      console.log('User object:', user)
      console.log('Using user ID:', userId)
      
      if (userId) {
        dispatch(fetchUserStats(userId))
      } else {
        console.error('No valid user ID found in user object')
      }
      
      reset({
        username: user.username,
        bio: user.bio || '',
      })
    }
  }, [user, dispatch, reset])

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const onSubmit = (data) => {
    const formData = {
      ...data,
      avatar: selectedFile,
    }
    dispatch(updateProfile(formData)).then(() => {
      setIsEditing(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    reset({
      username: user.username,
      bio: user.bio || '',
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : user.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${user.profileImage}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold"
                  style={{ display: user.profileImage ? 'none' : 'flex' }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <Camera size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <input
                      {...register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters',
                        },
                      })}
                      className="text-2xl font-bold input-field"
                      placeholder="Username"
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <textarea
                      {...register('bio', {
                        maxLength: {
                          value: 500,
                          message: 'Bio must be less than 500 characters',
                        },
                      })}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary">
                      <Save size={16} />
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">@{user.username}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
                    >
                      <Edit3 size={16} />
                      <span>Edit</span>
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {user.bio || 'No bio yet. Click edit to add one!'}
                  </p>

                  <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                    <span>{user.postsCount || 0} posts</span>
                    <span>Member since {format(new Date(user.createdAt || Date.now()), 'MMM yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900">
                  ${user.totalEarnings?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">
                  ${user.pendingEarnings?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    userStats?.engagement?.totalViews || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-xl font-bold text-gray-900">
                  {statsLoading ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    userStats?.engagement?.totalLikes || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Posts */}
        {userStats?.topPosts && userStats.topPosts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Posts</h2>
            <div className="space-y-4">
              {userStats.topPosts.map((post) => (
                <div key={post.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}${post.mediaUrl}`}
                      alt="Post"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjwvcnZnPgo='
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium truncate">{post.caption}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{post.stats.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{post.stats.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle size={14} />
                        <span>{post.stats.comments}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 font-medium">
                      ${post.stats.earnings.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State for Stats */}
        {statsLoading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600">Loading statistics...</span>
            </div>
          </div>
        )}

        {/* No Stats Message */}
        {!statsLoading && (!userStats || !userStats.topPosts || userStats.topPosts.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <MessageCircle size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Create your first post to start earning and see your statistics here!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile