package com.bit.boardapp.board.persistence;

import com.bit.boardapp.board.domain.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BoardRepositoryCustom {
    Page<Board> searchAll(Pageable pageable, String searchCondition, String searchKeyword);
}
