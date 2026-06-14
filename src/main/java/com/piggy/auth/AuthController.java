package com.piggy.auth;

import com.piggy.auth.dto.FindIdRequest;
import com.piggy.auth.dto.FindPasswordRequest;
import com.piggy.auth.dto.LoginRequest;
import com.piggy.auth.dto.PhoneCodeRequest;
import com.piggy.auth.dto.ResetPasswordRequest;
import com.piggy.auth.dto.SignupRequest;
import com.piggy.auth.dto.VerifyCodeRequest;
import com.piggy.common.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PhoneVerificationService phoneVerificationService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SecurityContextHolderStrategy securityContextHolderStrategy =
            SecurityContextHolder.getContextHolderStrategy();

    public AuthController(UserService userService,
                          PhoneVerificationService phoneVerificationService,
                          AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository) {
        this.userService = userService;
        this.phoneVerificationService = phoneVerificationService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        PiggyUserDetails principal = (PiggyUserDetails) auth.getPrincipal();
        User user = userService.findById(principal.getUserId());
        return ResponseEntity.ok(Map.of("loginId", user.getLoginId(), "theme", user.getTheme()));
    }

    @PatchMapping("/me/theme")
    @Transactional
    public ResponseEntity<Void> updateTheme(@RequestBody Map<String, String> body, Authentication auth) {
        String theme = body.get("theme");
        if (!"light".equals(theme) && !"dark".equals(theme)) {
            return ResponseEntity.badRequest().build();
        }
        PiggyUserDetails principal = (PiggyUserDetails) auth.getPrincipal();
        userService.updateTheme(principal.getUserId(), theme);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req,
                                   HttpServletRequest request,
                                   HttpServletResponse response) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.loginId(), req.password()));
            SecurityContext context = securityContextHolderStrategy.createEmptyContext();
            context.setAuthentication(auth);
            securityContextHolderStrategy.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            PiggyUserDetails user = (PiggyUserDetails) auth.getPrincipal();
            return ResponseEntity.ok(Map.of("loginId", user.getUsername()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "아이디 또는 비밀번호를 확인해주세요."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequest req) {
        userService.signup(req.loginId(), req.password(), req.name(), req.phone());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody FindIdRequest req) {
        String loginId = userService.findLoginId(req.name(), req.phone());
        return ResponseEntity.ok(Map.of("loginId", loginId));
    }

    @PostMapping("/find-password")
    public ResponseEntity<Void> findPassword(@RequestBody FindPasswordRequest req) {
        userService.verifyIdentity(req.loginId(), req.name(), req.phone());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest req) {
        userService.resetPassword(req.loginId(), req.name(), req.phone(), req.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/phone/send-code")
    public ResponseEntity<?> sendPhoneCode(@RequestBody PhoneCodeRequest req) {
        String devCode = phoneVerificationService.generateCode(req.phone());
        // 실제 SMS 연동 전까지 개발용 코드를 응답에 포함
        return ResponseEntity.ok(Map.of("devCode", devCode));
    }

    @PostMapping("/phone/verify-code")
    public ResponseEntity<Void> verifyPhoneCode(@RequestBody VerifyCodeRequest req) {
        if (!phoneVerificationService.verify(req.phone(), req.code())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "인증번호가 올바르지 않거나 만료되었어요.");
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quick-login")
    public ResponseEntity<?> quickLogin(HttpServletRequest request, HttpServletResponse response) {
        User user = userService.getOrCreateHomeUser();
        PiggyUserDetails principal = new PiggyUserDetails(user.getId(), user.getLoginId(), user.getPasswordHash());
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(auth);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return ResponseEntity.ok(Map.of("loginId", user.getLoginId()));
    }
}
