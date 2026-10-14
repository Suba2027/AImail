package com.reachai.user;

import com.reachai.auth.UserPrincipal;
import com.reachai.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Only the caller's own profile is ever exposed. There is deliberately no
     * GET /api/users or GET /api/users/{id} - those would let any authenticated
     * user enumerate other users' profiles by id.
     */
    @GetMapping("/me")
    public UserDTO getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDTO.from(user);
    }
}
