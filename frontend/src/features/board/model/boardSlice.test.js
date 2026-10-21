import reducer from './boardSlice';
import { getBoards } from '../api/boardApi';

jest.mock('axios', () => ({}));
jest.mock('../../../i18n', () => ({ t: key => key }));

const query = { searchCondition: 'title', searchKeyword: 'new', page: 1 };
const response = {
    item: query, pageItems: { number: 1, content: [{ boardNo: 2 }], totalPages: 3 }
};

test('latest search wins when older responses arrive late', () => {
    let state = reducer(undefined, getBoards.pending('old', {}));
    state = reducer(state, getBoards.pending('new', query));
    state = reducer(state, getBoards.fulfilled(response, 'new', query));
    const afterLatest = state;
    state = reducer(state, getBoards.fulfilled({ ...response, pageItems: { content: [] } }, 'old', {}));
    expect(state).toEqual(afterLatest);
    expect(state.boards.content).toEqual([{ boardNo: 2 }]);
    expect(state.page).toBe(1);
    expect(state.listStatus).toBe('succeeded');
});

test('stale rejection cannot interrupt the current request', () => {
    let state = reducer(undefined, getBoards.pending('old', {}));
    state = reducer(state, getBoards.pending('new', query));
    state = reducer(state, getBoards.rejected(new Error('old error'), 'old', {}));
    expect(state.listStatus).toBe('loading');
    expect(state.listError).toBeNull();
});

test('failure keeps existing rows and clears on retry', () => {
    let state = reducer(undefined, getBoards.pending('first', query));
    state = reducer(state, getBoards.fulfilled(response, 'first', query));
    state = reducer(state, getBoards.pending('retry', query));
    state = reducer(state, getBoards.rejected(null, 'retry', query, { message: 'Unavailable' }));
    expect(state.listStatus).toBe('failed');
    expect(state.listError).toBe('Unavailable');
    expect(state.boards.content).toHaveLength(1);
    state = reducer(state, getBoards.pending('again', query));
    expect(state.listError).toBeNull();
    expect(state.listStatus).toBe('loading');
});

test('cancellation does not show an error', () => {
    let state = reducer(undefined, getBoards.pending('cancel', query));
    state = reducer(state, getBoards.rejected({ name: 'AbortError', message: 'Aborted' }, 'cancel', query));
    expect(state.listStatus).toBe('idle');
    expect(state.listError).toBeNull();
});
