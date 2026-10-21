package com.bit.boardapp.user.application.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
public class UserDTO {
    private long id;
    private String userId;
    private String userPw;
    private String userName;
    private String userEmail;
    private String userTel;
    private String userRegdate;
    private String role;
    private String curUserPw;
    private boolean isActive;
    private String lastLoginDate;
    private String token;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime modifiedAt;
    private String modifiedBy;

}
