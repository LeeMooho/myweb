import React, { useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MoonLoader } from "react-spinners";
import { Grid } from '@mui/material';

const GoogleLogin = () => {
    const navi = useNavigate();

    useEffect(() => {
        const params= new URL(document.location.toString()).searchParams;
        const code = params.get('code');
        const REST_API_KEY = process.env.REACT_APP_GOOGLE_REST_API;
        const CLIENT_SECRET_KEY = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
        const GRANT_TYPE = "authorization_code";
        const REDIRECT_URL =`http://${process.env.REACT_APP_FRONT_URL}/google-login`;
        console.log("code" + code);
        console.log("REST_API_KEY" + REST_API_KEY);
        console.log("CLIENT_SECRET_KEY" + CLIENT_SECRET_KEY);
        console.log("GRANT_TYPE" + GRANT_TYPE);
        console.log("REDIRECT_URL" + REDIRECT_URL);

    axios.post(
        `https://oauth2.googleapis.com/token?code=${code}&client_id=${REST_API_KEY}&client_secret=${CLIENT_SECRET_KEY}&redirect_uri=${REDIRECT_URL}&grant_type=${GRANT_TYPE}`,
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
                    alert('회원탈퇴한 계정입니다.');
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