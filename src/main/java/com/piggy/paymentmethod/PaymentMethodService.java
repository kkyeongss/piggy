package com.piggy.paymentmethod;

import com.piggy.auth.SecurityUtils;
import com.piggy.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository repository;

    public PaymentMethodService(PaymentMethodRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<PaymentMethod> list() {
        return repository.findByUserIdOrderByNameAsc(SecurityUtils.getCurrentUserId());
    }

    @Transactional
    public PaymentMethod create(String name) {
        Long userId = SecurityUtils.getCurrentUserId();
        String n = name.trim();
        if (repository.existsByUserIdAndName(userId, n)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 지출방법이에요.");
        }
        return repository.save(new PaymentMethod(userId, n));
    }

    @Transactional
    public PaymentMethod update(Long id, String name) {
        Long userId = SecurityUtils.getCurrentUserId();
        String n = name.trim();
        PaymentMethod method = repository.findById(id)
                .filter(m -> m.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "지출방법을 찾을 수 없어요."));
        if (repository.existsByUserIdAndNameAndIdNot(userId, n, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 지출방법이에요.");
        }
        method.rename(n);
        return method;
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        PaymentMethod method = repository.findById(id)
                .filter(m -> m.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "지출방법을 찾을 수 없어요."));
        repository.delete(method);
    }
}
