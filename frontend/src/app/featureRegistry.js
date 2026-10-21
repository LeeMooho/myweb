// One registration supplies both routing and state. Reject collisions early.
export const createFeatureRegistry = modules => {
    const ids = new Set();
    const paths = new Set();
    const reducers = {};
    const routes = [];
    const navigation = [];
    const persistedReducers = [];
    modules.forEach(module => {
        if (!module.id || ids.has(module.id)) throw new Error(`Duplicate or missing feature id: ${module.id}`);
        ids.add(module.id);
        Object.entries(module.reducers || {}).forEach(([key, reducer]) => {
            if (Object.prototype.hasOwnProperty.call(reducers, key)) throw new Error(`Duplicate reducer: ${key}`);
            reducers[key] = reducer;
        });
        navigation.push(...(module.navigation || []));
        (module.routes || []).forEach(route => {
            const path = route.index ? '/' : `/${(route.path || '').replace(/^\/+|\/+$/g, '')}`;
            if (paths.has(path)) throw new Error(`Duplicate route: ${path}`);
            paths.add(path);
            routes.push(route);
        });
        (module.persistedReducers || []).forEach(key => {
            if (!module.reducers?.[key]) throw new Error(`Unknown persisted reducer: ${key}`);
            persistedReducers.push(key);
        });
    });
    return {
        reducers, routes, navigation, persistedReducers,
        registerListeners: (startListening, effects) => modules.forEach(module => module.registerListeners?.(startListening, effects))
    };
};
