plugins {
    java
    id("org.springframework.boot") version "4.0.6"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.piggy"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot 4.0: 'web' 스타터가 'webmvc'로 이름 변경됨
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-security")

    runtimeOnly("com.h2database:h2")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// React 빌드: frontend/src 변경 시에만 재실행 (Gradle 증분 빌드)
val buildFrontend = tasks.register<Exec>("buildFrontend") {
    workingDir = file("frontend")
    val isWin = System.getProperty("os.name").lowercase().contains("win")
    // Mac Homebrew npm은 /opt/homebrew/bin에 있어 Gradle PATH에 없을 수 있으므로 shell을 거쳐 실행
    if (isWin) {
        commandLine("cmd", "/c", "npm.cmd", "run", "build")
    } else {
        commandLine("/bin/sh", "-c", "npm run build")
    }
    inputs.dir("frontend/src")
    inputs.files("frontend/package.json", "frontend/vite.config.js", "frontend/index.html")
    outputs.dir("src/main/resources/static")
}

tasks.processResources {
    dependsOn(buildFrontend)
}

// 배포용 단일 실행 파일 이름을 piggy.jar 로 고정
tasks.bootJar {
    archiveFileName.set("piggy.jar")
}
