import { configureStore } from '@reduxjs/toolkit'
import userCredReducer from './userCredSlice'
import worksReducer from './worksSlice'
import allUsersReducer from './allUsersSlice'

export const store = configureStore({
  reducer: {
    userCred : userCredReducer,
    works : worksReducer,
    allUsers : allUsersReducer,
  },
})