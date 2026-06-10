package com.piggy.auth.dto;

public record FindPasswordRequest(String loginId, String name, String phone) {}
