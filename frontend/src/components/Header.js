import React, { useCallback } from 'react';
import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../apis/userApi';

const Header = () => {
  const navi = useNavigate();
  const isLogin = useSelector(state => state.boards.isLogin);
  const dispatch = useDispatch();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navi("/login");
  }, [dispatch, navi]);

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{flexGrow: 1}}
                      onClick={() => navi('/')} style={{cursor: 'pointer'}}
          >
            Home
          </Typography>
          <Button color='inherit' onClick={() => navi('/board-list')}>Board</Button>
          {isLogin ? 
            (
              <>
                <Button color='inherit' onClick={() => navi('/mypage')}>My Page</Button>
                <Button color='inherit' onClick={handleLogout}>Logout</Button>
              </>
            ) :
            (
              <>
                <Button color='inherit' onClick={() => navi('/join')}>Sign Up</Button>
                <Button color='inherit' onClick={() => navi('/login')}>Login</Button>
              </>
            )
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;