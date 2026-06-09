package com.piggy.transaction;

import com.piggy.transaction.dto.TransactionRequest;
import com.piggy.transaction.dto.TransactionResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(@Valid @RequestBody TransactionRequest req) {
        Transaction tx = transactionService.create(
                req.type(), req.amount(), req.category(), req.title(), req.paymentMethod(), req.memo(), req.date());
        return TransactionResponse.from(tx);
    }

    @GetMapping
    public List<TransactionResponse> list(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        List<Transaction> txs = (year != null && month != null)
                ? transactionService.findByMonth(year, month)
                : transactionService.findAll();
        return txs.stream().map(TransactionResponse::from).toList();
    }

    @PutMapping("/{id}")
    public TransactionResponse update(@PathVariable Long id, @Valid @RequestBody TransactionRequest req) {
        Transaction tx = transactionService.update(
                id, req.type(), req.amount(), req.category(), req.title(), req.paymentMethod(), req.memo(), req.date());
        return TransactionResponse.from(tx);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        transactionService.delete(id);
    }
}
