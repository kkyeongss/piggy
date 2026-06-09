package com.piggy.category;

import com.piggy.transaction.TransactionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<Res> list() {
        return categoryService.list().stream()
                .map(c -> new Res(c.getId(), c.getName(), c.getType(), c.isSavings()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Res create(@Valid @RequestBody CreateReq req) {
        Category c = categoryService.create(req.type(), req.name(), Boolean.TRUE.equals(req.savings()));
        return new Res(c.getId(), c.getName(), c.getType(), c.isSavings());
    }

    @PutMapping("/{id}")
    public Res update(@PathVariable Long id, @Valid @RequestBody UpdateReq req) {
        Category c = categoryService.update(id, req.name(), Boolean.TRUE.equals(req.savings()));
        return new Res(c.getId(), c.getName(), c.getType(), c.isSavings());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }

    public record CreateReq(
            @NotNull(message = "수입/지출 구분은 필수입니다.") TransactionType type,
            @NotBlank(message = "이름을 입력해주세요.") @Size(max = 50) String name,
            Boolean savings
    ) {
    }

    public record UpdateReq(
            @NotBlank(message = "이름을 입력해주세요.") @Size(max = 50) String name,
            Boolean savings
    ) {
    }

    public record Res(Long id, String name, TransactionType type, boolean savings) {
    }
}
