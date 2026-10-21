import { createTransform } from 'redux-persist';
import { initialBoardState } from '../features/board';
import { initialAuthState } from '../features/auth';

export const persistedBoardState = state => {
    const { listStatus, listError, listRequestId, isLogin, loginUserId, ...data } = state;
    return data;
};

export const boardPersistence = createTransform(
    persistedBoardState,
    // redux-persist applies outbound transforms before migration; keep legacy auth here.
    state => state,
    { whitelist: ['boards'] }
);

// Existing sessions stored authentication inside boards; retain the separate token.
export const migratePersistedState = (state, token) => {
    if (!state) return state;
    if (!state.boards && !state.auth) return state;
    const previousAuth = state.auth || {
        isLogin: state.boards?.isLogin,
        loginUserId: state.boards?.loginUserId
    };
    const isLogin = Boolean(token && previousAuth.isLogin);
    return {
        ...state,
        boards: { ...initialBoardState, ...persistedBoardState(state.boards || {}) },
        auth: { ...initialAuthState, isLogin, loginUserId: isLogin ? previousAuth.loginUserId || '' : '' }
    };
};
