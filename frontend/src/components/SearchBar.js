import { Button, Container, Grid, NativeSelect, TextField } from '@mui/material';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    change_searchCondition, 
    change_searchKeyword
} from '../slices/boardSlice';
import {getBoards} from '../apis/boardApi';
import { useTranslation } from 'react-i18next';


const SearchBar = () => {
    const dispatch = useDispatch();
    const searchCondition = useSelector(state => state.boards.searchCondition);
    const searchKeyword = useSelector(state => state.boards.searchKeyword);
    const { t } = useTranslation();

    const changeSearchCondition = useCallback((e) => {
        dispatch(change_searchCondition(e.target.value));
    }, [dispatch]);

    const changeSearchKeyword = useCallback((e) => {
        dispatch(change_searchKeyword(e.target.value));
    }, [dispatch]);

    const search = useCallback((e) => {
        e.preventDefault();

        dispatch(
            getBoards(
                {searchCondition: searchCondition, searchKeyword: searchKeyword, page: 0}
            )
        );
    }, [dispatch, searchCondition, searchKeyword]);

  return (
    <Container component='div' maxWidth="md" style={{marginTop: '3%'}}>
        <form onSubmit={search}>
            <Grid container spacing={1}>
                <Grid item md={3}>
                    <NativeSelect
                        defaultValue={searchCondition}
                        inputProps={{
                            name: 'searchCondition'
                        }}
                        fullWidth
                        onChange={changeSearchCondition}
                    >
                        <option value='all'>All</option>
                        <option value='title'>{t('searchBar.title')}</option>
                        <option value='content'>{t('searchBar.contents')}</option>
                        <option value='writer'>{t('searchBar.author')}</option>
                    </NativeSelect>
                </Grid>
                <Grid item md={7}>
                    <TextField
                        id="searchKeyword"
                        variant='standard'
                        name='searchKeyword'
                        fullWidth
                        value={searchKeyword}
                        onChange={changeSearchKeyword}
                    ></TextField>
                </Grid>
                <Grid item md={2}>
                    <Button
                        color='primary'
                        type='submit'>
                        {t('searchBar.search')}
                    </Button>
                </Grid>
            </Grid>
        </form>
    </Container>
  );
}

export default SearchBar;