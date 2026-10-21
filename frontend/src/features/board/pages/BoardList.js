import React from 'react';
import SearchBar from '../components/SearchBar';
import BoardListTable from '../components/BoardListTable';

const BoardList = () => {
  return (
    <>
        <SearchBar></SearchBar>
        <BoardListTable></BoardListTable>
    </>
  );
}

export default BoardList;