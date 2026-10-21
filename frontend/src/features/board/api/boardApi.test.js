import axios from 'axios';
import { getBoards, postBoard, removeBoard, fetchBoard, updateBoard } from './boardApi';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn(), delete: jest.fn(), put: jest.fn() }));

const run = thunk => thunk(jest.fn(), () => ({}), undefined);

beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
});

test('list sends default query without a fake bearer token', async () => {
    axios.get.mockResolvedValue({ data: { pageItems: { content: [] } } });
    const result = await run(getBoards());
    expect(result.type).toBe(getBoards.fulfilled.type);
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/board/board-list'), {
        headers: {}, signal: expect.anything(),
        params: { searchCondition: 'all', searchKeyword: '', page: 0 }
    });
});

test('authenticated search preserves query and supports cancellation', async () => {
    sessionStorage.setItem('ACCESS_TOKEN', 'test-token');
    axios.get.mockResolvedValue({ data: {} });
    await run(getBoards({ searchCondition: 'title', searchKeyword: '한글 & query', page: 2 }));
    expect(axios.get.mock.calls[0][1]).toEqual({
        headers: { Authorization: 'Bearer test-token' }, signal: expect.anything(),
        params: { searchCondition: 'title', searchKeyword: '한글 & query', page: 2 }
    });
});

test('request failure is a serializable rejection with server details', async () => {
    axios.get.mockRejectedValue({ response: { status: 503, data: { errorMessage: 'Unavailable' } } });
    const result = await run(getBoards());
    expect(result.type).toBe(getBoards.rejected.type);
    expect(result.payload).toEqual({ status: 503, message: 'Unavailable' });
    expect(JSON.parse(JSON.stringify(result.payload))).toEqual(result.payload);
});

test('post lets the browser set the multipart boundary and returns the page', async () => {
    const form = new FormData();
    const page = { content: [{ boardNo: 1 }] };
    axios.post.mockResolvedValue({ data: { pageItems: page } });
    expect((await run(postBoard(form))).payload).toEqual(page);
    expect(axios.post.mock.calls[0][1]).toBe(form);
    expect(axios.post.mock.calls[0][2].headers).not.toHaveProperty('Content-Type');
});

test('delete failure remains rejected instead of returning an empty page', async () => {
    axios.delete.mockRejectedValue(new Error('Network Error'));
    const result = await run(removeBoard(7));
    expect(result.type).toBe(removeBoard.rejected.type);
    expect(result.payload).toEqual({ status: null, message: 'Network Error' });
});

test('detail requests stay behind the board API and return the response envelope', async () => {
    axios.get.mockResolvedValue({ data: { item: { boardNo: 7, boardTitle: 'Detail' } } });
    expect((await fetchBoard(7)).item.boardTitle).toBe('Detail');
    expect(axios.get.mock.calls[0][0]).toEqual(expect.stringContaining('/board/board/7'));
});

test('editing uses the shared authenticated multipart transport', async () => {
    sessionStorage.setItem('ACCESS_TOKEN', 'current-token');
    const form = new FormData();
    axios.put.mockResolvedValue({ data: { item: { boardNo: 7 } } });
    expect((await updateBoard(form)).item.boardNo).toBe(7);
    expect(axios.put.mock.calls[0][1]).toBe(form);
    expect(axios.put.mock.calls[0][2].headers).toEqual({ Authorization: 'Bearer current-token' });
});

test('direct API callers receive normalized errors without Axios request internals', async () => {
    const request = {};
    request.self = request;
    axios.get.mockRejectedValue({ response: { status: 404, data: { errorMessage: 'Post missing' } }, request });
    await expect(fetchBoard(7)).rejects.toEqual({ status: 404, message: 'Post missing' });
});
