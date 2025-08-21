import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/auth'
import { checkAuth, setInitialized } from '../../store/authSlice'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth()

  useEffect(() => {
    if (!isInitialized) {
      // Try to authenticate from stored token
      const storedAuth = localStorage.getItem('dedpost-auth')
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth)
          if (parsed.token) {
            dispatch(checkAuth())
          } else {
            dispatch(setInitialized())
          }
        } catch {
          dispatch(setInitialized())
        }
      } else {
        dispatch(setInitialized())
      }
    }
  }, [dispatch, isInitialized])

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute