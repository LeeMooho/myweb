package com.bit.boardapp.repository;

import com.bit.boardapp.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BoardRepositoryCustom {
    Page<Board> searchAll(Pageable pageable, String searchCondition, String searchKeyword);
}
