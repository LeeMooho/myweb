import { createAsyncThunk } from '@reduxjs/toolkit';
import { request, requestThunk } from '../../../shared/api/request';

export const getBoards = createAsyncThunk('board/getBoards',
    ({ searchCondition = 'all', searchKeyword = '', page = 0 } = {}, thunkAPI) =>
        requestThunk(signal => request({ path: '/board/board-list', signal,
            params: { searchCondition, searchKeyword, page } }), thunkAPI)
);

export const postBoard = createAsyncThunk('board/postBoard', (board, thunkAPI) =>
    requestThunk(async signal => (await request({
        method: 'post', path: '/board/board', data: board, signal
    })).pageItems, thunkAPI)
);

export const removeBoard = createAsyncThunk('board/removeBoard', (boardNo, thunkAPI) =>
    requestThunk(async signal => (await request({
        method: 'delete', path: `/board/board/${boardNo}`, signal
    })).pageItems, thunkAPI)
);

export const fetchBoard = boardNo => request({ path: `/board/board/${boardNo}` });
export const updateBoard = board => request({ method: 'put', path: '/board/board', data: board });
