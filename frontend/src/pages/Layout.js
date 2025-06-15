import React from 'react';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
        <Header></Header>
        <main>
            <Outlet></Outlet>
        </main>
    </>
  );
}

export default Layout;