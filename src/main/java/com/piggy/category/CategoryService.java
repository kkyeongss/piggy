package com.piggy.category;

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
        return repository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public List<String> savingsCategoryNames() {
        return repository.findBySavingsTrue().stream().map(Category::getName).toList();
    }

    @Transactional
    public Category create(TransactionType type, String name, boolean savings) {
        String n = name.trim();
        if (repository.existsByName(n)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 카테고리 이름이에요.");
        }
        return repository.save(new Category(type, n, savings));
    }

    @Transactional
    public Category update(Long id, String name, boolean savings) {
        String n = name.trim();
        Category category = repository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없어요."));
        if (repository.existsByNameAndIdNot(n, id)) {
            throw new ApiException(HttpStatus.CONFLICT, "이미 등록된 카테고리 이름이에요.");
        }
        category.update(n, savings);
        return category;
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없어요.");
        }
        repository.deleteById(id);
    }
}
