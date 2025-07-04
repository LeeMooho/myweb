import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GOOGLE_REST_API_KEY, GOOGLE_CLIENT_SECRET_KEY, GOOGLE_REDIRECT_URL } from '../config';

const GoogleLogin = () => {
    const navi = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const params= new URL(document.location.toString()).searchParams;
        const code = params.get('code');
        const GRANT_TYPE = "authorization_code";
        

    axios.post(
        `https://oauth2.googleapis.com/token?code=${code}&client_id=${GOOGLE_REST_API_KEY}&client_secret=${GOOGLE_CLIENT_SECRET_KEY}&redirect_uri=${GOOGLE_REDIRECT_URL}&grant_type=${GRANT_TYPE}`,
        { headers: { "Content-type": "application/x-www-form-urlencoded" } }
    )
    .then((res) => {
        let access_token = res.data.access_token; 
        axios.get(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            }
        )
        .then((res) => {
            axios.post(`http://${process.env.REACT_APP_BACK_URL}/member/join`, {
                username: res.data.email,
                password: res.data.id
            })
            .then(() => {
                axios.post(`http://${process.env.REACT_APP_BACK_URL}/member/login`, {
                    username: res.data.email,
                    password: res.data.id
                })
                .then((response2) => {
                    if (response2.data.item && response2.data.statusCode === 200) {
                        sessionStorage.setItem('ACCESS_TOKEN', response2.data.item.token);
                        sessionStorage.getItem('ACCESS_TOKEN');
                        navi('/');
                    }
                })
            })
            .catch((e) => {
                axios.post(`http://${process.env.REACT_APP_BACK_URL}/member/login`, {
                    username: res.data.email,
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
                    alert(t('googleLogin.alreadySignoutMessage'));
                    navi('/');
                    console.error(e);
                });
            });
        })
        .catch((e) => {
            console.error(e);
        });
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

export default GoogleLogin