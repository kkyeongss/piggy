@echo off
chcp 65001 >nul
cd /d "%~dp0"

:: Java 확인
java -version >nul 2>&1
if errorlevel 1 (
    echo Java가 설치되어 있지 않습니다.
    echo https://adoptium.net 에서 Java 21을 설치하세요.
    pause
    exit /b 1
)

:: JAR 파일 확인
if not exist "piggy.jar" (
    echo piggy.jar 파일을 찾을 수 없습니다.
    echo 이 파일과 같은 폴더에 piggy.jar를 넣어주세요.
    pause
    exit /b 1
)

:: 8080 포트 중복 실행 방지
netstat -ano | findstr ":8080 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo 이미 8080 포트에서 실행 중입니다.
    echo 브라우저에서 http://localhost:8080 을 열어주세요.
    start http://localhost:8080
    pause
    exit /b 0
)

:: 브라우저 열기 (3초 후)
start /b cmd /c "timeout /t 3 >nul && start http://localhost:8080"

:: 앱 시작
echo Piggy 시작 중... 잠시만 기다려주세요.
java -jar piggy.jar
pause
