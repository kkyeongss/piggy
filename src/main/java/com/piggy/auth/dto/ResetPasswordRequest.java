package com.piggy.auth.dto;

public record ResetPasswordRequest(String loginId, String name, String phone, String newPassword) {}
