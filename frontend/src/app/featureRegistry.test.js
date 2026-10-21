import { render, screen, fireEvent } from '@testing-library/react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createFeatureRegistry } from './featureRegistry';
import { createAppStore, persiststore } from './store';
import { AppRoutes } from './routes';
import { authModule } from '../features/auth';
import { homeModule } from '../features/home';
import { boardModule } from '../features/board';

jest.mock('axios', () => ({}));
jest.mock('../i18n', () => ({ t: key => key }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: key => key, i18n: { language: 'en', changeLanguage: jest.fn() } }) }));
beforeAll(() => persiststore.pause());

function ExampleFeature() {
    const count = useSelector(state => state.example.count);
    const dispatch = useDispatch();
    return <button onClick={() => dispatch({ type: 'example/increment' })}>Example {count}</button>;
}

test('one feature registration adds navigation, its working route and state', async () => {
    const registry = createFeatureRegistry([homeModule, authModule, boardModule, {
        id: 'example', navigation: [{ path: '/example', labelKey: 'example.menu' }], routes: [{ path: '/example', element: <ExampleFeature /> }],
        reducers: { example: (state = { count: 0 }, action) => action.type === 'example/increment' ? { count: state.count + 1 } : state }
    }]);
    const store = createAppStore({ registry, persist: false });
    render(<Provider store={store}>
        <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes registry={registry} />
        </MemoryRouter>
    </Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'example.menu' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Example 0' }));
    expect(screen.getByRole('button', { name: 'Example 1' })).toBeInTheDocument();
    expect(store.getState().example.count).toBe(1);
});

test('rejects accidental module, state, and route collisions', () => {
    expect(() => createFeatureRegistry([authModule, authModule])).toThrow(/feature id/);
    expect(() => createFeatureRegistry([authModule, { id: 'other', reducers: { auth: () => ({}) } }])).toThrow(/Duplicate reducer/);
    expect(() => createFeatureRegistry([authModule, { id: 'other', routes: [{ path: '/login' }] }])).toThrow(/Duplicate route/);
});

test('rejects persistence pointing outside the feature reducer map', () => {
    expect(() => createFeatureRegistry([{ id: 'other', persistedReducers: ['auth'] }])).toThrow(/Unknown persisted reducer/);
});

test('keeps existing routes while legacy OAuth callbacks stay unregistered', () => {
    const registry = createFeatureRegistry([homeModule, authModule, boardModule]);
    expect(registry.routes.map(route => route.index ? '/' : route.path)).toEqual([
        '/', '/join', '/login', '/board-list', '/post', '/board/:boardNo'
    ]);
});

test('rejects relative and trailing-slash aliases that match an existing URL', () => {
    expect(() => createFeatureRegistry([authModule, { id: 'other', routes: [{ path: 'login/' }] }])).toThrow(/Duplicate route/);
    expect(() => createFeatureRegistry([homeModule, { id: 'other', routes: [{ path: '/' }] }])).toThrow(/Duplicate route/);
});
