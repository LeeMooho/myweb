package com.bit.boardapp.board.persistence;

import com.bit.boardapp.board.domain.BoardFile;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

@Transactional
public interface BoardFileRepository extends JpaRepository<BoardFile, Long> {
}
