#!/bin/bash
cd "$(dirname "$0")"

# Java 확인
if ! command -v java &>/dev/null; then
  osascript -e 'display alert "Java가 설치되어 있지 않습니다." message "https://adoptium.net 에서 Java 21을 설치하세요."'
  exit 1
fi

# JAR 파일 확인
if [ ! -f "piggy.jar" ]; then
  osascript -e 'display alert "piggy.jar를 찾을 수 없습니다." message "이 파일과 같은 폴더에 piggy.jar를 넣어주세요."'
  exit 1
fi

# 8080 포트 중복 실행 방지
if lsof -ti:8080 &>/dev/null; then
  osascript -e 'display alert "Piggy 실행 중" message "이미 8080 포트에서 실행 중입니다. 브라우저에서 http://localhost:8080 을 열어주세요."'
  open http://localhost:8080
  exit 0
fi

# 브라우저 열기 (3초 후)
(sleep 3 && open http://localhost:8080) &

# 앱 시작
java -jar piggy.jar
