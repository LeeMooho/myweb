package com.bit.boardapp.user.application;

import com.bit.boardapp.user.application.dto.UserDTO;
import com.bit.boardapp.user.domain.User;
import com.bit.boardapp.shared.security.JwtTokenProvider;
import com.bit.boardapp.user.persistence.UserRepository;
import com.bit.boardapp.user.application.UserService;
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
        User user = userRepository.save(UserMapper.toEntity(userDTO));

        return UserMapper.toDTO(user);
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

        UserDTO loginUserDTO = UserMapper.toDTO(loginUser.get());

        loginUserDTO.setLastLoginDate(LocalDateTime.now().toString());
        loginUserDTO.setToken(jwtTokenProvider.create(loginUser.get().getUserId()));

        userRepository.save(UserMapper.toEntity(loginUserDTO));
        userRepository.flush();

        return loginUserDTO;
    }

    @Override
    public long idCheck(UserDTO userDTO) {
        return userRepository.countByUserId(userDTO.getUserId());
    }
}
