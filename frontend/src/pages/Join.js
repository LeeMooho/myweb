import React, { useCallback, useState } from 'react';
import { Button, Container, Grid, Link, TextField, Typography } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import {join} from '../apis/userApi';
import { API_URL } from '../config';
import { useTranslation } from 'react-i18next';

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
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [passwordCheckError, setPasswordCheckError] = useState(false);
    const [showPw, setshowPw] = useState(false);
    const [showPwCheck, setshowPwCheck] = useState(false);
    const toggleShowPwCheck = () => {
        setshowPwCheck(!showPwCheck);
    };

    const dispatch = useDispatch();
    const { t } = useTranslation();
    
    const toggleShowPw = () => {
        setshowPw(!showPw);
      };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);

        if (passwordCheck !== event.target.value) {
            setPasswordCheckError(true);
        } else {
            setPasswordCheckError(false);
        }
    };

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
            alert(t('join.idErrorMessage'));
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
                alert(t('join.sameIdErrorMessage'));
                document.querySelector("#userId").focus();
                return;
            } else {
                if(window.confirm(t('join.userIdAvailable', { userId: form.userId }))) {
                    document.querySelector("#userIdChk").setAttribute('disabled', true);
                    setIdChk(true);
                    return;
                }
            }
        } catch(e) {
            console.log(e);
            alert(t('join.idCheckErrorMessage'));
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
            document.querySelector("#userPw")
            return;
        }
    }, []);

    // 회원가입 처리
    const handleJoin = useCallback((e) => {
        e.preventDefault();

        if(!idChk) {
            alert(t('join.joinIdCheckErrorMessage'));
            return;
        }

        if(!pwValidation) {
            alert(t('join.joinPwCheckErrorMessage'));
            document.querySelector("#userPw").focus();
            return;
        }

        if(!pwChk) {
            alert(t('join.joinSamePwCheckErrorMessage'));
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
                        {t('join.join')}
                    </Typography>
                </Grid>
                <Grid item xs={12} textAlign='right'>
                    <TextField
                        name='userId'
                        variant='outlined'
                        required
                        id='userId'
                        label={t('join.id')}
                        autoFocus
                        fullWidth
                        value={form.userId}
                        onChange={textFiledchanged}
                    ></TextField>
                    <Button name='userIdChk' id='userIdChk' color='primary' onClick={idCheck}>
                        {t('join.idCheck')}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userPw'
                        variant='outlined'
                        required
                        id='userPw'
                        label={t('join.password')}
                        fullWidth
                        type={showPw ? 'text' : 'password'}
                        value={form.userPw}
                        onChange={textFiledchanged}
                        onBlur={userPwBlur}
                        InputProps={{
                            endAdornment: <RemoveRedEyeIcon onClick={toggleShowPw} sx={{cursor: 'pointer'}}/>,
                            disableUnderline: true
                            }}
                    ></TextField>
                    <Typography
                        name='password-validation'
                        id='password-validation'
                        component='p'
                        variant='string'
                        style={{display: 'none', color: 'red'}}>
                        {t('join.passwordDesc')}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userPwChk'
                        variant='outlined'
                        id='userPwChk'
                        label={t('join.passwordCheck')}
                        fullWidth
                        type={showPwCheck ? 'text' : 'password'}
                        value={form.userPwChk}
                        onChange={textFiledchanged}
                        error={passwordCheckError}
                        helperText={passwordCheckError ? t('join.passwordCheckFail') : ""}
                        InputProps={{
                            endAdornment: <RemoveRedEyeIcon onClick={toggleShowPwCheck} sx={{cursor: 'pointer'}}/>,
                            disableUnderline: true
                            }}
                    ></TextField>
                    <Typography
                        name='password-check-success'
                        id='password-check-success'
                        component='p'
                        variant='string'
                        style={{display: 'none', color: 'green'}}>
                        {t('join.passwordCheckSucc')}
                    </Typography>
                    <Typography
                        name='password-check-fail'
                        id='password-check-fail'
                        component='p'
                        variant='string'
                        style={{display: 'none', color: 'red'}}>
                        {t('join.passwordCheckFail')}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        name='userName'
                        variant='outlined'
                        required
                        id='userName'
                        label={t('join.name')}
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
                        label={t('join.email')}
                        fullWidth
                        type='email'
                        value={form.userEmail}
                        onChange={textFiledchanged}
                    ></TextField>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        color='primary'>
                        {t('join.login')}
                    </Button>
                </Grid>
            </Grid>
            <Grid container justifyContent='flex-end'>
                <Grid item>
                    <Link href="/login" variant='body2'>
                        {t('join.alreadyHaveId')}
                    </Link>
                </Grid>
            </Grid>
            <Grid item display='flex' marginTop='60px'>
            </Grid>
        </form>
    </Container>
  );
}

export default Join;