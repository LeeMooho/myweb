import React, { useCallback, useState } from 'react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { Button, Container, Grid, Link, TextField, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { login } from '../apis/userApi';
import {useNavigate} from 'react-router-dom';

const Login = () => {
    const [form, setForm] = useState({
        userId: '',
        userPw: ''
    });

    const navi = useNavigate();
    const dispatch = useDispatch();
    const textFiledchanged = useCallback((e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }, [form]);

    
    const toggleShowPw = () => {
        setshowPw(!showPw);
    };

    const handleLogin = useCallback((e) => {
        e.preventDefault();

        dispatch(login(form));
        navi("/");
    }, [form, dispatch]);

    
    const [showPw, setshowPw] = useState(false);

    const Kakao_Rest_api_key = process.env.REACT_APP_KAKAO_REST_API; //REST API KEY
    const kakao_redirect_url = `${process.env.REACT_APP_FRONT_URL}/kakao-login` //Redirect URI
    // oauth 요청 URL
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${Kakao_Rest_api_key}&redirect_uri=${kakao_redirect_url}&response_type=code`

    const handleKakaoLogin = () => {
        window.location.href = kakaoURL
    };

    const Google_Rest_api_key = process.env.REACT_APP_GOOGLE_REST_API; //REST API KEY
    const google_redirect_url = `${process.env.REACT_APP_FRONT_URL}/google-login` //Redirect URI
    // oauth 요청 URL
    const googleURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${Google_Rest_api_key}&redirect_uri=${google_redirect_url}&response_type=code&scope=email profile`

    const handleGoogleLogin = () => {
        window.location.href = googleURL
    };


  return (
    <Container component='div' maxWidth="xs" style={{marginTop: '8%'}}>
        <form onSubmit={handleLogin}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography component='h1' variant='h5'>
                        로그인
                    </Typography>
                </Grid>
                <Grid item xs={12} textAlign='right'>
                    <TextField
                        name='userId'
                        variant='outlined'
                        required
                        id='userId'
                        label='아이디'
                        autoFocus
                        fullWidth
                        value={form.userId}
                        onChange={textFiledchanged}
                    ></TextField>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userPw'
                        variant='outlined'
                        required
                        id='userPw'
                        label='비밀번호'
                        fullWidth
                        type={showPw ? 'text' : 'password'}
                        value={form.userPw}
                        InputProps={{
                                           endAdornment: <RemoveRedEyeIcon onClick={toggleShowPw}
                                                                           sx={{cursor: 'pointer'}}/>,
                                           disableUnderline: true
                         }}
                        onChange={textFiledchanged}
                    ></TextField>
                </Grid>
                <Grid item xs={12}>
                    <Button type='submit' fullWidth variant='contained' color='primary' 
                            tyle={{height: '55px', fontSize: '18px'}}>
                        로그인
                    </Button>
                </Grid>
            </Grid>
            <Grid container justifyContent="space-around" style={{marginTop: '3%'}}>
                <Grid item>
                    {/* <Link href="/find-password" variant="body2" style={{color: '#616568', fontSize: '17px'}}>
                        비밀번호 찾기
                    </Link> */}
                </Grid>
                <Grid item>
                    <Link href="/Join" variant="body2" style={{color: '#616568', fontSize: '17px'}}>
                        회원가입
                    </Link>
                </Grid>
            </Grid>
            <Grid container justifyContent="center" display='flex' alignItems='center'>
                <Grid item style={{marginTop: '8%', color: '#abb0b5', width: '100%', textAlign: 'center'}}>
                    <hr style={{
                        position: 'relative',
                        margin: 0,
                        bottom: '-12px',
                        width: '100%',
                        border: 'none',
                        height: '1px',
                        backgroundColor: '#f1f3f5'
                    }}></hr>
                    <Typography component="span" variant='string' style={{
                        color: '#abb0b5',
                        zIndex: '1',
                        position: 'relative',
                        top: 0,
                        backgroundColor: '#fff',
                        padding: '0 8px'
                    }}>
                        간편 로그인
                    </Typography>
                </Grid>
                <Grid item display='flex' marginTop='15px'>
                    <Grid item xs={6}>
                        <img src='/images/kakao_login.png' alt='kakao_login' onClick={handleKakaoLogin}
                                style={{width: '200px', height: '50px', cursor: 'pointer'}}></img>
                    </Grid>
                    <Grid item xs={6}>
                        <img src='/images/google_login.png' alt='google_login' onClick={handleGoogleLogin}
                                style={{width: '200px', height: '50px', cursor: 'pointer'}}></img>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    </Container>
  );
}

export default Login;