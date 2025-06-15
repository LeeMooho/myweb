package com.bit.boardapp.service.impl;

import com.bit.boardapp.dto.UserDTO;
import com.bit.boardapp.entity.User;
import com.bit.boardapp.jwt.JwtTokenProvider;
import com.bit.boardapp.repository.UserRepository;
import com.bit.boardapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDTO join(UserDTO userDTO) {
        User user = userRepository.save(userDTO.toEntity());

        return user.toDTO();
    }

    @Override
    public UserDTO login(UserDTO userDTO) {
        Optional<User> loginUser = userRepository.findByUserId(userDTO.getUserId());

        if(loginUser.isEmpty()) {
            throw new RuntimeException("not exist userid");
        }

        if(!passwordEncoder.matches(userDTO.getUserPw(), loginUser.get().getUserPw())) {
            throw new RuntimeException("wrong password");
        }

        UserDTO loginUserDTO = loginUser.get().toDTO();

        loginUserDTO.setLastLoginDate(LocalDateTime.now().toString());
        loginUserDTO.setToken(jwtTokenProvider.create(loginUser.get()));

        userRepository.save(loginUserDTO.toEntity());
        userRepository.flush();

        return loginUserDTO;
    }

    @Override
    public long idCheck(UserDTO userDTO) {
        return userRepository.countByUserId(userDTO.getUserId());
    }
}
