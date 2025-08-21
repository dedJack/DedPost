// src/hooks/useAdmin.js
import { useSelector, useDispatch } from 'react-redux'
import { 
  fetchDashboard, 
  fetchUsers, 
  fetchPosts, 
  fetchPayouts,
  updateSettings,
  approvePayout 
} from '../store/adminSlice'

export const useAdmin = () => {
  const dispatch = useDispatch()
  const { dashboard, users, posts, payouts, settings, isLoading, pagination } = useSelector((state) => state.admin)

  const loadDashboard = () => {
    return dispatch(fetchDashboard())
  }

  const loadUsers = (page = 1, limit = 20) => {
    return dispatch(fetchUsers({ page, limit }))
  }

  const loadPosts = (page = 1, limit = 20) => {
    return dispatch(fetchPosts({ page, limit }))
  }

  const loadPayouts = (page = 1, limit = 20) => {
    return dispatch(fetchPayouts({ page, limit }))
  }

  const updatePlatformSettings = (settingsData) => {
    return dispatch(updateSettings(settingsData))
  }

  const approveUserPayout = (userId, amount) => {
    return dispatch(approvePayout({ userId, amount }))
  }

  return {
    dashboard,
    users,
    posts,
    payouts,
    settings,
    isLoading,
    pagination,
    loadDashboard,
    loadUsers,
    loadPosts,
    loadPayouts,
    updatePlatformSettings,
    approveUserPayout,
  }
}