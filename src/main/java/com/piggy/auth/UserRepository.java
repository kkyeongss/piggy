package com.piggy.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
    Optional<User> findByNameAndPhone(String name, String phone);
    Optional<User> findByLoginIdAndNameAndPhone(String loginId, String name, String phone);
}
