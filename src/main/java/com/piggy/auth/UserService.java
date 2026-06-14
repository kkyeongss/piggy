package com.piggy.auth;

import com.piggy.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User signup(String loginId, String password, String name, String phone) {
        if (userRepository.existsByLoginId(loginId)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 사용 중인 아이디에요.");
        }
        return userRepository.save(new User(loginId, passwordEncoder.encode(password), name, phone));
    }

    @Transactional(readOnly = true)
    public User authenticate(String loginId, String password) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인해주세요."));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인해주세요.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public String findLoginId(String name, String phone) {
        return userRepository.findByNameAndPhone(name, phone)
                .map(User::getLoginId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "일치하는 계정을 찾을 수 없어요."));
    }

    @Transactional(readOnly = true)
    public void verifyIdentity(String loginId, String name, String phone) {
        userRepository.findByLoginIdAndNameAndPhone(loginId, name, phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "일치하는 계정을 찾을 수 없어요."));
    }

    @Transactional
    public void resetPassword(String loginId, String name, String phone, String newPassword) {
        User user = userRepository.findByLoginIdAndNameAndPhone(loginId, name, phone)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "일치하는 계정을 찾을 수 없어요."));
        user.changePassword(passwordEncoder.encode(newPassword));
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없어요."));
    }

    @Transactional
    public void updateTheme(Long userId, String theme) {
        User user = findById(userId);
        user.changeTheme(theme);
    }

    /** 빠른 입장용 기본 계정 — 없으면 자동 생성 */
    @Transactional
    public User getOrCreateHomeUser() {
        return userRepository.findByLoginId("home")
                .orElseGet(() -> userRepository.save(
                        new User("home", passwordEncoder.encode("home"), "집", "010-0000-0000")));
    }
}
