import {Routes, Route} from 'react-router-dom';
import Layout from './pages/Layout';
import Join from './pages/Join';
import Home from './pages/Home';
import Login from './pages/Login';
import { store } from './store/store';
import {Provider} from 'react-redux';
import BoardList from './pages/BoardList';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import Post from './pages/Post';
import Board from './pages/Board';

export let persiststore = persistStore(store);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persiststore}>
        <Routes>
          <Route element={<Layout></Layout>}>
            <Route index element={<Home></Home>}></Route>
            <Route path='/join' element={<Join></Join>}></Route>
            <Route path='/login' element={<Login></Login>}></Route>
            <Route path='/board-list' element={<BoardList></BoardList>}></Route>
            <Route path='/post' element={<Post></Post>}></Route>
            <Route path='/board/:boardNo' element={<Board></Board>}></Route>
          </Route>
        </Routes>
      </PersistGate>
    </Provider>
  );
}

export default App;
