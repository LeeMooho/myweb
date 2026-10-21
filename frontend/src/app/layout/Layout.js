import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = ({ navigation }) => {
  return (
    <>
        <Header navigation={navigation}></Header>
        <main>
            <Outlet></Outlet>
        </main>
        <Footer></Footer>
    </>
  );
}

export default Layout;