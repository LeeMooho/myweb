import BoardList from './pages/BoardList';
import Board from './pages/Board';
import Post from './pages/Post';
import boardReducer from './model/boardSlice';
import { registerBoardListeners } from './model/listeners';

export { initialBoardState } from './model/boardSlice';
export { getBoards, postBoard, removeBoard, fetchBoard, updateBoard } from './api/boardApi';

export const boardModule = {
    id: 'board',
    navigation: [{ path: '/board-list', labelKey: 'header.board' }],
    routes: [
        { path: '/board-list', element: <BoardList /> },
        { path: '/post', element: <Post /> },
        { path: '/board/:boardNo', element: <Board /> }
    ],
    reducers: { boards: boardReducer },
    persistedReducers: ['boards'],
    registerListeners: registerBoardListeners
};
