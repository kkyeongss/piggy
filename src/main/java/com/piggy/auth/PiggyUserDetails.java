package com.piggy.auth;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class PiggyUserDetails implements UserDetails {

    private final Long userId;
    private final String loginId;
    private final String passwordHash;

    public PiggyUserDetails(Long userId, String loginId, String passwordHash) {
        this.userId = userId;
        this.loginId = loginId;
        this.passwordHash = passwordHash;
    }

    public Long getUserId() { return userId; }

    @Override public String getUsername() { return loginId; }
    @Override public String getPassword() { return passwordHash; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
