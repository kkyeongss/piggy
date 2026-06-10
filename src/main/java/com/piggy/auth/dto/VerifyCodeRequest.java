package com.piggy.auth.dto;

public record VerifyCodeRequest(String phone, String code) {}
