# 🐷 piggy

가족이 함께 쓰는 가계부 웹앱. 수입·지출을 기록하고 대시보드·달력·내역으로 한눈에 관리합니다.
같은 와이파이에서 PC·휴대폰 모두 접속 가능하며, 데이터는 로컬 H2 파일 DB에 저장됩니다.

> 화면 단위로 차근차근 만들어가는 개인 토이 프로젝트입니다.

## ✨ 주요 기능

- **대시보드** — 분류별 지출(도넛 차트), 사용 가능 금액(전체 현금−저축액), 저축 카테고리별 누적, 주간 지출 추이(지난달~이번달)
- **수입/지출 내역** — 날짜별 그룹 리스트, 수입/지출 필터, 월 이동, 클릭 시 수정
- **달력** — 월 달력에 날짜별 거래 표시, 날짜 클릭으로 입력, 내역 클릭으로 수정
- **카테고리 / 지출방법 관리** — 수입·지출 카테고리와 결제수단 CRUD, 카테고리별 "저축으로 집계" 설정
- **빠른 입력 모달** — 모든 화면에서 공통으로 쓰는 거래 입력/수정 컴포넌트
- **다크 모드** — 설정에서 토글, 선택값은 로컬에 저장
- **회원가입 / 로그인** — 세션 기반 인증, 사용자별 데이터 완전 격리

## 🛠 기술 스택

**백엔드**
- Java 21, Spring Boot 4
- Spring Web MVC, Spring Data JPA, Spring Security 7
- H2 (파일 모드, `./data`)
- Gradle (Kotlin DSL)

**프론트엔드**
- React 19, Vite
- Pretendard 폰트
- Recharts (도넛·영역 차트, 호버 툴팁)

## 📁 프로젝트 구조

```
piggy/
├── src/main/java/com/piggy/
│   ├── auth/             # 인증 (로그인·회원가입·세션)
│   ├── transaction/      # 거래 (수입/지출) 엔티티·API
│   ├── category/         # 카테고리 (저축 집계 플래그 포함)
│   ├── paymentmethod/    # 지출방법(결제수단)
│   ├── budget/           # 월 예산
│   ├── dashboard/        # 대시보드 집계 API
│   └── common/           # 예외 처리 등 공통
├── frontend/
│   └── src/
│       ├── pages/        # 대시보드·내역·달력·관리·설정·로그인 화면
│       ├── components/   # 모달·차트·리스트 등
│       ├── api/          # 백엔드 호출
│       └── util/         # 포맷·테마 유틸
└── data/                 # H2 DB 파일 (git 제외)
```

## 🚀 실행 방법

### 개발 모드 (코드 수정하며 확인)

백엔드와 프론트엔드를 각각 띄웁니다.

**터미널 1 — 백엔드 (포트 8080)**
```bash
./gradlew bootRun -x buildFrontend
```

**터미널 2 — 프론트엔드 (포트 5173)**
```bash
cd frontend
npm install
npm run dev
```

브라우저에서 **http://localhost:5173** 접속.
프론트가 `/api` 요청을 백엔드(8080)로 자동 프록시합니다. 코드 저장 시 즉시 반영됩니다.

### 로컬 네트워크 공유 (같은 와이파이에서 폰·다른 기기 접속)

```bash
# 프론트 빌드 후 백엔드 실행
cd frontend && npm run build
cd .. && ./gradlew bootRun -x buildFrontend
```

같은 와이파이에서 **http://[내 IP]:8080** 으로 접속.
내 IP 확인: `ipconfig getifaddr en0`

## 🧰 빌드 & 배포

### JAR 빌드

```bash
# 프론트엔드 프로덕션 빌드 (src/main/resources/static/ 에 생성)
cd frontend && npm run build

# 실행 가능한 단일 JAR 생성 (build/libs/piggy.jar)
cd .. && ./gradlew bootJar
```

### 다른 컴퓨터에서 실행하기

Java 21만 설치되어 있으면 아래 3개 파일만 전달하면 됩니다.

```
📁 배포 폴더
 ├── piggy.jar        ← JAR 빌드 결과물
 ├── run_win.bat      ← Windows 더블클릭 실행
 └── run_mac.command  ← Mac 더블클릭 실행
```

- **Windows**: `run_win.bat` 더블클릭
- **Mac**: `run_mac.command` 더블클릭 (처음엔 우클릭 → 열기)
- 실행 3초 후 브라우저가 자동으로 `http://localhost:8080`을 엽니다
- 데이터도 함께 옮기려면 `data/piggy.mv.db` 파일도 같은 폴더에 복사

## 📝 참고

- 모든 데이터는 로컬 `./data/piggy.mv.db`(H2)에 저장되며 git에는 올리지 않습니다.
- 카테고리·지출방법은 거래에 **이름(문자열)으로 스냅샷** 저장되어, 관리 항목을 지워도 과거 기록은 보존됩니다.
- 휴대폰 인증은 현재 개발용(devCode 응답)으로 동작하며 실제 SMS는 연동되어 있지 않습니다.
- 편의를 위해 로그인 화면에서 **바로 입장하기** 버튼으로 즉시 진입할 수 있습니다.
