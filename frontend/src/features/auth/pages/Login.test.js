import { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { createAppStore, persiststore } from '../../../app/store';
import { AppRoutes } from '../../../app/routes';

jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('../../../i18n', () => ({ t: key => key }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'en', changeLanguage: jest.fn() } }) }));
beforeAll(() => persiststore.pause());
beforeEach(() => jest.clearAllMocks());

const setup = () => {
    const effects = { notify: jest.fn(), redirect: jest.fn(), session: { set: jest.fn(), clear: jest.fn() } };
    const store = createAppStore({ persist: false, effects });
    render(<Provider store={store}>
        <MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AppRoutes /></MemoryRouter>
    </Provider>);
    fireEvent.change(screen.getByLabelText(/login\.userId/), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText(/login\.userPw/), { target: { value: 'test-password' } });
    return { store, effects };
};

test('successful login stores the session through the auth module before returning home', async () => {
    axios.post.mockResolvedValue({ data: { item: { userId: 'alice', token: 'new-session' } } });
    const { store, effects } = setup();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'login.login' })));
    expect(await screen.findByRole('heading', { name: 'home.mainWelcom' })).toBeInTheDocument();
    expect(store.getState().auth.loginUserId).toBe('alice');
    expect(effects.session.set).toHaveBeenCalledWith('new-session');
});

test('failed login remains on the login route and uses the module error message', async () => {
    axios.post.mockRejectedValue({ response: { status: 400, data: { errorCode: 201 } } });
    const { store, effects } = setup();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'login.login' })));
    expect(screen.getByRole('heading', { name: 'login.login' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'home.mainWelcom' })).not.toBeInTheDocument();
    expect(store.getState().auth.isLogin).toBe(false);
    expect(effects.notify).toHaveBeenCalledWith('boardSlice.passwordWrong');
});
