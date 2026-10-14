package com.reachai.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String avatar;

    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getEmail(), user.getName(), user.getAvatar());
    }
}
