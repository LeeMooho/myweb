import axios from 'axios';
import { API_URL } from '../../config';
import { tokenStorage } from './tokenStorage';

// Feature APIs define endpoints; this boundary owns transport and authentication.
export const request = async ({ method = 'get', path, data, params, signal, authenticated = true }) => {
    const token = authenticated ? tokenStorage.get() : null;
    const config = { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal };
    if (params) config.params = params;
    const url = `${API_URL}${path}`;
    const response = method === 'get' || method === 'delete'
        ? await axios[method](url, config)
        : await axios[method](url, data, config);
    return response.data;
};

export const toApiError = error => ({
    status: error.response?.status ?? null,
    message: error.response?.data?.errorMessage || error.message || 'Request failed',
    ...(error.response?.data?.errorCode != null ? { code: error.response.data.errorCode } : {})
});

export const requestThunk = async (operation, thunkAPI) => {
    try {
        return await operation(thunkAPI.signal);
    } catch (error) {
        return thunkAPI.rejectWithValue(toApiError(error));
    }
};
