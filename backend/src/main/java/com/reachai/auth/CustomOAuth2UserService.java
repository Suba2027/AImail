package com.reachai.auth;

import com.reachai.user.User;
import com.reachai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String avatar = oAuth2User.getAttribute("picture");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from Google OAuth2 provider");
        }

        User user = userRepository.findByEmail(email).orElseGet(User::new);
        user.setEmail(email);
        user.setName(name);
        user.setGoogleId(googleId);
        user.setAvatar(avatar);
        User saved = userRepository.save(user);

        return UserPrincipal.create(saved, oAuth2User.getAttributes());
    }
}
