// src/pages/admin/Payouts.jsx
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPayouts, approvePayout } from '../../store/adminSlice'
import { adminService } from '../../services/adminService'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Check,
  X,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const AdminPayouts = () => {
  const dispatch = useDispatch()
  const { payouts, pagination, isLoading, error } = useSelector((state) => state.admin)
  const [searchTerm, setSearchTerm] = useState('')
  const [minAmount, setMinAmount] = useState(0)
  const [sortBy, setSortBy] = useState('pendingEarnings')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPayouts, setSelectedPayouts] = useState([])
  const [showApprovalModal, setShowApprovalModal] = useState(null)
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState(false)
  const [payoutSummary, setPayoutSummary] = useState(null)

  useEffect(() => {
    fetchPayoutsData()
  }, [currentPage, minAmount, sortBy, sortOrder])

  const fetchPayoutsData = async () => {
    try {
      dispatch(fetchPayouts({ 
        page: currentPage, 
        limit: 20,
        minAmount,
        sortBy,
        sortOrder
      }))
    } catch (error) {
      toast.error('Failed to fetch payout data')
    }
  }

  const handleApprovePayout = async (userId, amount) => {
    try {
      await dispatch(approvePayout({ userId, amount })).unwrap()
      setShowApprovalModal(null)
      fetchPayoutsData() // Refresh data
    } catch (error) {
      // Error is already handled in the thunk
    }
  }

  const handleBulkApprovePayout = async () => {
    try {
      const payoutRequests = selectedPayouts.map(userId => {
        const user = payouts.find(p => p.id === userId)
        return {
          userId,
          amount: user.earnings.pendingEarnings
        }
      })

      await adminService.bulkApprovePayout(payoutRequests)
      toast.success('Bulk payouts approved successfully!')
      setShowBulkApprovalModal(false)
      setSelectedPayouts([])
      fetchPayoutsData()
    } catch (error) {
      toast.error('Failed to process bulk payouts')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleSelectPayout = (userId) => {
    setSelectedPayouts(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedPayouts.length === payouts.length) {
      setSelectedPayouts([])
    } else {
      setSelectedPayouts(payouts.map(payout => payout.id))
    }
  }

  const filteredPayouts = payouts.filter(payout =>
    payout.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSelectedAmount = selectedPayouts.reduce((sum, userId) => {
    const user = payouts.find(p => p.id === userId)
    return sum + (user?.earnings.pendingEarnings || 0)
  }, 0)

  const ApprovalModal = ({ user, onClose, onConfirm }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Payout</h3>
        
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user.profileImage || '/default-avatar.png'}
              alt=""
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">@{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Previously Paid:</span>
              <span className="text-sm text-gray-600">
                ${user.earnings.paidEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to approve this payout? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user.id, user.earnings.pendingEarnings)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve Payout
          </button>
        </div>
      </div>
    </div>
  )

  const BulkApprovalModal = ({ onClose, onConfirm, selectedCount, totalAmount }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Approve Payouts</h3>
        
        <div className="mb-6">
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Selected Users:</span>
              <span className="font-medium text-gray-900">{selectedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <p className="text-gray-600">
            Are you sure you want to approve all selected payouts? This will process {selectedCount} payouts totaling ${totalAmount.toFixed(2)}.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve All
          </button>
        </div>
      </div>
    </div>
  )

  if (isLoading && !payouts.length) {
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
            <CreditCard className="mr-3" />
            Payout Management
          </h1>
          <p className="text-gray-600 mt-1">Manage user payouts and earnings</p>
        </div>
        
        {selectedPayouts.length > 0 && (
          <button
            onClick={() => setShowBulkApprovalModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            <span>Bulk Approve ({selectedPayouts.length})</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payable</p>
              <p className="text-2xl font-bold text-green-600">
                ${payouts.reduce((sum, p) => sum + p.earnings.pendingEarnings, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Users</p>
              <p className="text-2xl font-bold text-blue-600">{payouts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Payout</p>
              <p className="text-2xl font-bold text-purple-600">
                ${payouts.length > 0 ? (payouts.reduce((sum, p) => sum + p.earnings.pendingEarnings, 0) / payouts.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected Amount</p>
              <p className="text-2xl font-bold text-orange-600">
                ${totalSelectedAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Check className="h-6 w-6 text-orange-600" />
            </div>
          </div>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Min Amount:</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pendingEarnings">Pending Amount</option>
              <option value="totalEarnings">Total Earnings</option>
              <option value="username">Username</option>
              <option value="memberSince">Member Since</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Payouts ({filteredPayouts.length})
            </h2>
            {selectedPayouts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedPayouts.length} selected</span>
                <span className="text-sm font-medium text-green-600">
                  ${totalSelectedAmount.toFixed(2)}
                </span>
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
                    checked={selectedPayouts.length === payouts.length && payouts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayouts.map((payout) => (
                <tr key={payout.id} className={selectedPayouts.includes(payout.id) ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPayouts.includes(payout.id)}
                      onChange={() => handleSelectPayout(payout.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={payout.profileImage || '/default-avatar.png'}
                        alt=""
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          @{payout.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payout.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {payout.postsCount} posts
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div className="font-bold text-green-600 text-base">
                        ${payout.earnings.pendingEarnings.toFixed(2)}
                      </div>
                      <div className="text-xs">
                        Total: ${payout.earnings.totalEarnings.toFixed(2)}
                      </div>
                      <div className="text-xs">
                        Paid: ${payout.earnings.paidEarnings.toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(payout.memberSince), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setShowApprovalModal(payout)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.payouts?.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.payouts.totalUsers)} of {pagination.payouts.totalUsers} users
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
                  {currentPage} of {pagination.payouts.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.payouts.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showApprovalModal && (
        <ApprovalModal
          user={showApprovalModal}
          onClose={() => setShowApprovalModal(null)}
          onConfirm={handleApprovePayout}
        />
      )}

      {showBulkApprovalModal && (
        <BulkApprovalModal
          selectedCount={selectedPayouts.length}
          totalAmount={totalSelectedAmount}
          onClose={() => setShowBulkApprovalModal(false)}
          onConfirm={handleBulkApprovePayout}
        />
      )}
    </div>
  )
}

export default AdminPayouts
