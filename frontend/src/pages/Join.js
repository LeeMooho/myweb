import React, { useCallback, useState } from 'react';
import { Button, Container, Grid, Link, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {join} from '../apis/userApi';
import { API_URL } from '../config';

const Join = () => {
    const [form, setForm] = useState({
        userId: '',
        userPw: '',
        userPwChk: '',
        userName: '',
        userEmail: '',
        userTel: ''
    });
    const [idChk, setIdChk] = useState(false);
    const [pwValidation, setPwValidtaion] = useState(false);
    const [pwChk, setPwChk] = useState(false);
    const dispatch = useDispatch();

    const textFiledchanged = useCallback((e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        if(e.target.name === 'userId') {
            setIdChk(false);
            document.querySelector("#userIdChk").removeAttribute('disabled');
            return;
        }


        // 비밀번호 일치 여부
        if(e.target.name === 'userPw') {
            if(e.target.value === form.userPwChk) {
                setPwChk(true);
                document.querySelector("#password-check-success").style.display = 'block';
                document.querySelector("#password-check-fail").style.display = 'none';
            } else {
                setPwChk(false);
                document.querySelector("#password-check-success").style.display = 'none';
                document.querySelector("#password-check-fail").style.display = 'block';
            }

            return;
        }

        if(e.target.name === 'userPwChk') {
            if(e.target.value === form.userPw) {
                setPwChk(true);
                document.querySelector("#password-check-success").style.display = 'block';
                document.querySelector("#password-check-fail").style.display = 'none';
            } else {
                setPwChk(false);
                document.querySelector("#password-check-success").style.display = 'none';
                document.querySelector("#password-check-fail").style.display = 'block';
            }

            return;
        }
    }, [form]);

    // id 중복 체크
    const idCheck = useCallback(async () => {
        if(form.userId === '') {
            alert("아이디를 입력하세요.");
            document.querySelector("#userId").focus();
            return;
        }

        try {
            const response = await axios.post(
                `${API_URL}/user/id-check`,
                {
                    userId: form.userId
                }
            );

            if(response.data.item.idCheckResult === 'invalid id') {
                alert("중복된 아이디입니다. 다른 아이디로 변경해주세요.");
                document.querySelector("#userId").focus();
                return;
            } else {
                if(window.confirm(`${form.userId}는 사용가능한 아이디입니다. 사용하시겠습니까?`)) {
                    document.querySelector("#userIdChk").setAttribute('disabled', true);
                    setIdChk(true);
                    return;
                }
            }
        } catch(e) {
            console.log(e);
            alert("에러 발생. 관리자에게 문의하세요.");
        }
    }, [form.userId]);

    // 비밀번호 유효성 검사 정규식
    const validatePassword = (userPw) => {
        return /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*+=-]).{9,}$/.test(userPw);
    }

    // 비밀번호 입력 인풋에서 커서가 나가면 유효성 검사
    const userPwBlur = useCallback((e) => {
        if(validatePassword(e.target.value)) {
            setPwValidtaion(true);
            document.querySelector("#password-validation").style.display = "none";
            return;
        } else {
            setPwValidtaion(false);
            document.querySelector("#password-validation").style.display = "block";
            document.querySelector("#userPw").focus();
            return;
        }
    }, []);

    // 회원가입 처리
    const handleJoin = useCallback((e) => {
        e.preventDefault();

        if(!idChk) {
            alert("아이디 중복체크를 진행하세요.");
            return;
        }

        if(!pwValidation) {
            alert("비밀번호는 특수문자, 영문자, 숫자 조합의 9자리 이상으로 설정하세요.");
            document.querySelector("#userPw").focus();
            return;
        }

        if(!pwChk) {
            alert("비밀번호가 일치하지 않습니다.");
            document.querySelector("#userPwChk").focus();
            return;
        }

        dispatch(join(form));
    }, [form, idChk, pwValidation, pwChk, dispatch]);
  return (
    <Container component='div' maxWidth="xs" style={{marginTop: '8%'}}>
        <form onSubmit={handleJoin}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography component='h1' variant='h5'>
                        회원가입
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
                    <Button name='userIdChk' id='userIdChk' color='primary' onClick={idCheck}>
                        중복확인
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userPw'
                        variant='outlined'
                        required
                        id='userPw'
                        label='비밀번호'
                        fullWidth
                        type='password'
                        value={form.userPw}
                        onChange={textFiledchanged}
                        onBlur={userPwBlur}
                    ></TextField>
                    <Typography
                        name='password-validation'
                        id='password-validation'
                        component='p'
                        variant='string'
                        style={{display: 'none', color: 'red'}}>
                        비밀번호는 특수문자, 영문자, 숫자 조합의 9자리 이상으로 설정하세요.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userPwChk'
                        variant='outlined'
                        required
                        id='userPwChk'
                        label='비밀번호 확인'
                        fullWidth
                        type='password'
                        value={form.userPwChk}
                        onChange={textFiledchanged}
                    ></TextField>
                    <Typography
                        name='password-check-success'
                        id='password-check-success'
                        component='p'
                        variant='string'
                        style={{display: 'none', color: 'green'}}>
                        비밀번호가 일치합니다.
                    </Typography>
                    <Typography
                        name='password-check-fail'
                        id='password-check-fail'
                        component='p'
                        variant='string'
                        style={{display: 'none', color: 'red'}}>
                        비밀번호가 일치하지 않습니다.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userName'
                        variant='outlined'
                        required
                        id='userName'
                        label='이름'
                        fullWidth
                        value={form.userName}
                        onChange={textFiledchanged}
                    ></TextField>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userEmail'
                        variant='outlined'
                        required
                        id='userEmail'
                        label='이메일'
                        fullWidth
                        type='email'
                        value={form.userEmail}
                        onChange={textFiledchanged}
                    ></TextField>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userTel'
                        variant='outlined'
                        id='userTel'
                        label='전화번호'
                        fullWidth
                        value={form.userTel}
                        onChange={textFiledchanged}
                    ></TextField>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        color='primary'>
                        회원가입
                    </Button>
                </Grid>
            </Grid>
            <Grid container justifyContent='flex-end'>
                <Grid item>
                    <Link href="/login" variant='body2'>
                        이미 계정이 있으시면 로그인하세요.
                    </Link>
                </Grid>
            </Grid>
        </form>
    </Container>
  );
}

export default Join;