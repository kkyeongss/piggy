# piggy 프로젝트 학습 정리

> "내가 만든 것을 내가 설명할 수 있어야 진짜 아는 것이다."  
> 이 문서는 piggy 가계부 앱을 만들면서 사용한 기술과 결정, 그리고 겪은 문제들을 신입 개발자 눈높이에서 정리한 것입니다.

---

## 목차

1. [프로젝트 구조 이해하기](#1-프로젝트-구조-이해하기)
2. [백엔드 - Spring Boot](#2-백엔드---spring-boot)
3. [데이터베이스 - JPA와 H2](#3-데이터베이스---jpa와-h2)
4. [인증 - Spring Security](#4-인증---spring-security)
5. [프론트엔드 - React + Vite](#5-프론트엔드---react--vite)
6. [API 설계 패턴](#6-api-설계-패턴)
7. [실제로 겪은 문제와 해결법](#7-실제로-겪은-문제와-해결법)
8. [배포 - Oracle Cloud + Caddy](#8-배포---oracle-cloud--caddy)
9. [핵심 설계 결정들](#9-핵심-설계-결정들)

---

## 1. 프로젝트 구조 이해하기

### 전체 구조

```
piggy/
├── src/main/java/com/piggy/     ← 백엔드 (Java)
├── src/main/resources/          ← 설정 파일
├── frontend/                    ← 프론트엔드 (React)
└── build/libs/piggy.jar         ← 빌드 결과물
```

### 왜 이 구조인가?

이 프로젝트는 **단일 JAR 배포** 방식을 선택했습니다.  
프론트엔드(React)를 빌드하면 HTML/JS/CSS 파일이 생성되고, 이것을 `src/main/resources/static/` 폴더에 넣으면 Spring Boot가 정적 파일로 함께 서빙합니다.

```
빌드 과정:
1. npm run build → frontend/dist/ 생성
2. Gradle이 dist/ 파일을 static/ 로 복사
3. ./gradlew bootJar → piggy.jar 하나로 패키징
4. java -jar piggy.jar → 백엔드 + 프론트엔드 모두 실행
```

**장점**: 서버에 JAR 파일 하나만 올리면 됩니다.  
**단점**: 프론트 수정마다 전체 빌드가 필요합니다. (개발 중에는 Vite dev server를 따로 띄웁니다)

### 백엔드 패키지 구조 (도메인 주도)

```
com/piggy/
├── auth/           # 인증 (로그인, 회원가입, 세션)
├── transaction/    # 거래 (수입/지출/저축)
├── category/       # 카테고리
├── paymentmethod/  # 지출방법(결제수단)
├── budget/         # 예산
├── dashboard/      # 대시보드 집계
├── reset/          # 데이터 초기화
├── config/         # 설정 (Security, DB 마이그레이션 등)
└── common/         # 공통 (예외 처리 등)
```

**왜 기능별(auth, transaction...)로 나누는가?**  
기능이 많아질수록 파일을 찾기 어려워집니다. 예를 들어 "카테고리 수정 로직이 어디 있지?"라는 질문이 생겼을 때, `category/` 폴더만 열면 됩니다. 이것을 **도메인 패키지** 구조라고 합니다.

각 도메인 폴더에는 보통 4가지 파일이 있습니다:
- `Category.java` - 데이터 구조 (Entity)
- `CategoryRepository.java` - DB 접근
- `CategoryService.java` - 비즈니스 로직
- `CategoryController.java` - HTTP 요청 처리

---

## 2. 백엔드 - Spring Boot

### Controller → Service → Repository 3계층

```
사용자 요청 (HTTP)
    ↓
Controller  : "어떤 URL로 왔고, 뭘 반환할까?" (HTTP 담당)
    ↓
Service     : "실제 비즈니스 로직은 어떻게?" (핵심 로직)
    ↓
Repository  : "DB에서 어떻게 가져올까?" (DB 접근)
```

**예시 - 카테고리 목록 조회:**

```java
// Controller: GET /api/categories 요청을 받아 Service에 위임
@GetMapping
public ResponseEntity<List<Category>> list() {
    return ResponseEntity.ok(categoryService.list());
}

// Service: 로직 처리 (현재 로그인한 사용자의 카테고리만 조회)
public List<Category> list() {
    return repository.findByUserIdOrderByNameAsc(SecurityUtils.getCurrentUserId());
}

// Repository: JPA가 자동으로 SQL 생성
List<Category> findByUserIdOrderByNameAsc(Long userId);
// → SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC
```

**왜 3계층으로 나누는가?**  
Controller가 DB에 직접 접근하거나 Service가 HTTP를 알면 코드가 뒤섞여 나중에 고치기 어렵습니다. 각 계층이 자기 역할만 담당해야 수정이 쉽습니다.

### @Transactional 이란?

```java
@Transactional
public Category update(Long id, String name, boolean savings) {
    Category category = repository.findById(id)...;
    String oldName = category.getName();
    category.update(name, savings);                          // 카테고리명 변경
    transactionRepository.bulkRenameCategory(userId, oldName, name); // 거래 내역도 변경
    return category;
}
```

`@Transactional`은 이 메서드 안의 모든 DB 작업을 하나로 묶습니다.  
카테고리명은 바꿨는데 거래 내역 업데이트 중간에 오류가 나면? → 둘 다 없던 일이 됩니다. (롤백)  
이것이 **트랜잭션**입니다. 은행 이체를 생각하세요 - 내 계좌에서 빠지고 상대방 계좌에 안 들어가면 안 되겠죠.

### ResponseEntity 란?

```java
// 단순히 데이터만 반환
return category;  // HTTP 200 + JSON 자동 변환

// HTTP 상태 코드를 직접 지정
return ResponseEntity.ok(category);           // 200
return ResponseEntity.status(201).build();    // 201 Created
return ResponseEntity.noContent().build();    // 204 No Content
```

HTTP 응답은 **상태 코드 + 본문**으로 구성됩니다. `ResponseEntity`를 쓰면 두 가지를 함께 제어할 수 있습니다.

---

## 3. 데이터베이스 - JPA와 H2

### JPA Entity 란?

```java
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)       // DB에 'INCOME', 'EXPENSE', 'SAVING' 문자열로 저장
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;
    ...
}
```

Entity는 DB 테이블과 1:1로 대응하는 Java 클래스입니다.  
JPA는 이 클래스를 보고 테이블을 자동으로 만들고, 객체를 SQL로 변환해줍니다.

### Spring Data JPA - 쿼리 자동 생성

```java
// 메서드 이름만 잘 지으면 JPA가 SQL을 자동 생성
List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId);
// → SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC

boolean existsByUserIdAndName(Long userId, String name);
// → SELECT COUNT(*) > 0 FROM categories WHERE user_id = ? AND name = ?
```

**왜 이게 좋은가?**  
SQL을 직접 짜지 않아도 됩니다. 메서드 이름이 곧 쿼리입니다.

### @Query - 복잡한 쿼리는 직접 작성

```java
@Query("select coalesce(sum(t.amount), 0) from Transaction t " +
       "where t.userId = :userId and t.type = :type and t.date between :start and :end")
BigDecimal sumByUserIdAndTypeAndDateBetween(
    @Param("userId") Long userId,
    @Param("type") TransactionType type,
    @Param("start") LocalDate start,
    @Param("end") LocalDate end
);
```

이것은 **JPQL**입니다. SQL과 비슷하지만 테이블이 아닌 Java 클래스 이름을 씁니다.  
`coalesce(sum(...), 0)` → 데이터가 없으면 0 반환 (NULL 방지)

### @Modifying - 수정/삭제 벌크 쿼리

```java
@Modifying
@Query("update Transaction t set t.category = :newName " +
       "where t.userId = :userId and t.category = :oldName")
int bulkRenameCategory(@Param("userId") Long userId,
                       @Param("oldName") String oldName,
                       @Param("newName") String newName);
```

일반 `@Query`는 조회만 됩니다. UPDATE/DELETE는 `@Modifying`을 붙여야 합니다.  
**벌크 쿼리의 장점**: 카테고리명이 바뀔 때 연결된 거래가 100개면 100번 UPDATE하는 대신 SQL 1번으로 끝납니다.

### H2 파일 DB와 CHECK 제약 조건 이슈

이 프로젝트에서 가장 많은 시간을 쓴 문제 중 하나입니다.

**배경**: `TransactionType` enum을 `INCOME, EXPENSE`만 있다가 `SAVING`을 추가했습니다.

**문제**: H2 DB는 enum 컬럼을 만들 때 자동으로 CHECK 제약을 만듭니다.
```sql
-- Hibernate가 처음 테이블 만들 때 자동 생성
CHECK (type IN ('INCOME', 'EXPENSE'))
```

`SAVING`을 추가해도 이 제약이 그대로라서 SAVING 입력 시 500 에러가 났습니다.

**해결**: 앱 시작 시 제약을 자동으로 수정하는 `SchemaMigration` 클래스 작성.

```java
@Component
public class SchemaMigration implements ApplicationRunner {
    @Override
    public void run(ApplicationArguments args) {
        fixEnumCheck("transactions");
        fixEnumCheck("categories");
    }

    private void fixEnumCheck(String table) {
        // INFORMATION_SCHEMA에서 실제 존재하는 CHECK 제약 이름을 조회
        List<String> names = jdbc.queryForList(
            "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
            "WHERE TABLE_NAME = ? AND CONSTRAINT_TYPE = 'CHECK'",
            String.class, table.toUpperCase()
        );
        // 기존 제약 모두 삭제
        for (String name : names) {
            jdbc.execute("ALTER TABLE " + table + " DROP CONSTRAINT IF EXISTS \"" + name + "\"");
        }
        // 올바른 제약 추가
        jdbc.execute("ALTER TABLE " + table +
            " ADD CONSTRAINT CK_" + table.toUpperCase() + "_TYPE " +
            "CHECK (type IN ('INCOME', 'EXPENSE', 'SAVING'))");
    }
}
```

**교훈**: DB 제약 조건은 코드만 바꾼다고 자동으로 업데이트되지 않습니다. enum 값이 바뀌면 DB 스키마도 함께 관리해야 합니다.

### H2 연결 안정성 문제

```yaml
# 문제가 있던 설정
url: jdbc:h2:file:./data/piggy;AUTO_SERVER=TRUE

# 수정된 설정
url: jdbc:h2:file:./data/piggy;DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1
```

`AUTO_SERVER=TRUE`: 여러 프로세스가 같은 파일 DB를 공유하는 모드. 서버 환경에서는 오히려 불안정합니다.  
`DB_CLOSE_DELAY=-1`: 커넥션이 없어도 DB 파일을 열어둡니다. (기본값은 마지막 커넥션 닫히면 파일도 닫힘)

---

## 4. 인증 - Spring Security

### 세션 기반 인증 흐름

```
1. 로그인 요청 (POST /api/auth/login, id/password)
        ↓
2. Spring Security가 DB에서 사용자 확인
        ↓
3. 성공 → 서버에 세션 생성, 브라우저에 쿠키(JSESSIONID) 전달
        ↓
4. 이후 요청마다 쿠키를 자동으로 보냄 → 서버가 세션으로 사용자 식별
```

### SecurityUtils - 현재 로그인한 사용자 가져오기

```java
public class SecurityUtils {
    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        PiggyUserDetails principal = (PiggyUserDetails) auth.getPrincipal();
        return principal.getUserId();
    }
}
```

Spring Security는 로그인한 사용자 정보를 `SecurityContextHolder`라는 전역 저장소에 담아둡니다.  
Service에서 "지금 누가 요청했지?"를 알려면 이 유틸 메서드를 씁니다.

### 사용자별 데이터 격리

```java
// 나쁜 예: 모든 거래를 가져옴 (다른 사람 것도 보임)
repository.findAll();

// 좋은 예: 현재 로그인한 사람의 것만 가져옴
repository.findByUserIdOrderByDateDescIdDesc(SecurityUtils.getCurrentUserId());
```

모든 쿼리에 `userId` 조건을 붙이는 것이 중요합니다. 안 붙이면 다른 사람 데이터가 노출됩니다.

### 인증이 필요 없는 URL 허용

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers(
        "/api/auth/**",    // 로그인·회원가입은 인증 없이 접근 가능
        "/",
        "/index.html",
        "/assets/**"
    ).permitAll()
    .anyRequest().authenticated()  // 나머지는 로그인 필요
)
```

---

## 5. 프론트엔드 - React + Vite

### 컴포넌트 구조

```
src/
├── pages/          # 각 화면 (대시보드, 달력, 내역, 설정...)
├── components/     # 여러 화면에서 공유하는 컴포넌트 (모달, 차트...)
├── api/            # 백엔드 API 호출 함수들
└── util/           # 유틸 함수 (금액 포맷, 테마...)
```

### API 호출 패턴

```javascript
// api/auth.js
async function request(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',    // 세션 쿠키를 자동으로 포함
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || '요청에 실패했어요.')
    }

    return res.json()
}

export function login(loginId, password) {
    return request('/api/auth/login', { loginId, password })
}
```

**`credentials: 'include'` 가 왜 필요한가?**  
브라우저는 기본적으로 다른 도메인에 쿠키를 보내지 않습니다. 개발 중 프론트(localhost:5173)와 백엔드(localhost:8080)는 포트가 달라 다른 출처로 인식됩니다. 이 옵션이 없으면 세션 쿠키가 전달되지 않아 항상 로그아웃 상태가 됩니다.

### Vite 개발 서버 프록시

```javascript
// frontend/vite.config.js
server: {
    proxy: {
        '/api': 'http://localhost:8080'  // /api 요청을 백엔드로 전달
    }
}
```

개발 중 프론트(5173)에서 `/api/login` 요청이 오면 Vite가 자동으로 `http://localhost:8080/api/login`으로 전달합니다. CORS 문제 없이 개발할 수 있습니다.

### useState와 useEffect 패턴

```javascript
export default function DashboardPage() {
    const [data, setData] = useState(null)      // 데이터 상태
    const [loading, setLoading] = useState(true) // 로딩 상태
    const [error, setError] = useState('')        // 에러 상태

    useEffect(() => {
        getDashboard(year, month)
            .then(res => setData(res))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [year, month])  // year나 month가 바뀔 때마다 다시 실행

    if (loading) return <div>불러오는 중...</div>
    if (error) return <div>{error}</div>
    return <div>...</div>
}
```

React에서 데이터를 불러오는 기본 패턴입니다:
1. `useState`로 상태(데이터, 로딩, 에러)를 관리
2. `useEffect`로 컴포넌트가 마운트될 때 (또는 의존성이 바뀔 때) API 호출
3. 로딩/에러 상태에 따라 다른 UI 렌더링

### 조건부 렌더링

```jsx
{/* 조건이 true일 때만 렌더링 */}
{saving > 0 && <div className="saving-row">...</div>}

{/* 삼항 연산자 */}
{loading ? <Spinner /> : <DataTable data={data} />}

{/* 리스트 렌더링 */}
{categories.map((c, i) => (
    <li key={c.id}>{c.name}</li>  // key는 반드시 고유해야 함
))}
```

### 커스텀 훅 대신 useCallback

```javascript
const load = useCallback(async () => {
    const res = await getTransactions({ year, month })
    setTxs(res)
}, [year, month])  // year/month가 바뀌면 load 함수 재생성

useEffect(() => { load() }, [load])
```

`useCallback`은 함수를 메모이제이션합니다. 의존성(`year`, `month`)이 바뀔 때만 함수가 새로 만들어지고, `useEffect`가 그걸 감지해 다시 실행합니다.

---

## 6. API 설계 패턴

### RESTful API 설계

```
GET    /api/categories          → 목록 조회
POST   /api/categories          → 생성
PUT    /api/categories/{id}     → 수정
DELETE /api/categories/{id}     → 삭제
```

HTTP 메서드로 행위를 표현하고, URL은 자원(명사)을 표현합니다.

### 에러 응답 통일

```java
// 공통 예외 클래스
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String message;
}

// GlobalExceptionHandler에서 처리
@ExceptionHandler(ApiException.class)
public ResponseEntity<Map<String, String>> handleApiException(ApiException e) {
    return ResponseEntity.status(e.getStatus())
        .body(Map.of("message", e.getMessage()));
}
```

모든 에러를 `{ "message": "에러 내용" }` 형태로 통일하면 프론트엔드에서 처리가 간단해집니다.

```javascript
// 프론트에서 에러 처리
if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message || '요청에 실패했어요.')
}
```

### DTO (Data Transfer Object) 패턴

```java
// 응답 전용 DTO - Record 사용 (불변 객체)
public record DashboardResponse(
    int year, int month,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    List<CategoryExpense> categoryExpenses,
    ...
) {
    public record CategoryExpense(String category, BigDecimal amount) {}
}
```

Entity(DB 테이블)를 그대로 JSON으로 반환하지 않고 DTO를 따로 만드는 이유:
- 필요한 데이터만 선택해서 반환
- DB 구조와 API 구조를 분리 (DB 바뀌어도 API 형태 유지 가능)
- 민감한 정보(비밀번호 해시 등) 노출 방지

---

## 7. 실제로 겪은 문제와 해결법

### 문제 1: 카테고리명 변경 시 기존 거래 내역이 안 바뀜

**원인**: 거래 내역이 카테고리 ID(FK)가 아닌 카테고리 이름(String)을 직접 저장하고 있었음.

```java
// Transaction 엔티티
private String category;  // "식비", "교통" 등 이름을 직접 저장
```

**장점**: 카테고리를 삭제해도 과거 기록이 보존됨  
**단점**: 카테고리명 변경 시 기존 거래에 자동 반영 안 됨

**해결**: 카테고리 수정 시 같은 이름의 거래를 일괄 업데이트하는 벌크 쿼리 추가.

```java
// CategoryService.update()
String oldName = category.getName();
category.update(newName, savings);        // 카테고리명 변경
if (!oldName.equals(newName)) {
    transactionRepository.bulkRenameCategory(userId, oldName, newName); // 거래도 변경
}
```

**교훈**: "공통코드" 개념 - 하나를 바꾸면 연결된 것들도 모두 바뀌어야 합니다.

### 문제 2: 저축이 지출로 집계됨

**원인**: 저축을 별도 유형이 아닌 특정 카테고리로 관리하려 했음.

**해결**: `TransactionType` enum에 `SAVING`을 추가해 독립 유형으로 분리.

```java
public enum TransactionType {
    INCOME, EXPENSE, SAVING  // 완전히 별개의 유형
}
```

**사용 가능 금액 계산**:
```java
// 잘못된 계산: 저축도 지출로 취급
availableCash = totalIncome - totalExpense - totalSaving; // ❌

// 올바른 계산: 저축은 별도 관리
availableCash = allIncome - allExpense; // ✅
```

**교훈**: 비즈니스 요구사항을 정확히 이해하고 설계해야 합니다. "저축은 지출이 아니다"는 도메인 지식입니다.

### 문제 3: 회원가입 시 이미 사용 중인 아이디를 인증번호까지 받은 후에야 알게 됨

**원인**: 중복 아이디 검증이 최종 가입 단계에만 있었음.

**해결**: 인증번호 발송 전에 미리 아이디 중복 검사 API 호출.

```javascript
// 2단계(정보 입력)에서 다음 버튼 클릭 시
const handleInfoNext = async () => {
    await checkLoginId(loginId)  // 중복 검사 먼저
    goTo(2)                      // 통과하면 인증번호 단계로
}
```

**교훈**: UX는 "사용자가 최대한 일찍 피드백을 받을 수 있어야 한다"는 원칙을 따릅니다.

### 문제 4: H2 DB가 갑자기 닫히는 문제

**증상**: 앱이 몇 시간 돌다가 갑자기 모든 요청에서 500 에러.  
**로그**: `The database has been closed [90098-240]`

**원인**: `AUTO_SERVER=TRUE` 모드가 서버 환경에서 불안정.

**해결**: 
```yaml
# Before
url: jdbc:h2:file:./data/piggy;AUTO_SERVER=TRUE

# After  
url: jdbc:h2:file:./data/piggy;DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1
```

**교훈**: 개발 편의를 위한 설정이 운영 환경에서는 독이 될 수 있습니다. 개발/운영 설정을 분리하는 것이 중요합니다. (application.yml / application-prod.yml)

---

## 8. 배포 - Oracle Cloud + Caddy

### 전체 배포 구조

```
인터넷 사용자
    ↓ HTTPS (443)
Caddy (리버스 프록시 + 자동 HTTPS)
    ↓ HTTP (8080)
Spring Boot App (piggy.jar)
    ↓
H2 File DB (./data/piggy.mv.db)
```

### Caddy란?

Caddy는 웹 서버 + 리버스 프록시 역할을 합니다.  
**핵심 장점**: Let's Encrypt를 이용해 HTTPS 인증서를 자동으로 발급/갱신해줍니다.

```
# Caddyfile 예시
piggynote.duckdns.org {
    reverse_proxy localhost:8080
}
```

이 두 줄이 전부입니다. Caddy가 알아서 HTTPS 인증서를 받아와 설치합니다.

### systemd 서비스 등록

```ini
# /etc/systemd/system/piggy.service
[Unit]
Description=Piggy App

[Service]
ExecStart=java -Dspring.profiles.active=prod -jar /home/ubuntu/piggy.jar
Restart=always        # 앱이 죽으면 자동 재시작

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable piggy   # 부팅 시 자동 시작
sudo systemctl start piggy    # 시작
sudo systemctl restart piggy  # 재시작
sudo journalctl -u piggy -f   # 로그 실시간 확인
```

**왜 systemd를 쓰는가?**  
터미널 창을 닫아도 앱이 계속 돌아가야 합니다. 서버가 재부팅돼도 자동으로 앱이 실행되어야 합니다. systemd가 이것을 관리해줍니다.

### 배포 스크립트 흐름

```bash
# 로컬에서
./gradlew bootJar                          # JAR 빌드
scp piggy.jar ubuntu@서버IP:/home/ubuntu/  # 서버로 전송
ssh ubuntu@서버IP "sudo systemctl restart piggy"  # 서버에서 재시작
```

### Spring Profile - 개발/운영 설정 분리

```yaml
# application.yml (공통 설정)
spring:
  datasource:
    url: jdbc:h2:file:./data/piggy;DB_CLOSE_ON_EXIT=FALSE

# application-prod.yml (운영 전용 - prod 프로필 활성화 시 적용)
spring:
  h2:
    console:
      enabled: false   # 운영에서 H2 콘솔 비활성화 (보안)
  jpa:
    show-sql: false    # SQL 로그 끄기 (성능)
```

운영 서버에서는 `-Dspring.profiles.active=prod`로 실행해서 운영 설정을 사용합니다.

---

## 9. 핵심 설계 결정들

### 결정 1: 저축을 카테고리가 아닌 독립 유형으로

처음에는 "저축" 카테고리를 만들어 관리하려 했습니다.  
하지만 "저축이 지출 집계에 포함되는 문제"가 생겼습니다.  
→ `TransactionType.SAVING`을 추가해 수입/지출과 완전히 분리했습니다.

**배운 것**: 기능 추가 시 기존 구조에 억지로 맞추려 하지 말고, 본질을 반영하는 구조로 바꾸는 게 낫습니다.

### 결정 2: 카테고리를 FK가 아닌 String으로 저장

거래 내역의 카테고리를 `category_id (FK)` 대신 `category (String)`으로 저장했습니다.

**FK로 저장하면**:
- 카테고리 삭제 시 기존 거래가 NULL이 되거나 삭제해야 함
- 과거 기록 보존이 어려움

**String으로 저장하면**:
- 카테고리 삭제해도 과거 기록의 이름은 그대로 보존
- 단, 이름 변경 시 기존 거래를 벌크 업데이트해야 함 (`bulkRenameCategory`)

**배운 것**: 트레이드오프(trade-off). 완벽한 설계는 없고, 요구사항에 맞는 결정이 있습니다.

### 결정 3: 단일 JAR 배포

별도의 정적 파일 서버(nginx 등) 없이 Spring Boot 하나로 프론트+백엔드를 서빙합니다.

**장점**: 배포가 단순합니다. JAR 파일 하나만 서버에 올리면 됩니다.  
**단점**: 프론트 수정 시 백엔드까지 함께 재빌드·재배포해야 합니다.

소규모 프로젝트에서는 단순함이 최고입니다.

### 결정 4: 세션 기반 인증 (JWT 미사용)

JWT 토큰 방식 대신 서버 세션 방식을 선택했습니다.

**세션 방식**: 서버가 로그인 상태를 기억. 브라우저는 쿠키만 들고 다님.  
**JWT 방식**: 토큰 자체에 사용자 정보 포함. 서버가 상태를 저장하지 않음.

단일 서버, 소규모 사용자인 이 프로젝트에서는 세션이 더 단순하고 안전합니다.

---

## 마무리 - 반복되는 패턴

이 프로젝트를 통해 가장 많이 쓴 패턴들을 정리하면:

**백엔드**
1. `SecurityUtils.getCurrentUserId()` → 현재 사용자 ID 가져오기
2. `findById(id).filter(c -> c.getUserId().equals(userId))` → 내 데이터인지 검증
3. `@Transactional` → DB 작업 묶기
4. `throw new ApiException(HttpStatus.NOT_FOUND, "메시지")` → 에러 던지기

**프론트엔드**
1. `useState` + `useEffect` + `try/catch` → 데이터 로딩
2. `credentials: 'include'` → 세션 쿠키 포함
3. `won(amount)` → 금액 포맷 (1000 → "1,000원")
4. 조건부 렌더링 `{condition && <Component />}`

이 패턴들을 이해하면 새 기능을 추가할 때 기존 코드를 참고해서 같은 방식으로 구현할 수 있습니다.

---

*작성: 2026년 6월 | piggy 가계부 프로젝트*
