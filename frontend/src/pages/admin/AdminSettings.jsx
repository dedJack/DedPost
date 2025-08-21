import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateSettings } from '../../store/adminSlice'
import { adminService } from '../../services/adminService'
import { 
  Settings as SettingsIcon, 
  DollarSign,
  Upload,
  Zap,
  Save,
  RefreshCw,
  Globe,
  CreditCard,
  Image,
  Video,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.admin)
  
  const [settings, setSettings] = useState({
    rates: {
      viewRate: 0,
      likeRate: 0
    },
    platform: {
      platformName: '',
      currency: 'USD',
      currencySymbol: '$'
    },
    uploads: {
      maxFileSize: 10,
      allowedImageTypes: [],
      allowedVideoTypes: []
    },
    features: {
      allowVideoUploads: true,
      allowImageUploads: true,
      enableEarnings: true
    }
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('rates')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await adminService.getSettings()
      setSettings(response.settings)
    } catch (error) {
      toast.error('Failed to fetch settings')
    }
  }

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async () => {
    try {
      const flatSettings = {
        // Rates
        viewRate: settings.rates.viewRate,
        likeRate: settings.rates.likeRate,
        
        // Platform
        platformName: settings.platform.platformName,
        currency: settings.platform.currency,
        currencySymbol: settings.platform.currencySymbol,
        
        // Uploads
        maxFileSize: settings.uploads.maxFileSize,
        
        // Features
        allowVideoUploads: settings.features.allowVideoUploads,
        allowImageUploads: settings.features.allowImageUploads,
        enableEarnings: settings.features.enableEarnings
      }

      await dispatch(updateSettings(flatSettings)).unwrap()
      setHasChanges(false)
      fetchSettings() // Refresh to get updated settings
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const tabs = [
    { id: 'rates', label: 'Earning Rates', icon: DollarSign },
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'features', label: 'Features', icon: Zap }
  ]

  const TabContent = () => {
    switch (activeTab) {
      case 'rates':
        return (
          <div className=" max-w-7xl m-auto space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="mr-2" />
              Earning Rates Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  View Rate (per view)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={settings.rates.viewRate}
                    onChange={(e) => handleInputChange('rates', 'viewRate', parseFloat(e.target.value) || 0)}
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">Amount earned per post view</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Like Rate (per like)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={settings.rates.likeRate}
                    onChange={(e) => handleInputChange('rates', 'likeRate', parseFloat(e.target.value) || 0)}
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">Amount earned per post like</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Rate Calculator</h4>
              <div className="text-sm text-blue-800">
                <p>If a post gets 1,000 views and 100 likes:</p>
                <p>Total earnings: ${((settings.rates.viewRate * 1000) + (settings.rates.likeRate * 100)).toFixed(3)}</p>
              </div>
            </div>
          </div>
        )

      case 'platform':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="mr-2" />
              Platform Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platform.platformName}
                  onChange={(e) => handleInputChange('platform', 'platformName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Platform Name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  value={settings.platform.currency}
                  onChange={(e) => {
                    handleInputChange('platform', 'currency', e.target.value)
                    // Auto-update currency symbol
                    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }
                    handleInputChange('platform', 'currencySymbol', symbols[e.target.value] || '$')
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  maxLength="3"
                  value={settings.platform.currencySymbol}
                  onChange={(e) => handleInputChange('platform', 'currencySymbol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )

      case 'uploads':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className="mr-2" />
              Upload Settings
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.uploads.maxFileSize}
                  onChange={(e) => handleInputChange('uploads', 'maxFileSize', parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">Maximum file size allowed for uploads</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Supported File Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Image className="w-4 h-4 mr-1" />
                      Images
                    </h5>
                    <div className="text-xs text-gray-600">
                      JPG, JPEG, PNG, GIF, WebP
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Video className="w-4 h-4 mr-1" />
                      Videos
                    </h5>
                    <div className="text-xs text-gray-600">
                      MP4, WebM, MOV, AVI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

  

      case 'features':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="mr-2" />
              Platform Features
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900">Enable Earnings System</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.enableEarnings}
                      onChange={(e) => handleInputChange('features', 'enableEarnings', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">Allow users to earn money from views and likes</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Allow Image Uploads</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowImageUploads}
                      onChange={(e) => handleInputChange('features', 'allowImageUploads', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">Enable users to upload and share images</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-900">Allow Video Uploads</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowVideoUploads}
                      onChange={(e) => handleInputChange('features', 'allowVideoUploads', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">Enable users to upload and share videos</p>
              </div>

              {!settings.features.enableEarnings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Earnings system is disabled. Users won't earn money from their posts.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl m-auto pt-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="mr-3" />
            Platform Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure platform behavior and features</p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-amber-600 flex items-center">
              <RefreshCw className="w-4 h-4 mr-1" />
              You have unsaved changes
            </span>
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <TabContent />
        </div>
      </div>

      {/* Save Button (Bottom) */}
      {hasChanges && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminSettings