// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeed } from "../store/postSlice";
import PostCard from "../components/posts/PostCard";
import Loading from "../components/common/Loading";
import { RefreshCw } from "lucide-react";

const Home = () => {
  const dispatch = useDispatch();
  const { feed, isLoading, hasMore, currentPage } = useSelector(
    (state) => state.posts
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (feed.length === 0) {
      dispatch(fetchFeed({ page: 1 }));
    }
  }, [dispatch, feed.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchFeed({ page: 1 }));
    setIsRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      dispatch(fetchFeed({ page: currentPage + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home Feed</h1>
            <p className="text-gray-600">Discover what's trending</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-primary hover:text-blue-600 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {feed.map((post) => (
            
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Loading More */}
        {isLoading && feed.length > 0 && (
          <div className="mt-8">
            <Loading text="Loading more posts..." />
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !isLoading && feed.length > 0 && (
          <div className="mt-8 text-center">
            <button onClick={loadMore} className="btn-primary">
              Load More Posts
            </button>
          </div>
        )}

        {/* No More Posts */}
        {!hasMore && feed.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            <p>You've reached the end! 🎉</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && feed.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">📱</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share something amazing!
            </p>
            <a href="/create-post" className="btn-primary">
              Create Your First Post
            </a>
          </div>
        )}

        {/* Initial Loading */}
        {isLoading && feed.length === 0 && (
          <Loading text="Loading your feed..." />
        )}
      </div>
    </div>
  );
};

export default Home;
