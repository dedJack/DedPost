// src/hooks/useUsers.js
import { useSelector, useDispatch } from 'react-redux'
import { searchUsers, fetchUserProfile, fetchUserStats } from '../store/userSlice'

export const useUsers = () => {
  const dispatch = useDispatch()
  const { searchResults, currentUserProfile, userStats, isLoading } = useSelector((state) => state.users)

  const search = (query, page = 1) => {
    return dispatch(searchUsers({ query, page }))
  }

  const getUserProfile = (userId) => {
    return dispatch(fetchUserProfile(userId))
  }

  const getUserStats = (userId) => {
    return dispatch(fetchUserStats(userId))
  }

  return {
    searchResults,
    currentUserProfile,
    userStats,
    isLoading,
    search,
    getUserProfile,
    getUserStats,
  }
}
