package com.bit.boardapp.user.application;

import com.bit.boardapp.shared.security.JwtTokenProvider;
import com.bit.boardapp.user.application.dto.UserDTO;
import com.bit.boardapp.user.domain.User;
import com.bit.boardapp.user.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    @Mock private UserRepository users;
    @Mock private JwtTokenProvider tokens;
    @Mock private PasswordEncoder passwords;
    @InjectMocks private UserServiceImpl service;

    private User user() {
        return User.builder().id(7).userId("writer").userPw("encoded-password")
                .userName("Writer").userEmail("writer@example.test").role("ROLE_USER")
                .isActive(true).lastLoginDate(LocalDateTime.of(2026, 1, 1, 12, 0)).build();
    }

    @Test
    void loginKeepsIdentityAndIssuesATokenThroughTheSharedStringBasedContract() {
        when(users.findByUserId("writer")).thenReturn(Optional.of(user()));
        when(passwords.matches("password", "encoded-password")).thenReturn(true);
        when(tokens.create("writer")).thenReturn("signed-token");
        LocalDateTime before = LocalDateTime.now();

        UserDTO result = service.login(UserDTO.builder().userId("writer").userPw("password").build());

        assertThat(result.getUserId()).isEqualTo("writer");
        assertThat(result.getToken()).isEqualTo("signed-token");
        ArgumentCaptor<User> updated = ArgumentCaptor.forClass(User.class);
        verify(users).save(updated.capture());
        assertThat(updated.getValue().getId()).isEqualTo(7);
        assertThat(updated.getValue().getRole()).isEqualTo("ROLE_USER");
        assertThat(updated.getValue().getLastLoginDate()).isBetween(before, LocalDateTime.now());
        verify(users).flush();
    }

    @Test
    void missingUserIsReportedWithoutIssuingAToken() {
        when(users.findByUserId("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.login(UserDTO.builder().userId("missing").build()))
                .hasMessage("not exist userid");
        verifyNoInteractions(tokens, passwords);
        verify(users, never()).save(any());
    }

    @Test
    void invalidPasswordDoesNotUpdateTheUserOrIssueAToken() {
        when(users.findByUserId("writer")).thenReturn(Optional.of(user()));
        when(passwords.matches("wrong", "encoded-password")).thenReturn(false);
        assertThatThrownBy(() -> service.login(UserDTO.builder().userId("writer").userPw("wrong").build()))
                .hasMessage("wrong password");
        verifyNoInteractions(tokens);
        verify(users, never()).save(any());
    }

    @Test
    void registrationMapsTheApplicationContractWithoutLeakingDomainObjects() {
        when(users.save(any(User.class))).thenReturn(user());
        UserDTO request = UserDTO.builder().userId("writer").userPw("encoded-password")
                .userName("Writer").userEmail("writer@example.test").role("ROLE_USER")
                .isActive(true).lastLoginDate("2026-01-01T12:00").build();

        UserDTO result = service.join(request);

        assertThat(result.getId()).isEqualTo(7);
        assertThat(result.getUserEmail()).isEqualTo("writer@example.test");
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getUserId()).isEqualTo("writer");
        assertThat(saved.getValue().getUserPw()).isEqualTo("encoded-password");
        assertThat(saved.getValue().isActive()).isTrue();
    }
}
