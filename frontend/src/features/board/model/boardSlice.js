import { createSlice } from '@reduxjs/toolkit';
import { getBoards, postBoard, removeBoard } from '../api/boardApi';

export const initialBoardState = {
    boards: [], searchCondition: 'all', searchKeyword: '', page: 0,
    listStatus: 'idle', listError: null, listRequestId: null
};

const boardSlice = createSlice({
    name: 'boards',
    initialState: initialBoardState,
    reducers: {
        change_searchCondition: (state, action) => { state.searchCondition = action.payload; },
        change_searchKeyword: (state, action) => { state.searchKeyword = action.payload; }
    },
    extraReducers: builder => {
        builder.addCase(getBoards.pending, (state, action) => {
            state.listStatus = 'loading';
            state.listError = null;
            state.listRequestId = action.meta.requestId;
        });
        builder.addCase(getBoards.fulfilled, (state, action) => {
            if (state.listRequestId !== action.meta.requestId) return;
            state.boards = action.payload.pageItems;
            state.searchCondition = action.payload.item.searchCondition;
            state.searchKeyword = action.payload.item.searchKeyword;
            state.page = action.payload.pageItems.number ?? action.payload.pageItems.pageable?.pageNumber ?? 0;
            state.listStatus = 'succeeded';
            state.listError = null;
            state.listRequestId = null;
        });
        builder.addCase(getBoards.rejected, (state, action) => {
            if (state.listRequestId !== action.meta.requestId) return;
            state.listStatus = action.meta.aborted ? 'idle' : 'failed';
            state.listError = action.meta.aborted ? null : (action.payload?.message || action.error.message);
            state.listRequestId = null;
        });
        builder.addCase(postBoard.fulfilled, (state, action) => {
            state.boards = action.payload;
            state.searchCondition = 'all';
            state.searchKeyword = '';
            state.page = 0;
        });
        builder.addCase(removeBoard.fulfilled, (state, action) => {
            state.boards = action.payload;
            state.searchCondition = 'all';
            state.searchKeyword = '';
            state.page = 0;
        });
    }
});

export const { change_searchCondition, change_searchKeyword } = boardSlice.actions;
export default boardSlice.reducer;
