package com.bit.boardapp.repository;

import com.bit.boardapp.entity.BoardFile;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

@Transactional
public interface BoardFileRepository extends JpaRepository<BoardFile, Long> {
}
