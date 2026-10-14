package com.reachai.user.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String avatar;
    private LocalDateTime createdAt;
}
