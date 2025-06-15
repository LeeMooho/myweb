import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, Container, TableBody, Button, Pagination } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBoards } from '../apis/boardApi';
import { Link, useNavigate } from 'react-router-dom';

const BoardListTable = () => {
    const boards = useSelector(state => state.boards.boards);
    const searchCondtion = useSelector(state => state.boards.searchCondition);
    const searchKeyword = useSelector(state => state.boards.searchKeyword);
    const page = useSelector(state => state.boards.page);
    const dispatch = useDispatch();
    const navi = useNavigate();

    useEffect(() => {
        dispatch(getBoards({searchCondition: 'all', searchKeyword: '', page: 0}));
    }, []);

    const changePage = useCallback((e, v) => {
        dispatch(getBoards({
            searchCondition: searchCondtion,
            searchKeyword: searchKeyword,
            page: parseInt(v) - 1
        }));
    }, [searchCondtion, searchKeyword]);

  return (
    <>
        <Container maxWidth='xl'>
            <TableContainer component={Paper} style={{marginTop: '3%'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>번호</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>작성자</TableCell>
                            <TableCell>작성일</TableCell>
                            <TableCell>조회수</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {boards.content && boards.content.map(
                            (board, index) => 
                                <TableRow key={index}>
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
            <Button type='button' color='primary' onClick={() => navi('/post')}>글 등록</Button>
        </Container>
        <Container
            maxWidth="xl"
            style={{marginTop: '1%', marginBottom: '1%',
                     display: 'flex', justifyContent: 'center'}}>
            {boards && <Pagination count={boards.totalPages} page={page + 1} onChange={changePage}></Pagination>}
        </Container>
    </>
  );
}

export default BoardListTable;