package com.piggy.paymentmethod;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByUserIdOrderByNameAsc(Long userId);

    boolean existsByUserIdAndName(Long userId, String name);

    boolean existsByUserIdAndNameAndIdNot(Long userId, String name, Long id);
}
