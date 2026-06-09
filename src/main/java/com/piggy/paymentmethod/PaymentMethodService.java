package com.piggy.paymentmethod;

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
        return repository.findAllByOrderByNameAsc();
    }

    @Transactional
    public PaymentMethod create(String name) {
        String n = name.trim();
        if (repository.existsByName(n)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 지출방법이에요.");
        }
        return repository.save(new PaymentMethod(n));
    }

    @Transactional
    public PaymentMethod update(Long id, String name) {
        String n = name.trim();
        PaymentMethod method = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "지출방법을 찾을 수 없어요."));
        if (repository.existsByNameAndIdNot(n, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 지출방법이에요.");
        }
        method.rename(n);
        return method;
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "지출방법을 찾을 수 없어요.");
        }
        repository.deleteById(id);
    }
}
