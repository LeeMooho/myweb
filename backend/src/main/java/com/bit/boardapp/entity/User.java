package com.bit.boardapp.entity;

import com.bit.boardapp.dto.UserDTO;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "T_USER")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private long id;
    @Column(unique = true)
    private String userId;
    private String userPw;
    private String userName;
    private String userEmail;
    private String userTel;
    private LocalDateTime userRegdate;
    private String role;
    private boolean isActive;
    private LocalDateTime lastLoginDate;

    public UserDTO toDTO() {
        return UserDTO.builder()
                .id(this.id)
                .userId(this.userId)
                .userPw(this.userPw)
                .userName(this.userName)
                .userEmail(this.userEmail)
                .userTel(this.userTel)
                .userRegdate(this.userRegdate.toString())
                .role(this.role)
                .isActive(this.isActive)
                .lastLoginDate(this.lastLoginDate.toString())
                .build();
    }
}
