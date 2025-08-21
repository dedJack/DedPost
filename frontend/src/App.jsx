import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuth } from './store/authSlice'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/common/ProtectedRoute'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Loading from './components/common/Loading'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import CreatePost from './pages/CreatePost'
import PostDetails from './components/posts/PostDetail'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPosts from './pages/admin/AdminPosts'
import AdminPayouts from './pages/admin/AdminPayouts'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  const dispatch = useDispatch()
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (isLoading) {
    return <Loading />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  user?.role === 'admin' ? 
                    <Navigate to="/admin/dashboard" replace /> : 
                    <Navigate to="/" replace />
                ) : (
                  <Login />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? (
                  user?.role === 'admin' ? 
                    <Navigate to="/admin/dashboard" replace /> : 
                    <Navigate to="/" replace />
                ) : (
                  <Register />
                )
              } 
            />

            {/* Protected User Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-post"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts/:postId"
              element={
                <ProtectedRoute>
                  <PostDetails />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payouts"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPayouts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route 
              path="*" 
              element={
                <div className="text-center py-20">
                  <h1 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h1>
                  <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
                </div>
              } 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default App