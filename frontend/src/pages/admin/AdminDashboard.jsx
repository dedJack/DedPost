// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboard } from "../../store/adminSlice";
import {
  Users,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { usePlatformSettings } from "../../hooks/usePlatformSettings";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, isLoading, error } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [imageLoading, setImageLoading] = useState({});
  const { formatCurrency } = usePlatformSettings();

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(fetchDashboard())
        .unwrap()
        .then((data) => {
          console.log("Dashboard data:", data);
        })
        .catch((error) => {
          console.error("Failed to fetch dashboard:", error);
        });
    }
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error loading dashboard: {error}
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = dashboard.statistics;

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Posts",
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "bg-purple-500",
    },
    {
      title: "Total Likes",
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: "bg-pink-500",
    },
    {
      title: "Total Comments",
      value: stats.totalComments.toLocaleString(),
      icon: MessageCircle,
      color: "bg-indigo-500",
    },
    {
      title: "Total Earnings",
      value: formatCurrency(stats.totalEarnings),
      icon: DollarSign,
      color: "bg-yellow-500",
    },
    {
      title: "Pending Payouts",
      value: formatCurrency(stats.totalPayable),
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  // Add this helper function at the top of the file
  const getImageUrl = (path) => {
    if (!path) return "/default-post.jpg";
    return path.startsWith("http")
      ? path
      : `${import.meta.env.VITE_API_BASE_URL}${path}`;
  };

  return (
    <div className="max-w-7xl m-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.username}</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {format(new Date(), "MMM dd, yyyy HH:mm")}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Rates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Current Earning Rates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">View Rate</p>
            <p className="text-xl font-bold text-blue-600">
              ${dashboard.currentRates?.viewRate || 0}
            </p>
            <p className="text-xs text-gray-500">per view</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Like Rate</p>
            <p className="text-xl font-bold text-green-600">
              ${dashboard.currentRates?.likeRate || 0}
            </p>
            <p className="text-xs text-gray-500">per like</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Earnings</p>
            <p
              className={`text-xl font-bold ${
                dashboard.currentRates?.enableEarnings
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {dashboard.currentRates?.enableEarnings ? "Enabled" : "Disabled"}
            </p>
            <p className="text-xs text-gray-500">status</p>
          </div>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Posts
          </h3>
          {dashboard.recentPosts?.length > 0 ? (
            <div className="space-y-4">
              {dashboard.recentPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  {post.mediaType === "video" ? (
                    <video
                      key={post.id}
                      className="w-12 h-12 object-cover rounded"
                      src={getImageUrl(post.mediaUrl)}
                      muted
                      autoPlay
                      loop
                      playsInline
                      onError={(e) => {
                        console.error("Video load error:", e);
                        e.target.poster = "/default-post.jpg"; // fallback poster
                      }}
                    />
                  ) : (
                    <img
                      src={getImageUrl(post.mediaUrl)}
                      alt="Post"
                      className={`w-12 h-12 object-cover rounded ${
                        imageLoading[post.id] ? "animate-pulse bg-gray-200" : ""
                      }`}
                      onError={(e) => {
                        e.target.src = "/default-post.jpg";
                        setImageLoading((prev) => ({
                          ...prev,
                          [post.id]: false,
                        }));
                      }}
                      onLoad={() =>
                        setImageLoading((prev) => ({
                          ...prev,
                          [post.id]: false,
                        }))
                      }
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.caption}
                    </p>
                    <p className="text-xs text-gray-500">
                      by @{post.author?.username} •{" "}
                      {format(new Date(post.createdAt), "MMM dd")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(post.totalEarnings || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {post.viewsCount || 0} views • {post.likesCount || 0}{" "}
                      likes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent posts found
            </div>
          )}
        </div>

        {/* Top Earning Posts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Earning Posts
          </h3>
          <div className="space-y-4">
            {dashboard.topEarningPosts?.map((post, index) => (
              <div
                key={post._id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full">
                    {index + 1}
                  </span>
                </div>
                <img
                  src={getImageUrl(post.mediaUrl)}
                  alt="Post"
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    e.target.src = "/default-post.jpg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {post.caption}
                  </p>
                  <p className="text-xs text-gray-500">
                    by @{post.author?.username}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(post.totalEarnings || 0)}
                  </p>
                  <div className="flex space-x-2 text-xs text-gray-500">
                    <span>{post.viewsCount || 0} views</span>
                    <span>{post.likesCount || 0} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
