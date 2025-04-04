import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import WorkService from '../../bridge/WorkOps'; // İş servisiniz


// Başlangıç durumu
const initialState = {
  worksList: [], // İş verilerini tutacak array
  status: 'idle', // API çağrısının durumu (idle, loading, succeeded, failed)
  error: null, // Hata durumu
};

// Asenkron işleme: İş verilerini çekme
export const pullWorks = createAsyncThunk(
  'works/fetchWorks', // Action tipi
  async () => {
    const response = await WorkService.getWorks(); // İş verilerini al
    return response; // Dönen veriyi return et
  }
);

export const pullWorksAsAdmin = createAsyncThunk(
  'works/fetchWorksasAdmin', // Action tipi
  async ({ user, company, date}) => {
    const response = await WorkService.getAllWorksAsManager(user,company,date); // İş verilerini al
    return response; // Dönen veriyi return et
  }
);

// Yeni çalışma eklemek için async thunk
export const addNewWork = createAsyncThunk(
  'works/addNewWork',
  async ({ company, about, work_hour, date }) => {
    const response = await WorkService.create(company, about, work_hour, date); // İş verilerini al
    return response; // Dönen veriyi return et
  }
);

export const deleteWork = createAsyncThunk(
  'works/deleteWork',
  async (id) => {
    const response = await WorkService.delete(id); // İş verilerini al
    return response; // Dönen veriyi return et
  }
);


// Slice tanımlaması
export const worksSlice = createSlice({
  name: 'works', // Slice ismi
  initialState, // Başlangıç durumu
  reducers: {}, // Reducer tanımlamaları, burada bir şey eklenmedi
  extraReducers: (builder) => {
    builder
      .addCase(pullWorks.pending, (state) => {
        state.status = 'loading'; // API çağrısı devam ediyor
      })
      .addCase(pullWorks.fulfilled, (state, action) => {
        state.status = 'succeeded'; // API çağrısı başarılı
        state.worksList = action.payload; // Gelen veriyi works array'ine ekle
      })
      .addCase(pullWorks.rejected, (state, action) => {
        state.status = 'failed'; // API çağrısı başarısız
        state.error = action.error.message; // Hata mesajını state'e ekle
      })

      .addCase(addNewWork.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addNewWork.fulfilled, (state, action) => {
        state.status = 'succeeded';
        pullWorks()
        //state.worksList.push(action.payload);
      })
      .addCase(addNewWork.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Ekleme başarısız oldu';
      })


      .addCase(deleteWork.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteWork.fulfilled, (state, action) => {
        state.status = 'succeeded';
        pullWorks()
      })
      .addCase(deleteWork.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Silme başarısız oldu';
      })


      .addCase(pullWorksAsAdmin.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(pullWorksAsAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.worksList = action.payload;
      })
      .addCase(pullWorksAsAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      
      ;
  },
});

// Reducer'ı dışa aktar
export default worksSlice.reducer;
