package com.piggy.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigration.class);

    private final JdbcTemplate jdbc;

    public SchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(ApplicationArguments args) {
        // H2 2.4.x 버그: ADD CONSTRAINT로 추가한 CHECK 표현식이 파일 체크포인트 시 빈 body로 깨짐.
        // Hibernate enum 검증이 DB보다 먼저 실행되므로 DB 레벨 CHECK는 불필요.
        // 시작할 때마다 CHECK 제약을 모두 제거해 오류를 방지한다.
        dropAllCheckConstraints("transactions");
        dropAllCheckConstraints("categories");
    }

    private void dropAllCheckConstraints(String table) {
        String upperTable = table.toUpperCase();

        List<String> names = List.of();
        try {
            names = jdbc.queryForList(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
                "WHERE UPPER(TABLE_NAME) = ? AND CONSTRAINT_TYPE = 'CHECK'",
                String.class, upperTable
            );
        } catch (Exception e) {
            log.debug("SchemaMigration: {} 제약 조회 실패 - {}", table, e.getMessage());
        }

        for (String name : names) {
            try {
                jdbc.execute("ALTER TABLE " + table + " DROP CONSTRAINT IF EXISTS \"" + name + "\"");
                log.info("SchemaMigration: {} CHECK 제약 제거: {}", table, name);
            } catch (Exception e) {
                log.debug("SchemaMigration: {} 제약 {} 삭제 실패 - {}", table, name, e.getMessage());
            }
        }
    }
}
