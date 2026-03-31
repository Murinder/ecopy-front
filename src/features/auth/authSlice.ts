import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TokenDto } from '../../services/coreApi';

interface AuthState {
  token?: TokenDto;
  userId?: string;
  userName?: string;
  userRole?: string;
  rememberMe: boolean;
}

const initialState: AuthState = {
  rememberMe: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<TokenDto | undefined>) {
      state.token = action.payload;
    },
    setUserId(state, action: PayloadAction<string | undefined>) {
      state.userId = action.payload;
    },
    setUserName(state, action: PayloadAction<string | undefined>) {
      state.userName = action.payload;
    },
    setUserRole(state, action: PayloadAction<string | undefined>) {
      state.userRole = action.payload;
    },
    setRememberMe(state, action: PayloadAction<boolean>) {
      state.rememberMe = action.payload;
    },
    logout(state) {
      state.token = undefined;
      state.userId = undefined;
      state.userName = undefined;
      state.userRole = undefined;
    },
  },
});

export const { setToken, setUserId, setUserName, setUserRole, setRememberMe, logout } =
  authSlice.actions;
export default authSlice.reducer;
