// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import postSlice from './postSlice'
import userSlice from './userSlice'
import adminSlice from './adminSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    posts: postSlice,
    users: userSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

