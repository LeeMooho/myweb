import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Container, TableBody, Button, Pagination, Alert, CircularProgress } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBoards } from '../api/boardApi';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BoardListTable = () => {
    const boards = useSelector(state => state.boards.boards);
    const searchCondition = useSelector(state => state.boards.searchCondition);
    const searchKeyword = useSelector(state => state.boards.searchKeyword);
    const page = useSelector(state => state.boards.page);
    const listStatus = useSelector(state => state.boards.listStatus);
    const loading = listStatus === 'loading';
    const dispatch = useDispatch();
    const navi = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const request = dispatch(getBoards({searchCondition: 'all', searchKeyword: '', page: 0}));
        return () => request.abort();
    }, [dispatch]);

    const changePage = useCallback((e, v) => {
        dispatch(getBoards({
            searchCondition,
            searchKeyword: searchKeyword,
            page: parseInt(v) - 1
        }));
    }, [dispatch, searchCondition, searchKeyword]);

  return (
    <>
        <Container maxWidth='xl' aria-busy={loading}>
            {loading && <div role="status" style={{textAlign: 'center', marginTop: '1rem'}}>
                <CircularProgress size={24} aria-label={t('boardListTable.loading')} />
            </div>}
            {listStatus === 'failed' && <Alert severity="error" action={
                <Button color="inherit" onClick={() => dispatch(getBoards({searchCondition, searchKeyword, page}))}>
                    {t('boardListTable.retry')}
                </Button>
            }>{t('boardListTable.loadError')}</Alert>}
            <TableContainer component={Paper} style={{marginTop: '3%'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('boardListTable.no')}</TableCell>
                            <TableCell>{t('boardListTable.title')}</TableCell>
                            <TableCell>{t('boardListTable.author')}</TableCell>
                            <TableCell>{t('boardListTable.date')}</TableCell>
                            <TableCell>{t('boardListTable.views')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listStatus === 'succeeded' && !boards.content?.length &&
                            <TableRow><TableCell colSpan={5} align="center">
                                {t('boardListTable.empty')}
                            </TableCell></TableRow>}
                        {boards.content && boards.content.map(
                            (board) =>
                                <TableRow key={board.boardNo}>
                                    <TableCell>{board.boardNo}</TableCell>
                                    <TableCell>
                                        <Link to={`/board/${board.boardNo}`}>{board.boardTitle}</Link>
                                    </TableCell>
                                    <TableCell>{board.boardWriter}</TableCell>
                                    <TableCell>{board.boardRegdate}</TableCell>
                                    <TableCell>{board.boardCnt}</TableCell>
                                </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
        <Container
            maxWidth="xl"
            style={{marginTop: '1%', display: 'flex', justifyContent: 'right'}}>
            <Button type='button' color='primary' onClick={() => navi('/post')}>{t('boardListTable.write')}</Button>
        </Container>
        <Container
            maxWidth="xl"
            style={{marginTop: '1%', marginBottom: '1%',
                     display: 'flex', justifyContent: 'center'}}>
            {boards.totalPages > 0 && <Pagination disabled={loading} count={boards.totalPages} page={page + 1} onChange={changePage}></Pagination>}
        </Container>
    </>
  );
}

export default BoardListTable;
