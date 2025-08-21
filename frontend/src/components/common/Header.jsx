// src/components/common/Header.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import { 
  Home, 
  PlusCircle, 
  User, 
  Search, 
  LogOut, 
  Settings,
  BarChart3,
  Menu,
  X
} from 'lucide-react'

const Header = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DedPost</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            <Link
              to="/create-post"
              className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
            >
              <PlusCircle size={20} />
              <span>Create</span>
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
              >
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button className="md:hidden p-2 text-gray-400 hover:text-gray-600">
              <Search size={20} />
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                {user?.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${user.profileImage}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user?.username}
                </span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    </>
                  )}
                  
                  <hr className="my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>

              <Link
                to="/create-post"
                className="flex items-center space-x-2 text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlusCircle size={20} />
                <span>Create Post</span>
              </Link>

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-2 text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <BarChart3 size={20} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header