import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import reducer, { change_searchCondition } from '../slices/boardSlice';
import SearchBar from './SearchBar';

jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('../i18n', () => ({ t: key => key }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));

const setup = () => {
    const initialState = { ...reducer(undefined, { type: '@@init' }), page: 4 };
    const store = configureStore({ reducer: { boards: reducer }, preloadedState: { boards: initialState } });
    const view = render(<Provider store={store}><SearchBar /></Provider>);
    return { ...view, store };
};

beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: {
        item: { searchCondition: 'title', searchKeyword: '한글 & keyword' },
        pageItems: { number: 0, content: [], totalPages: 0 }
    } });
});

test('submitting a new search resets to page zero and preserves special characters', async () => {
    setup();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'title' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '한글 & keyword' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'searchBar.search' })));

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get.mock.calls[0][1].params).toEqual({
        searchCondition: 'title', searchKeyword: '한글 & keyword', page: 0
    });
});

test('the selected condition follows Redux updates instead of an initial default', () => {
    const { store } = setup();
    expect(screen.getByRole('combobox')).toHaveValue('all');
    act(() => store.dispatch(change_searchCondition('writer')));
    expect(screen.getByRole('combobox')).toHaveValue('writer');
});

test('form submission prevents a page reload and allows clearing the keyword', async () => {
    const { container } = setup();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'old query' } });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    const event = new Event('submit', { bubbles: true, cancelable: true });
    await act(async () => container.querySelector('form').dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true);
    expect(axios.get.mock.calls[0][1].params).toEqual({
        searchCondition: 'all', searchKeyword: '', page: 0
    });
});
