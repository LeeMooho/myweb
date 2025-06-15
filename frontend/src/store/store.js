import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import {
    configureStore,
    combineReducers
} from '@reduxjs/toolkit';
import boardSlice from '../slices/boardSlice';

const reducers = combineReducers({
    boards: boardSlice
});

const persistConfig = {
    key: 'root',
    storage: storageSession
};

const persistreducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
    reducer: persistreducer,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
});