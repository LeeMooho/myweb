package com.bit.boardapp.repository;

import com.bit.boardapp.entity.Board;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

@Transactional
public interface BoardRepository extends JpaRepository<Board, Long>, BoardRepositoryCustom {
}
