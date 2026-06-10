package com.piggy.auth.dto;

public record SignupRequest(String loginId, String password, String name, String phone) {}
