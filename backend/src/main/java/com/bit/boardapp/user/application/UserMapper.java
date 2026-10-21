package com.bit.boardapp.user.application;

import com.bit.boardapp.user.application.dto.UserDTO;
import com.bit.boardapp.user.domain.User;

import java.time.LocalDateTime;

public final class UserMapper {
    private UserMapper() { }

    public static UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId()).userId(user.getUserId()).userPw(user.getUserPw())
                .userName(user.getUserName()).userEmail(user.getUserEmail()).userTel(user.getUserTel())
                .role(user.getRole()).isActive(user.isActive())
                .lastLoginDate(user.getLastLoginDate().toString()).build();
    }

    public static User toEntity(UserDTO dto) {
        return User.builder()
                .id(dto.getId()).userId(dto.getUserId()).userPw(dto.getUserPw())
                .userName(dto.getUserName()).userEmail(dto.getUserEmail()).userTel(dto.getUserTel())
                .role(dto.getRole()).isActive(dto.isActive())
                .lastLoginDate(LocalDateTime.parse(dto.getLastLoginDate())).build();
    }
}
