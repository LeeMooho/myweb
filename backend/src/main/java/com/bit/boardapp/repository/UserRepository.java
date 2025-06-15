package com.bit.boardapp.repository;

import com.bit.boardapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserId(String username);

    long countByUserId(String userId);
}
