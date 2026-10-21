import axios from 'axios';
import { login, join, logout, checkUserId } from './authApi';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
const run = thunk => thunk(jest.fn(), () => ({}), undefined);
beforeEach(() => { jest.clearAllMocks(); sessionStorage.clear(); });

test('login does not send an existing bearer token to the public endpoint', async () => {
    sessionStorage.setItem('ACCESS_TOKEN', 'old-token');
    axios.post.mockResolvedValue({ data: { item: { userId: 'alice', token: 'new-token' } } });
    const credentials = { userId: 'alice', userPw: 'test-password' };
    const result = await run(login(credentials));
    expect(result.payload).toEqual({ userId: 'alice', token: 'new-token' });
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/user/login'), credentials,
        { headers: {}, signal: expect.anything() });
});

test('login preserves the server error code for feature-level messages', async () => {
    axios.post.mockRejectedValue({ response: { status: 400, data: { errorCode: 201, errorMessage: 'Wrong password' } } });
    const result = await run(login({}));
    expect(result.type).toBe(login.rejected.type);
    expect(result.payload).toEqual({ status: 400, code: 201, message: 'Wrong password' });
});

test('network errors without an HTTP response remain serializable rejections', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const result = await run(login({}));
    expect(result.type).toBe(login.rejected.type);
    expect(result.payload).toEqual({ status: null, message: 'Network Error' });
});

test('join and duplicate ID check use the feature endpoints', async () => {
    axios.post.mockResolvedValueOnce({ data: { item: { userId: 'alice' } } })
        .mockResolvedValueOnce({ data: { item: { idCheckResult: 'valid id' } } });
    expect((await run(join({ userId: 'alice' }))).payload).toEqual({ userId: 'alice' });
    expect((await checkUserId('alice')).item.idCheckResult).toBe('valid id');
    expect(axios.post.mock.calls[1][0]).toEqual(expect.stringContaining('/user/id-check'));
    expect(axios.post.mock.calls[1][1]).toEqual({ userId: 'alice' });
});

test('logout uses current session authentication and returns the response item', async () => {
    sessionStorage.setItem('ACCESS_TOKEN', 'session-token');
    axios.get.mockResolvedValue({ data: { item: 'logged out' } });
    expect((await run(logout())).payload).toBe('logged out');
    expect(axios.get.mock.calls[0][1].headers).toEqual({ Authorization: 'Bearer session-token' });
});
