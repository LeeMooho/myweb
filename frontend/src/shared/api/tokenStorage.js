const TOKEN_KEY = 'ACCESS_TOKEN';

export const tokenStorage = {
    get: () => sessionStorage.getItem(TOKEN_KEY),
    set: token => sessionStorage.setItem(TOKEN_KEY, token),
    clear: () => sessionStorage.removeItem(TOKEN_KEY)
};
