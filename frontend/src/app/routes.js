import { useRoutes } from 'react-router-dom';
import Layout from './layout/Layout';
import { appRegistry } from './modules';

export const AppRoutes = ({ registry = appRegistry }) => useRoutes([
    { element: <Layout navigation={registry.navigation} />, children: registry.routes }
]);
