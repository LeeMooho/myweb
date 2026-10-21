package com.bit.boardapp.user.security;

import com.bit.boardapp.user.application.dto.UserDTO;
import com.bit.boardapp.user.application.UserMapper;
import com.bit.boardapp.user.security.CustomUserDetails;
import com.bit.boardapp.user.domain.User;
import com.bit.boardapp.user.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    // SpringSecurity 인증과정에서 자동으로 호출되는 메소드
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findByUserId(username);

        if(userOptional.isEmpty()) {
            return null;
        } else if(!userOptional.get().isActive()) {
            throw new RuntimeException("inActive");
        }

        // 로그인 성공 시 로그인 날짜 업데이트
        UserDTO loginUser = UserMapper.toDTO(userOptional.get());
        loginUser.setLastLoginDate(LocalDateTime.now().toString());

        User user = UserMapper.toEntity(loginUser);
        userRepository.save(user);

        userRepository.flush();

        return CustomUserDetails.builder()
                .user(user)
                .build();
    }
}
