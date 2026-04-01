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

function loadFromStorage(): Partial<AuthState> {
  try {
    const raw = localStorage.getItem('auth');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveToStorage(state: AuthState) {
  try {
    localStorage.setItem('auth', JSON.stringify({
      token: state.token,
      userId: state.userId,
      userName: state.userName,
      userRole: state.userRole,
      rememberMe: state.rememberMe,
    }));
  } catch { /* ignore */ }
}

function clearStorage() {
  try {
    localStorage.removeItem('auth');
  } catch { /* ignore */ }
}

const persisted = loadFromStorage();

const initialState: AuthState = {
  token: persisted.token,
  userId: persisted.userId,
  userName: persisted.userName,
  userRole: persisted.userRole,
  rememberMe: persisted.rememberMe ?? false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<TokenDto | undefined>) {
      state.token = action.payload;
      saveToStorage(state);
    },
    setUserId(state, action: PayloadAction<string | undefined>) {
      state.userId = action.payload;
      saveToStorage(state);
    },
    setUserName(state, action: PayloadAction<string | undefined>) {
      state.userName = action.payload;
      saveToStorage(state);
    },
    setUserRole(state, action: PayloadAction<string | undefined>) {
      state.userRole = action.payload;
      saveToStorage(state);
    },
    setRememberMe(state, action: PayloadAction<boolean>) {
      state.rememberMe = action.payload;
      saveToStorage(state);
    },
    logout(state) {
      state.token = undefined;
      state.userId = undefined;
      state.userName = undefined;
      state.userRole = undefined;
      clearStorage();
    },
  },
});

export const { setToken, setUserId, setUserName, setUserRole, setRememberMe, logout } =
  authSlice.actions;
export default authSlice.reducer;
