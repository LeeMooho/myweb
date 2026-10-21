import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../config';

const authorizationHeaders = () => {
    const token = sessionStorage.getItem('ACCESS_TOKEN');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Keep rejected actions serializable; Axios errors contain request objects.
const requestBoard = async (request, thunkAPI) => {
    try {
        const response = await request({
            headers: authorizationHeaders(),
            signal: thunkAPI.signal
        });
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue({
            status: error.response?.status ?? null,
            message: error.response?.data?.errorMessage || error.message || 'Request failed'
        });
    }
};

export const getBoards = createAsyncThunk(
    'board/getBoards',
    async ({ searchCondition = 'all', searchKeyword = '', page = 0 } = {}, thunkAPI) =>
        requestBoard(config => axios.get(`${API_URL}/board/board-list`, {
            ...config,
            params: { searchCondition, searchKeyword, page }
        }), thunkAPI)
);

export const postBoard = createAsyncThunk(
    'board/postBoard',
    async (board, thunkAPI) => {
        // The browser supplies the multipart boundary for FormData.
        const result = await requestBoard(
            config => axios.post(`${API_URL}/board/board`, board, config), thunkAPI
        );
        return result?.pageItems ?? result;
    }
);

export const removeBoard = createAsyncThunk(
    'board/removeBoard',
    async (boardNo, thunkAPI) => {
        const result = await requestBoard(
            config => axios.delete(`${API_URL}/board/board/${boardNo}`, config), thunkAPI
        );
        return result?.pageItems ?? result;
    }
);
