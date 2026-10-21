import { persistStore } from 'redux-persist';
import { createAppStore, persiststore } from './store';
import { migratePersistedState } from './persistence';
import { login, join, logout } from '../features/auth';

jest.mock('axios', () => ({}));
jest.mock('../i18n', () => ({ t: key => key }));

const effects = () => ({ notify: jest.fn(), redirect: jest.fn(), session: {
    get: jest.fn(() => 'session-token'), set: jest.fn(), clear: jest.fn()
} });
beforeAll(() => persiststore.pause());

const oldSession = {
    boards: { isLogin: true, loginUserId: 'alice', boards: { content: [] },
        page: 2, searchCondition: 'title', searchKeyword: 'saved search',
        listStatus: 'loading', listError: 'old error', listRequestId: 'old-request' },
    _persist: { version: -1, rehydrated: true }
};

test('login/logout side effects belong to the module listeners', () => {
    const services = effects();
    const store = createAppStore({ persist: false, effects: services });
    store.dispatch(login.fulfilled({ userId: 'alice', token: 'new-token' }, 'login', {}));
    expect(store.getState().auth).toEqual({ isLogin: true, loginUserId: 'alice' });
    expect(store.getState().boards).not.toHaveProperty('loginUserId');
    expect(services.session.set).toHaveBeenCalledWith('new-token');
    store.dispatch(logout.fulfilled(null, 'logout'));
    expect(store.getState().auth).toEqual({ isLogin: false, loginUserId: '' });
    expect(services.session.clear).toHaveBeenCalledTimes(1);
    expect(services.notify).toHaveBeenCalledWith('boardSlice.logoutSucc');
});

test('feature listeners preserve join navigation and specific login errors', () => {
    const services = effects();
    const store = createAppStore({ persist: false, effects: services });
    store.dispatch(join.fulfilled({}, 'join', {}));
    expect(services.redirect).toHaveBeenCalledWith('/login');
    store.dispatch(login.rejected(null, 'login', {}, { status: 400, code: 201, message: 'Wrong password' }));
    expect(services.notify).toHaveBeenCalledWith('boardSlice.passwordWrong');
    expect(store.getState().auth.isLogin).toBe(false);
});

test('rehydrates legacy auth into its module and never restores in-flight requests', async () => {
    const storage = {
        getItem: jest.fn(async () => JSON.stringify(Object.fromEntries(
            Object.entries(oldSession).map(([key, value]) => [key, JSON.stringify(value)])))),
        setItem: jest.fn(async () => undefined), removeItem: jest.fn(async () => undefined)
    };
    const store = createAppStore({ storage, effects: effects() });
    let persistor;
    await new Promise(resolve => { persistor = persistStore(store, null, resolve); });
    expect(store.getState().auth).toEqual({ isLogin: true, loginUserId: 'alice' });
    expect(store.getState().boards).toMatchObject({ page: 2, searchKeyword: 'saved search', listStatus: 'idle', listError: null, listRequestId: null });
    expect(store.getState().boards).not.toHaveProperty('isLogin');
    await persistor.flush();
    persistor.pause();
    const serialized = JSON.parse(storage.setItem.mock.calls.at(-1)[1]);
    expect(JSON.parse(serialized.boards)).not.toHaveProperty('listRequestId');
    expect(JSON.parse(serialized.auth).loginUserId).toBe('alice');
});

test('missing token invalidates persisted identity but preserves board preferences', () => {
    const state = migratePersistedState(oldSession, null);
    expect(state.auth).toEqual({ isLogin: false, loginUserId: '' });
    expect(state.boards.searchKeyword).toBe('saved search');
    expect(oldSession.boards.listStatus).toBe('loading');
});

test('current auth wins over legacy identity and absent persistence is supported', () => {
    const state = migratePersistedState({ ...oldSession, auth: { isLogin: true, loginUserId: 'bob' } }, 'token');
    expect(state.auth.loginUserId).toBe('bob');
    expect(migratePersistedState(undefined, null)).toBeUndefined();
});
