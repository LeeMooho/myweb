import Join from './pages/Join';
import Login from './pages/Login';
import authReducer from './model/authSlice';
import { registerAuthListeners } from './model/listeners';

export { login, join, logout } from './api/authApi';
export { selectIsLoggedIn, selectUserId, initialAuthState } from './model/authSlice';

export const authModule = {
    id: 'auth',
    routes: [{ path: '/join', element: <Join /> }, { path: '/login', element: <Login /> }],
    reducers: { auth: authReducer },
    persistedReducers: ['auth'],
    registerListeners: registerAuthListeners
};
