package com.bit.boardapp.board.application;

import com.bit.boardapp.board.application.dto.BoardDTO;
import com.bit.boardapp.board.application.dto.BoardFileDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BoardService {
    Page<BoardDTO> searchAll(Pageable pageable, String searchCondition, String searchKeyword);

    void post(BoardDTO boardDTO);

    BoardDTO findById(long boardNo);

    void modify(BoardDTO boardDTO, List<BoardFileDTO> uBoardFileList);

    void deleteById(long boardNo);
}
