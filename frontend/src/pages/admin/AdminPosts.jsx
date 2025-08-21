// src/pages/admin/Posts.jsx
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPosts } from '../../store/adminSlice'
import { adminService } from '../../services/adminService'
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  Trash2,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminPosts = () => {
  const dispatch = useDispatch()
  const { posts, pagination, isLoading, error } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPosts, setSelectedPosts] = useState([])
  const [showDropdown, setShowDropdown] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    dispatch(fetchPosts({ 
      page: currentPage, 
      limit: 20,
      sortBy,
      sortOrder
    }))
  }, [dispatch, currentPage, sortBy, sortOrder])

  const handleDeletePost = async (postId) => {
    try {
      await adminService.deletePost(postId)
      toast.success('Post deleted successfully')
      dispatch(fetchPosts({ page: currentPage, limit: 20 }))
      setShowDeleteModal(null)
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(posts.map(post => post.id))
    }
  }

  const filteredPosts = posts.filter(post =>
    post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const DeleteConfirmModal = ({ post, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Post</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(post.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )

  if (isLoading && !posts.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3" />
            Posts Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all platform posts and content</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-1 items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="viewsCount">Views</option>
              <option value="likesCount">Likes</option>
              <option value="totalEarnings">Earnings</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Posts ({pagination.posts?.totalPosts || 0})
            </h2>
            {selectedPosts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedPosts.length} selected</span>
                <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                  Bulk Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className={selectedPosts.includes(post.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 relative">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={post.mediaUrl || '/default-post.jpg'}
                          alt=""
                        />
                        <div className="absolute top-1 right-1">
                          {post.mediaType === 'video' ? (
                            <Play className="h-3 w-3 text-white bg-black bg-opacity-50 rounded-full p-0.5" />
                          ) : (
                            <ImageIcon className="h-3 w-3 text-white bg-black bg-opacity-50 rounded-full p-0.5" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {post.caption}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.mediaType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={post.author.profileImage || '/default-avatar.png'}
                        alt=""
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          @{post.author.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.author.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1 text-blue-500" />
                        {post.analytics.viewsCount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1 text-red-500" />
                        {post.analytics.likesCount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1 text-green-500" />
                        {post.analytics.commentsCount.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">
                        ${post.analytics.totalEarnings.toFixed(2)}
                      </div>
                      <div className="text-xs">
                        Views: ${post.analytics.viewEarnings.toFixed(2)}
                      </div>
                      <div className="text-xs">
                        Likes: ${post.analytics.likeEarnings.toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    <div className="text-xs text-gray-400">
                      {format(new Date(post.createdAt), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      {showDropdown === post.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <button
                            onClick={() => {
                              setShowDeleteModal(post)
                              setShowDropdown(null)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 inline mr-2" />
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.posts?.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.posts.totalPosts)} of {pagination.posts.totalPosts} posts
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  {currentPage} of {pagination.posts.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.posts.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          post={showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          onConfirm={handleDeletePost}
        />
      )}
    </div>
  )
}

export default AdminPosts