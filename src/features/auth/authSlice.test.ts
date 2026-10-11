import { describe, expect, it } from 'vitest';
import authReducer, { logout, setRememberMe, setUserName } from './authSlice';

describe('auth reducer', () => {
  it('creates an unauthenticated initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });

    expect(state).toMatchObject({
      token: undefined,
      userId: undefined,
      userName: undefined,
      userRole: undefined,
      rememberMe: false,
    });
  });

  it('stores user preferences and clears identity on logout', () => {
    let state = authReducer(undefined, setUserName('Тестовый пользователь'));
    state = authReducer(state, setRememberMe(true));

    expect(state.userName).toBe('Тестовый пользователь');
    expect(state.rememberMe).toBe(true);

    state = authReducer(state, logout());

    expect(state.userName).toBeUndefined();
    expect(state.token).toBeUndefined();
    expect(state.rememberMe).toBe(true);
  });
});
