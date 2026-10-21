import axios from 'axios';
import { API_URL } from '../../config';
import { tokenStorage } from './tokenStorage';

export const toApiError = error => {
    const code = error?.response?.data?.errorCode ?? error?.code;
    return {
        status: error?.response?.status ?? error?.status ?? null,
        message: error?.response?.data?.errorMessage || error?.message || 'Request failed',
        ...(code != null ? { code } : {})
    };
};

// Feature APIs define endpoints; this boundary owns transport and authentication.
export const request = async ({ method = 'get', path, data, params, signal, authenticated = true }) => {
    const token = authenticated ? tokenStorage.get() : null;
    const config = { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal };
    if (params) config.params = params;
    const url = `${API_URL}${path}`;
    try {
        const response = method === 'get' || method === 'delete'
            ? await axios[method](url, config)
            : await axios[method](url, data, config);
        return response.data;
    } catch (error) {
        // Direct feature APIs and thunks expose the same vendor-independent shape.
        throw toApiError(error);
    }
};

export const requestThunk = async (operation, thunkAPI) => {
    try {
        return await operation(thunkAPI.signal);
    } catch (error) {
        return thunkAPI.rejectWithValue(toApiError(error));
    }
};
