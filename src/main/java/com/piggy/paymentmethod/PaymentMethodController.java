package com.piggy.paymentmethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    public List<Res> list() {
        return paymentMethodService.list().stream().map(m -> new Res(m.getId(), m.getName())).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Res create(@Valid @RequestBody Req req) {
        PaymentMethod m = paymentMethodService.create(req.name());
        return new Res(m.getId(), m.getName());
    }

    @PutMapping("/{id}")
    public Res update(@PathVariable Long id, @Valid @RequestBody Req req) {
        PaymentMethod m = paymentMethodService.update(id, req.name());
        return new Res(m.getId(), m.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        paymentMethodService.delete(id);
    }

    public record Req(@NotBlank(message = "이름을 입력해주세요.") @Size(max = 50) String name) {
    }

    public record Res(Long id, String name) {
    }
}
