import { createAsyncThunk } from '@reduxjs/toolkit';
import { request, requestThunk } from '../../../shared/api/request';

export const join = createAsyncThunk('user/join', (user, thunkAPI) =>
    requestThunk(async signal => (await request({
        method: 'post', path: '/user/join', data: user, signal, authenticated: false
    })).item, thunkAPI)
);

export const login = createAsyncThunk('user/login', (user, thunkAPI) =>
    requestThunk(async signal => (await request({
        method: 'post', path: '/user/login', data: user, signal, authenticated: false
    })).item, thunkAPI)
);

export const logout = createAsyncThunk('user/logout', (_, thunkAPI) =>
    requestThunk(async signal => (await request({ path: '/user/logout', signal })).item, thunkAPI)
);

export const checkUserId = userId => request({
    method: 'post', path: '/user/id-check', data: { userId }, authenticated: false
});
