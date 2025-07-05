package com.bit.boardapp.service;
import com.bit.boardapp.dto.UserDTO;

public interface SendEmailService {

    public void mailSend(UserDTO userDTO);

}
