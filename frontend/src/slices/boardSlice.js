import {
    createSlice
} from '@reduxjs/toolkit';
import { getBoards, postBoard, removeBoard } from '../apis/boardApi';
import {login, join, logout} from '../apis/userApi';
import i18n from '../i18n';

const boardSlice = createSlice({
    name: 'boards',
    initialState: {
        isLogin: false,
        boards: [],
        searchCondition: 'all',
        searchKeyword: '',
        page: 0,
        loginUserId: ''
    },
    reducers: {
        change_searchCondition: (state, action) => ({
            ...state,
            searchCondition: action.payload
        }),
        change_searchKeyword: (state, action) => ({
            ...state,
            searchKeyword: action.payload
        })
    },
    extraReducers: (builder) => {
        builder.addCase(join.fulfilled, (state, action) => {
            alert(i18n.t('boardSlice.joinSucc'));
            window.location.href = '/login';
            
            return state;
        });
        builder.addCase(join.rejected, (state, action) => {
            alert(i18n.t('boardSlice.error'))
            console.log(action.payload);
            return state;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            sessionStorage.setItem("ACCESS_TOKEN", action.payload.token);

            return {
                ...state,
                isLogin: true,
                loginUserId: action.payload.userId
            };
        });
        builder.addCase(login.rejected, (state, action) => {
            if(action.payload === 200) {
                alert(i18n.t('boardSlice.idNotExist'));
            } else if(action.payload === 201) {
                alert(i18n.t('boardSlice.passwordWrong'));
            } else {
                alert(i18n.t('boardSlice.loginError'));
            }

            return state;
        });
        builder.addCase(getBoards.fulfilled, (state, action) => (
            {
                ...state,
                boards: action.payload.pageItems,
                searchCondition: action.payload.item.searchCondition,
                searchKeyword: action.payload.item.searchKeyword,
                page: action.payload.pageItems.pageable.pageNumber
            }
        ));
        builder.addCase(getBoards.rejected, (state, action) => {
            alert(i18n.t('boardSlice.getBoardFail'));
            console.log(action.payload);
            return state;
        });
        builder.addCase(postBoard.fulfilled, (state, action) => {
            alert(i18n.t('boardSlice.postBoardSucc'));

            return {
                ...state,
                boards: action.payload,
                searchCondition: 'all',
                searchKeyword: '',
                page: 0
            }
        });
        builder.addCase(postBoard.rejected, (state, action) => {
            alert(i18n.t('boardSlice.postBoardFail'));
            console.log(action.payload);
            return state;
        });
        builder.addCase(removeBoard.fulfilled, (state, action) => {
            alert(i18n.t('boardSlice.deleteBoardSucc'));

            return {
                ...state,
                boards: action.payload,
                page: 0,
                searchCondition: 'all',
                searchKeyword: ''
            }
        });
        builder.addCase(removeBoard.rejected, (state, action) => {
            alert(i18n.t('boardSlice.deleteBoardFail'));
            console.log(action.payload);
            return state;
        });
        builder.addCase(logout.fulfilled, (state, action) => {
            alert(i18n.t('boardSlice.logoutSucc'));
            sessionStorage.removeItem("ACCESS_TOKEN");

            return {
                ...state,
                isLogin: false
            }
        });
    }
});

export const {change_searchCondition, change_searchKeyword} = boardSlice.actions;

export default boardSlice.reducer;