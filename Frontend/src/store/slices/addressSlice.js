import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/api/auth/addresses`;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchAddresses = createAsyncThunk('addresses/fetchAll', async () => {
  const response = await axios.get(API, authHeaders());
  return response.data;
});

export const addAddress = createAsyncThunk('addresses/add', async (addressData) => {
  const response = await axios.post(API, addressData, authHeaders());
  return response.data;
});

export const deleteAddress = createAsyncThunk('addresses/delete', async (id) => {
  await axios.delete(`${API}/${id}`, authHeaders());
  return id;
});

const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // addAddress
      .addCase(addAddress.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // deleteAddress
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.list = state.list.filter(addr => addr._id !== action.payload);
      });
  }
});

export default addressSlice.reducer;
