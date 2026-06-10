package com.piggy.category;

import com.piggy.auth.SecurityUtils;
import com.piggy.common.ApiException;
import com.piggy.transaction.TransactionType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Category> list() {
        return repository.findByUserIdOrderByNameAsc(SecurityUtils.getCurrentUserId());
    }

    @Transactional(readOnly = true)
    public List<String> savingsCategoryNames() {
        return repository.findByUserIdAndSavingsTrue(SecurityUtils.getCurrentUserId())
                .stream().map(Category::getName).toList();
    }

    @Transactional
    public Category create(TransactionType type, String name, boolean savings) {
        Long userId = SecurityUtils.getCurrentUserId();
        String n = name.trim();
        if (repository.existsByUserIdAndName(userId, n)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 카테고리 이름이에요.");
        }
        return repository.save(new Category(userId, type, n, savings));
    }

    @Transactional
    public Category update(Long id, String name, boolean savings) {
        Long userId = SecurityUtils.getCurrentUserId();
        String n = name.trim();
        Category category = repository.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없어요."));
        if (repository.existsByUserIdAndNameAndIdNot(userId, n, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 카테고리 이름이에요.");
        }
        category.update(n, savings);
        return category;
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Category category = repository.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없어요."));
        repository.delete(category);
    }
}
