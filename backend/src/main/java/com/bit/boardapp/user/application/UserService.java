package com.bit.boardapp.user.application;

import com.bit.boardapp.user.application.dto.UserDTO;

public interface UserService {
    UserDTO join(UserDTO userDTO);

    UserDTO login(UserDTO userDTO);

    long idCheck(UserDTO userDTO);
}
