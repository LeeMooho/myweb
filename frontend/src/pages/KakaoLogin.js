import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI, KAKAO_REACT_APP_BACK_URL } from '../config';

const KakaoLogin = () => {

    const navi = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const params= new URL(document.location.toString()).searchParams;
        const code = params.get('code');
        const grantType = "authorization_code";


    axios.post(
        `https://kauth.kakao.com/oauth/token?grant_type=${grantType}&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&code=${code}`,
        {},
        { headers: { "Content-type": "application/x-www-form-urlencoded;charset=utf-8" } }
    )
    .then((res) => {
        console.log(res);
        const { access_token } = res.data;
        axios.post(
            `https://kapi.kakao.com/v2/user/me`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
                }
            }
        )
        .then((res) => {
            axios.post(`http://${KAKAO_REACT_APP_BACK_URL}/member/join`, {
                username: res.data.kakao_account.email,
                password: res.data.id
            })
            .then(() => {
                axios.post(`http://${KAKAO_REACT_APP_BACK_URL}/member/login`, {
                    username: res.data.kakao_account.email,
                    password: res.data.id
                })
                .then((response2) => {
                    if (response2.data.item && response2.data.statusCode === 200) {
                        sessionStorage.setItem('ACCESS_TOKEN', response2.data.item.token);
                        sessionStorage.getItem('ACCESS_TOKEN');
                        navi('/');
                        window.location.reload();
                    }
                })
            })
            .catch((e) => {
                axios.post(`http://${KAKAO_REACT_APP_BACK_URLL}/member/login`, {
                    username: res.data.kakao_account.email,
                    password: res.data.id
                })
                .then((response2) => {
                    if (response2.data.item && response2.data.statusCode === 200) {
                        sessionStorage.setItem('ACCESS_TOKEN', response2.data.item.token);
                        sessionStorage.getItem('ACCESS_TOKEN');
                        navi('/');
                    }
                })
                .catch((e) => {
                    alert(t('kakaoLogin.alreadySignoutMessage'));
                    navi('/');
                    console.error(e);
                });
            });
        })
        .catch((e) => {
            console.error(e);
        });
    })
    .catch((e) => {
        console.error(e);
    });
}, [])

return (
    <Grid Container marginBottom='30%' marginTop='10%'style={{ position: 'flex'}} >
        <Grid item xs={12} style={{ position: 'absolute', left: '50%'}}>
            <MoonLoader color="#558BCF" />
        </Grid>
    </Grid> 
);

}

export default KakaoLogin