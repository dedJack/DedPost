import { useSelector } from 'react-redux'

export const useAuth = () => {
  const auth = useSelector((state) => state.auth)

  return {
    ...auth,
    isAdmin: auth.user?.role === 'admin',
    isUser: auth.user?.role === 'user',
  }
}
