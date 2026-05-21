# Phishing Mail AI — Backend Server

> AI 기반 피싱 메일 분석 플랫폼의 **Spring Boot 메인 백엔드 서버** > 브랜치: `6-phishing-mail-ai-backend`

---

## 프로젝트 소개

본 레포지토리는 AI 기반 피싱 메일 정밀 분석 서비스의 **백엔드 API 서버**입니다. 사용자가 의심스러운 이메일 본문을 입력하면, 이 서버가 요청을 수신하고 Python FastAPI AI 분석 서버(`6-phishing-mail-ai-ai-ml` 브랜치)에 분석을 위임한 뒤 결과를 클라이언트에 가공하여 반환합니다.

전체 시스템은 Spring Boot(API 서빙·라우팅) + FastAPI(AI 분석 엔진) + React Native Expo(프론트엔드)로 역할을 나눈 멀티 서버 아키텍처로 구성되어 있으며, 본 서버는 그 중 외부 클라이언트와 AI 엔진 사이의 **중재자(Mediator)** 역할을 담당합니다.

Spring Boot 4.0.6 및 Java 17 환경에서 구축되었고, `RestClient`, `Lombok`, Bean Validation을 활용하여 AI 서버와의 HTTP 통신 및 요청/응답 데이터 처리를 구현하였습니다.

---

## 문제 정의

피싱 메일 탐지를 위한 AI 분석 연산은 Python 생태계(OpenAI API, tldextract 등)에 특화되어 있는 반면, 안정적인 API 서빙·요청 유효성 검증·예외 핸들링 등의 서버 인프라 역할은 Spring Boot가 더 적합합니다.

이 두 언어/프레임워크의 강점을 동시에 취하면서도 클라이언트에게 단일 엔드포인트를 제공하기 위해, **Spring Boot를 API 게이트웨이 역할의 메인 서버**로, **FastAPI를 AI 연산 전담 독립 서버**로 분리하는 구조를 설계하였습니다. 본 서버는 이 구조에서 클라이언트 요청의 유일한 진입점을 담당합니다.

---

## 주요 기능

- **피싱 메일 분석 API 제공** (`POST /api/v1/analyze`)  
  클라이언트로부터 이메일 본문(`emailBody`)을 수신하고 분석 결과를 반환합니다. (`PhishingController.java` 기반)

- **요청 유효성 검증** `@NotBlank` Bean Validation을 통해 빈 본문 입력 시 즉시 오류 응답을 반환합니다. (`AnalyzeRequest.java` 기반)

- **FastAPI AI 서버 연동** Spring 6.1에서 도입된 `RestClient`를 사용해 AI 서버(`http://localhost:8000/analyze`)에 JSON 형식으로 분석 요청을 전달하고 결과를 파싱합니다. (`PhishingAnalysisService.java` 기반)

- **응답 데이터 가공 및 정규화** AI 서버로부터 수신한 `score`, `grade`, `threats` 데이터를 클라이언트 스펙에 맞는 `AnalyzeResponse` 구조로 변환합니다. `grade` 값이 null인 경우 기본값 `"낮음"`을 세팅하는 방어 로직이 포함되어 있습니다.

- **AI 서버 장애 시 Fallback 응답 처리** `RestClient` 호출 중 예외 발생 시 `score: 0`, `riskLevel: "서버 연결 실패"` 형태의 안전망 응답을 반환하여 서비스 전체 중단을 방지합니다. (`PhishingAnalysisService.java` 기반)

- **전역 예외 핸들링** `@RestControllerAdvice`를 적용한 `GlobalExceptionHandler`를 통해 애플리케이션 전역의 예외를 일관된 JSON 오류 응답 포맷으로 처리합니다.

- **CORS 설정** `@CrossOrigin(origins = "*")`을 통해 개발 환경에서 모든 오리진의 요청을 허용합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Spring Boot 4.0.6 |
| Language | Java 17 |
| Build Tool | Gradle (Wrapper 포함) |
| HTTP 클라이언트 | `RestClient` (Spring 6.1+) |
| 유효성 검증 | `spring-boot-starter-validation` (`@NotBlank`) |
| 코드 간결화 | Lombok (`@RequiredArgsConstructor`, `@Getter`, `@Builder`, `@Slf4j`) |
| 테스트 | JUnit 5 (`spring-boot-starter-webmvc-test`) |
| 연동 대상 | FastAPI AI 서버 (Python, `6-phishing-mail-ai-ai-ml` 브랜치) |

> ⚠️ `build.gradle` 의존성 기준으로 `spring-boot-starter-security`는 포함되어 있지 않습니다. CORS는 컨트롤러의 `@CrossOrigin` 어노테이션으로 처리합니다.

---
## 아키텍처 및 구조

```mermaid
flowchart TD
    %% 외부/클라이언트
    Client[클라이언트]

    %% 스프링부트 백엔드 그룹
    subgraph SpringBoot [Spring Boot 백엔드]
        Controller[PhishingController]
        Service[PhishingAnalysisService]
        Response[AnalyzeResponse]
        ExHandler[GlobalExceptionHandler]
    end

    %% FastAPI 서버 그룹
    subgraph AIServer [FastAPI AI 서버]
        FastAPI[FastAPI 분석 API]
    end

    %% 연결 관계 정의 (화살표)
    Client -->|POST api 요청| Controller
    Controller --> Service
    Service -->|RestClient POST| FastAPI
    Service --> Response
    ExHandler -->|오류 응답| Client
    Response -->|HTTP 200 JSON| Client
