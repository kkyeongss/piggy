package com.piggy.reset;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reset")
public class ResetController {

    private final ResetService resetService;

    public ResetController(ResetService resetService) {
        this.resetService = resetService;
    }

    @DeleteMapping("/{target}")
    public ResponseEntity<Void> reset(@PathVariable String target) {
        resetService.reset(target);
        return ResponseEntity.noContent().build();
    }
}
