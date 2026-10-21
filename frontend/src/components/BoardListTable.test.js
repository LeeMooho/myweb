import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import reducer from '../slices/boardSlice';
import BoardListTable from './BoardListTable';

jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('../i18n', () => ({ t: key => key }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key }) }));

const page = content => ({ item: { searchCondition: 'all', searchKeyword: '' },
    pageItems: { content, number: 0, totalPages: content.length ? 2 : 0 } });
const mount = () => render(<Provider store={configureStore({ reducer: { boards: reducer } })}>
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><BoardListTable /></MemoryRouter>
</Provider>);

beforeEach(() => jest.clearAllMocks());

test('shows loading then an empty result without pagination', async () => {
    let resolve;
    axios.get.mockImplementation(() => new Promise(done => { resolve = done; }));
    mount();
    expect(screen.getByRole('status')).toBeInTheDocument();
    await act(async () => resolve({ data: page([]) }));
    expect(await screen.findByText('boardListTable.empty')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
});

test('shows an inline error and retries successfully', async () => {
    axios.get.mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce({ data: page([{ boardNo: 7, boardTitle: 'Recovered post' }]) });
    mount();
    expect(await screen.findByRole('alert')).toHaveTextContent('boardListTable.loadError');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'boardListTable.retry' })));
    expect(await screen.findByRole('link', { name: 'Recovered post' })).toHaveAttribute('href', '/board/7');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(2);
});

test('pagination requests the selected zero-based page', async () => {
    axios.get.mockResolvedValue({ data: page([{ boardNo: 7, boardTitle: 'A post' }]) });
    mount();
    await screen.findByText('A post');
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' })));
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(axios.get.mock.calls[1][1].params.page).toBe(1);
});

test('unmount aborts the outstanding list request', async () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    const view = mount();
    const signal = axios.get.mock.calls[0][1].signal;
    expect(signal.aborted).toBe(false);
    await act(async () => view.unmount());
    expect(signal.aborted).toBe(true);
});
