import '../i18n';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persiststore } from './store';
import { AppRoutes } from './routes';

export { persiststore } from './store';

export default function App() {
    return <Provider store={store}>
        <PersistGate loading={null} persistor={persiststore}><AppRoutes /></PersistGate>
    </Provider>;
}
