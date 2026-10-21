import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useState } from 'react';


const Footer = () => {
    const [hover, setHover] = useState(false);
    return (        
    <div className="footer">
            <Grid container spacing={3} justifyContent="space-around" sx={{marginTop:'0'}}>
                <Grid item>
                    <Typography style={{fontSize:'0.875rem', fontFamily: 'Pretendard SemiBold'}}></Typography>
                    <Typography style={{fontSize:'0.875rem', marginTop:'0.725rem'}}>Copyright © 2025 - 2025. Mooho</Typography>
                </Grid>
                <Grid item>
                    <Link
                        to="/noticelist"
                        style={{ textDecoration: 'none', color: hover ? '#558BCF' : 'inherit' }}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <Typography style={{fontSize:'0.875rem',  fontFamily: 'Pretendard SemiBold'}}></Typography>
                    </Link>
                    <Typography style={{fontSize:'0.725rem', marginTop:'0.725rem'}}></Typography>
                </Grid>
            </Grid>
        </div>
        );
};


export default Footer;