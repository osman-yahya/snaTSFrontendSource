// allUsersSlice.js (güncellenmiş versiyon)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../../bridge/UserOps';

// Başlangıç durumu
const initialState = {
  users: [],
  status: 'idle', // 'Usersstatus' yerine tutarlılık için 'status' kullanıyoruz
  error: null,    // 'Userserror' yerine 'error'
};

// Asenkron işleme: Kullanıcı bilgilerini çekme
export const pullAllUsers = createAsyncThunk(
  'allUsers/fetchAll', // Daha tutarlı bir action tipi
  async (_, { rejectWithValue }) => {
    try {
      const response = await UserService.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserRole = createAsyncThunk(
  'allUsers/toggleRole', // Daha tutarlı bir action tipi
  async ({id}, { rejectWithValue }) => {
    try {
      const response = await UserService.toggleUserRole(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const allUsersSlice = createSlice({
  name: 'allUsers', // 'userCred' yerine daha anlamlı bir isim
  initialState,
  reducers: {
    // Gerekirse buraya reducer'lar eklenebilir
    resetUsersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(pullAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Hata durumunu sıfırla
      })
      .addCase(pullAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(pullAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })



      .addCase(toggleUserRole.pending, (state) => {
        state.status = 'loading';
        state.error = null; // Hata durumunu sıfırla
      })
      .addCase(toggleUserRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        //pullAllUsers()
      })
      .addCase(toggleUserRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })


      ;
  },
});

export const { resetUsersState } = allUsersSlice.actions;

export default allUsersSlice.reducer;