import React, { useCallback, useState } from 'react';
import {AppBar, Box, Button, Toolbar, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../apis/userApi';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const navi = useNavigate();
  const isLogin = useSelector(state => state.boards.isLogin);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
 
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleChange = (event) => {
    const selectedLang = event.target.value;
    setLanguage(selectedLang);
    i18n.changeLanguage(selectedLang);
  };

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
          <Button color='inherit' onClick={() => navi('/board-list')}>{t('header.board')}</Button>
          {isLogin ? 
            (
              <>
                <Button color='inherit' onClick={() => navi('/mypage')}>{t('header.mypage')}</Button>
                <Button color='inherit' onClick={handleLogout}>Logout</Button>
              </>
            ) :
            (
              <>
                <Button color='inherit' onClick={() => navi('/join')}>{t('header.join')}</Button>
                <Button color='inherit' onClick={() => navi('/login')}>{t('header.login')}</Button>
              </>
            )
          }
          <FormControl variant="standard" sx={{ minWidth: 120}}>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              onChange={handleChange}
              sx={{
                  color: 'white', // ✅ 드롭다운 텍스트 색상
                  '& .MuiSvgIcon-root': { color: 'white' }, // 드롭다운 아이콘 색상
                  '&::before': { borderBottomColor: 'white' }, // 기본 밑줄 색상
                  '&:hover::before': { borderBottomColor: 'white' }, // hover 시 밑줄
                  '&::after': { borderBottomColor: 'white' }, // focus 시 밑줄
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="jp">日本語</MenuItem>
              <MenuItem value="ko">한국어</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
    </Box>
  );
};


export default Header;