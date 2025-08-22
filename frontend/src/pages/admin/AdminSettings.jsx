import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSettings, updateSettings } from "../../store/adminSlice";
import {
  Settings as SettingsIcon,
  DollarSign,
  Upload,
  Zap,
  Save,
  RefreshCw,
  Image,
  Video,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const dispatch = useDispatch();
  const { settings: reduxSettings, isLoading, error } = useSelector(
    (state) => state.admin
  );

  const [settings, setSettings] = useState({
    rates: {
      viewRate: 0,
      likeRate: 0,
    },
    uploads: {
      maxFileSize: 10,
      allowedImageTypes: [],
      allowedVideoTypes: [],
    },
    features: {
      allowVideoUploads: true,
      allowImageUploads: true,
      enableEarnings: true,
    },
    platform: {
      platformName: "DedPost",
      currency: "USD",
      currencySymbol: "$",
    },
    payouts: {
      minPayoutAmount: 10,
      autoPayoutEnabled: false,
      autoPayoutThreshold: 100,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("rates");
  const [saving, setSaving] = useState(false);

  // Load settings from Redux
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Sync Redux settings into local state
  useEffect(() => {
    if (reduxSettings) {
      console.log('Redux settings received:', reduxSettings); // Debug log
      
      setSettings((prev) => ({
        ...prev,
        rates: {
          viewRate: reduxSettings.rates?.viewRate ?? prev.rates.viewRate,
          likeRate: reduxSettings.rates?.likeRate ?? prev.rates.likeRate,
        },
        uploads: {
          maxFileSize: reduxSettings.uploads?.maxFileSize ?? prev.uploads.maxFileSize,
          allowedImageTypes: reduxSettings.uploads?.allowedImageTypes ?? prev.uploads.allowedImageTypes,
          allowedVideoTypes: reduxSettings.uploads?.allowedVideoTypes ?? prev.uploads.allowedVideoTypes,
        },
        features: {
          allowVideoUploads: reduxSettings.features?.allowVideoUploads ?? prev.features.allowVideoUploads,
          allowImageUploads: reduxSettings.features?.allowImageUploads ?? prev.features.allowImageUploads,
          enableEarnings: reduxSettings.features?.enableEarnings ?? prev.features.enableEarnings,
        },
        platform: {
          platformName: reduxSettings.platform?.platformName ?? prev.platform.platformName,
          currency: reduxSettings.platform?.currency ?? prev.platform.currency,
          currencySymbol: reduxSettings.platform?.currencySymbol ?? prev.platform.currencySymbol,
        },
        payouts: {
          minPayoutAmount: reduxSettings.payouts?.minPayoutAmount ?? prev.payouts.minPayoutAmount,
          autoPayoutEnabled: reduxSettings.payouts?.autoPayoutEnabled ?? prev.payouts.autoPayoutEnabled,
          autoPayoutThreshold: reduxSettings.payouts?.autoPayoutThreshold ?? prev.payouts.autoPayoutThreshold,
        },
      }));
      
      // Reset hasChanges when new settings are loaded
      setHasChanges(false);
    }
  }, [reduxSettings]);

  const handleInputChange = (section, field, value) => {
    console.log('Input change:', section, field, value); // Debug log
    
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      const flatSettings = {
        // Rates
        viewRate: parseFloat(settings.rates.viewRate) || 0,
        likeRate: parseFloat(settings.rates.likeRate) || 0,

        // Platform
        platformName: settings.platform.platformName,
        currency: settings.platform.currency,
        currencySymbol: settings.platform.currencySymbol,

        // Uploads
        maxFileSize: parseInt(settings.uploads.maxFileSize) || 10,

        // Features
        allowVideoUploads: Boolean(settings.features.allowVideoUploads),
        allowImageUploads: Boolean(settings.features.allowImageUploads),
        enableEarnings: Boolean(settings.features.enableEarnings),

        // Payouts
        minPayoutAmount: parseFloat(settings.payouts.minPayoutAmount) || 10,
        autoPayoutEnabled: Boolean(settings.payouts.autoPayoutEnabled),
        autoPayoutThreshold: parseFloat(settings.payouts.autoPayoutThreshold) || 100,
      };

      console.log('Saving settings:', flatSettings); // Debug log

      await dispatch(updateSettings(flatSettings)).unwrap();
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "rates", label: "Earning Rates", icon: DollarSign },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "features", label: "Features", icon: Zap },
    { id: "platform", label: "Platform", icon: SettingsIcon },
  ];

  const TabContent = () => {
    switch (activeTab) {
      case "rates":
        return (
          <div className="max-w-7xl m-auto space-y-6">
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
                    {settings.platform.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={settings.rates.viewRate}
                    onChange={(e) =>
                      handleInputChange("rates", "viewRate", e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputChange(
                        "rates",
                        "viewRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Amount earned per post view
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Like Rate (per like)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {settings.platform.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={settings.rates.likeRate}
                    onChange={(e) =>
                      handleInputChange("rates", "likeRate", e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputChange(
                        "rates",
                        "likeRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Amount earned per post like
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Payout Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {settings.platform.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.payouts.minPayoutAmount}
                    onChange={(e) =>
                      handleInputChange("payouts", "minPayoutAmount", e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputChange(
                        "payouts",
                        "minPayoutAmount",
                        parseFloat(e.target.value) || 10
                      )
                    }
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Minimum amount before users can request payout
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Auto Payout Threshold
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {settings.platform.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.payouts.autoPayoutThreshold}
                    onChange={(e) =>
                      handleInputChange("payouts", "autoPayoutThreshold", e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputChange(
                        "payouts",
                        "autoPayoutThreshold",
                        parseFloat(e.target.value) || 100
                      )
                    }
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Amount at which auto payouts are triggered
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Rate Calculator
              </h4>
              <div className="text-sm text-blue-800">
                <p>If a post gets 1,000 views and 100 likes:</p>
                <p>
                  Total earnings: {settings.platform.currencySymbol}
                  {(
                    (parseFloat(settings.rates.viewRate) || 0) * 1000 +
                    (parseFloat(settings.rates.likeRate) || 0) * 100
                  ).toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        );

      case "platform":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <SettingsIcon className="mr-2" />
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
                  onChange={(e) =>
                    handleInputChange("platform", "platformName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  The name of your platform
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <input
                  type="text"
                  value={settings.platform.currency}
                  onChange={(e) =>
                    handleInputChange("platform", "currency", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Currency code (e.g., USD, EUR)
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.platform.currencySymbol}
                  onChange={(e) =>
                    handleInputChange("platform", "currencySymbol", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Symbol to display (e.g., $, €, £)
                </p>
              </div>
            </div>
          </div>
        );

      case "uploads":
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
                  onChange={(e) =>
                    handleInputChange(
                      "uploads",
                      "maxFileSize",
                      parseInt(e.target.value) || 10
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Maximum file size allowed for uploads
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Supported File Types
                </h4>
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
        );

      case "features":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="mr-2" />
              Platform Features
            </h3>

            <div className="space-y-6">
              {/* Enable Earnings */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900">
                      Enable Earnings System
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.enableEarnings}
                      onChange={(e) =>
                        handleInputChange(
                          "features",
                          "enableEarnings",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Allow users to earn money from views and likes
                </p>
              </div>

              {/* Auto Payouts */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900">
                      Enable Auto Payouts
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.payouts.autoPayoutEnabled}
                      onChange={(e) =>
                        handleInputChange(
                          "payouts",
                          "autoPayoutEnabled",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Automatically payout when users reach the threshold
                </p>
              </div>

              {/* Allow Image Uploads */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Image className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">
                      Allow Image Uploads
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowImageUploads}
                      onChange={(e) =>
                        handleInputChange(
                          "features",
                          "allowImageUploads",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Enable users to upload and share images
                </p>
              </div>

              {/* Allow Video Uploads */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Video className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-gray-900">
                      Allow Video Uploads
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowVideoUploads}
                      onChange={(e) =>
                        handleInputChange(
                          "features",
                          "allowVideoUploads",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  Enable users to upload and share videos
                </p>
              </div>

              {!settings.features.enableEarnings && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Earnings system is disabled. Users won't earn money from
                        their posts.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl m-auto pt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error loading settings
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
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
          <p className="text-gray-600 mt-1">
            Configure platform behavior and features
          </p>
        </div>

        {hasChanges && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-amber-600 flex items-center">
              <RefreshCw className="w-4 h-4 mr-1" />
              You have unsaved changes
            </span>
            <button
              onClick={handleSaveSettings}
              disabled={saving || isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && !reduxSettings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Content */}
      {reduxSettings && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <TabContent />
          </div>
        </div>
      )}

      {/* Save Button (Bottom) */}
      {hasChanges && reduxSettings && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving || isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Saving..." : "Save All Changes"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;