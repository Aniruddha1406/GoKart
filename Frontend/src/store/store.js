import { configureStore } from '@reduxjs/toolkit';
import addressReducer from './slices/addressSlice';

export const store = configureStore({
  reducer: {
    addresses: addressReducer,
  },
});
