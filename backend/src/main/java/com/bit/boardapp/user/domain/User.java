package com.bit.boardapp.user.domain;

import com.bit.boardapp.shared.domain.AuditingFields;
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
public class User extends AuditingFields {
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
    private String role;
    private boolean isActive;
    private LocalDateTime lastLoginDate;

}
