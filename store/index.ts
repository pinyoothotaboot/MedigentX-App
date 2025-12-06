
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import appReducer from './appSlice';
import patientsReducer from './patientsSlice';
import chatReducer from './chatSlice';
import notesReducer from './notesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    patients: patientsReducer,
    chat: chatReducer,
    notes: notesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For non-serializable data in prototypes/mocks
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
