/ src/hooks/usePosts.js
import { useSelector, useDispatch } from 'react-redux'
import { fetchFeed, createPost, likePost, addComment } from '../store/postSlice'

export const usePosts = () => {
  const dispatch = useDispatch()
  const { feed, currentPost, isLoading, hasMore, currentPage } = useSelector((state) => state.posts)

  const loadFeed = (page = 1) => {
    return dispatch(fetchFeed({ page }))
  }

  const createNewPost = (postData) => {
    return dispatch(createPost(postData))
  }

  const toggleLike = (postId) => {
    return dispatch(likePost(postId))
  }

  const addNewComment = (postId, content) => {
    return dispatch(addComment({ postId, content }))
  }

  return {
    feed,
    currentPost,
    isLoading,
    hasMore,
    currentPage,
    loadFeed,
    createNewPost,
    toggleLike,
    addNewComment,
  }
}
