import { createSlice } from '@reduxjs/toolkit';
import { login, logout } from '../api/authApi';

export const initialAuthState = { isLogin: false, loginUserId: '' };

const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLogin = true;
            state.loginUserId = action.payload.userId;
        });
        builder.addCase(logout.fulfilled, () => initialAuthState);
    }
});

export const selectIsLoggedIn = state => state.auth.isLogin;
export const selectUserId = state => state.auth.loginUserId;
export default authSlice.reducer;
