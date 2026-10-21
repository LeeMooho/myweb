import { configureStore, combineReducers, createListenerMiddleware } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import { appRegistry } from './modules';
import { browserEffects } from './effects';
import { boardPersistence, migratePersistedState } from './persistence';

export const createAppStore = ({ registry = appRegistry, persist = true, preloadedState, effects = browserEffects, storage = storageSession } = {}) => {
    const listeners = createListenerMiddleware();
    registry.registerListeners(listeners.startListening, effects);
    const reducer = combineReducers(registry.reducers);
    const persistedReducer = persist ? persistReducer({
        key: 'root', version: 1, storage,
        whitelist: registry.persistedReducers,
        transforms: [boardPersistence],
        migrate: state => Promise.resolve(migratePersistedState(state, effects.session.get()))
    }, reducer) : reducer;
    return configureStore({
        reducer: persistedReducer,
        preloadedState,
        middleware: getDefaultMiddleware => getDefaultMiddleware({
            serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] }
        }).prepend(listeners.middleware)
    });
};

export const store = createAppStore();
export const persiststore = persistStore(store);
