package com.piggy.auth;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PhoneVerificationService {

    private record Entry(String code, Instant expiresAt) {}

    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generateCode(String phone) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        store.put(phone, new Entry(code, Instant.now().plusSeconds(180)));
        return code;
    }

    public boolean verify(String phone, String code) {
        Entry entry = store.get(phone);
        if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
            return false;
        }
        boolean valid = entry.code().equals(code);
        if (valid) store.remove(phone);
        return valid;
    }
}
