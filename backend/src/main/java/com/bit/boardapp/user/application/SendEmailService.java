package com.bit.boardapp.user.application;
import com.bit.boardapp.user.application.dto.UserDTO;

public interface SendEmailService {

    public void mailSend(UserDTO userDTO);

}
