import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import  UserService  from '../../bridge/UserOps'

// Başlangıç durumu
const initialState = {
  isLoggedIn: false,
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  isManager: false,
  id: 0,
  status: 'idle', // API çağrı durumu için
  error: null,    // Hata mesajları için
}

// Asenkron işleme: Kullanıcı bilgilerini çekme
export const pullUserCredentials = createAsyncThunk(
  'users/fetchSelf', // Action tipi
  async () => {
    const response = await UserService.getUserinfo() // Kullanıcı bilgilerini al
    return response
  }
)

export const userCredSlice = createSlice({
  name: 'userCred',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(pullUserCredentials.pending, (state) => {
        state.status = 'loading' // API çağrısı devam ediyor
      })
      .addCase(pullUserCredentials.fulfilled, (state, action) => {
        state.status = 'succeeded' // API çağrısı başarılı
        state.email = action.payload.email
        state.firstName = action.payload.first_name
        state.lastName = action.payload.last_name
        state.username = action.payload.username
        state.username = action.payload.username
        state.id = action.payload.id
        state.isManager = action.payload.isManager
        state.isLoggedIn = true
      })
      .addCase(pullUserCredentials.rejected, (state, action) => {
        state.status = 'failed' // API çağrısı başarısız oldu
        state.error = action.error.message
      })
  },
})

export const { /* setLoggedIn  */} = userCredSlice.actions

export default userCredSlice.reducer
