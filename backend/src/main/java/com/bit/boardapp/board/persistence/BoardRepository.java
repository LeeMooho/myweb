package com.bit.boardapp.board.persistence;

import com.bit.boardapp.board.domain.Board;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

@Transactional
public interface BoardRepository extends JpaRepository<Board, Long>, BoardRepositoryCustom {
}
