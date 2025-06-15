package com.bit.boardapp.service;

import com.bit.boardapp.dto.UserDTO;

public interface UserService {
    UserDTO join(UserDTO userDTO);

    UserDTO login(UserDTO userDTO);

    long idCheck(UserDTO userDTO);
}
