package com.reachai.user;

import com.reachai.user.dto.CreateUserDTO;
import com.reachai.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO createUser(CreateUserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setGoogleId(dto.getGoogleId());
        user.setAvatar(dto.getAvatar());
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    public UserDTO getUser(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
