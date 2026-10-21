import reducer, { selectUserId } from './authSlice';
import { login, logout } from '../api/authApi';

jest.mock('axios', () => ({}));

test('auth reducer changes identity without writing browser storage', () => {
    sessionStorage.clear();
    const state = reducer(undefined, login.fulfilled({ userId: 'alice', token: 'token' }, 'request', {}));
    expect(selectUserId({ auth: state })).toBe('alice');
    expect(state.isLogin).toBe(true);
    expect(sessionStorage.getItem('ACCESS_TOKEN')).toBeNull();
});

test('logout clears the identity without any board state dependency', () => {
    const state = reducer({ isLogin: true, loginUserId: 'alice' }, logout.fulfilled(null, 'request'));
    expect(state).toEqual({ isLogin: false, loginUserId: '' });
});
