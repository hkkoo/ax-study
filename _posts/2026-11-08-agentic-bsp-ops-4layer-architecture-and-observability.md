---
layout: post
title: "Android BSP의 Agentic Shift (7) — 4대 계층 아키텍처와 관측성 3파전: MLflow 3 vs Langfuse vs LangSmith"
description: "Claude Workflow, LangGraph, langchain-core, MLflow 3로 완성되는 현대 Agentic AI 4대 계층 아키텍처를 총정리하고, 엔터프라이즈 사내 보안과 대용량 시스템 아티팩트 관리를 위한 3대 관측성 플랫폼(MLflow vs Langfuse vs LangSmith)의 기술적 특성을 전면 비교합니다."
date: 2026-11-08 09:00:00 +0900
permalink: /posts/agentic-bsp-ops-4layer-architecture-and-observability/
---

지난 글([제6편: 실전 구현 — LangGraph와 MLflow 3 기반의 L4 Closed-Loop Bring-up 플랫폼](/posts/agentic-bsp-shift-closed-loop-bringup-mlflow-langgraph/))에서는 Android BSP의 Manifest Sync와 커널 빌드 컴파일 에러를 자율 치유하는 실제 파이프라인을 구축하고 검증했습니다.

시스템을 완성하고 나면 한 단계 더 높은 엔지니어링 질문들이 남습니다:
* *"최근 Claude의 자체 에이전트 하네스(Harness)와 MCP가 워낙 뛰어난데, LangChain이나 LangGraph는 여전히 필요한 것인가?"*
* *"관측성(Observability) 생태계의 대표 주자인 **LangSmith, Langfuse, MLflow 3** 중 엔터프라이즈 시스템 엔지니어링에 적합한 최종 도구는 무엇인가?"*

본 글에서는 그동안의 논의와 실전 구현을 집대성하여, **현대 Agentic AI 시스템의 4대 계층(Layer) 아키텍처**를 정립하고, **3대 관측성 플랫폼의 기술 스펙을 전면 비교 분석**합니다.

---

## 1. 현대 Agentic AI 시스템의 4대 계층 아키텍처

AI 프레임워크의 과도한 거품을 걷어내고 실제 프로덕션 레벨의 복잡한 시스템(BSP Bring-up 등)을 운영하려면, 각 도구의 역할이 4개 계층으로 명확히 분리되어야 합니다:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Layer 1. 지능 및 도구 실행 계층 (Claude Workflow / MCP)                  │
│  └─ "실제 생각하고, 코드를 고치고, 셸 명령을 실행하는 손과 두뇌"           │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 2. 오케스트레이션 및 상태 머신 계층 (LangGraph)                    │
│  └─ "다중 루프 제어, 롤백, 실패 지점부터 재시작하는 레일 (Checkpointer)"   │
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 3. 표준 인터페이스 및 계측 계층 (langchain-core)                  │
│  └─ "노드 실행 이벤트를 관측 시스템으로 연결해 주는 표준 접착제 (Telemetry)"│
├─────────────────────────────────────────────────────────────────────────┤
│  Layer 4. 관측성 및 대용량 아티팩트 계층 (MLflow 3 / Langfuse)           │
│  └─ "50MB 로그, 커널 패치, 트레이스를 보관하는 100% 온프레미스 블랙박스 창고"│
└─────────────────────────────────────────────────────────────────────────┘
```

### 4대 계층 상세 비교 매트릭스

| 계층 (Layer) | 담당 기술 | 핵심 역할 (What it does) | **왜 꼭 필요한가? (Why it is needed)** | BSP 프로젝트 적용 사례 |
| :--- | :--- | :--- | :--- | :--- |
| **Layer 1<br/>지능 & 도구 실행**<br/>*(Cognitive & Execution)* | **Claude Workflow**<br/>*(Anthropic Native / MCP)* | • 문맥 추론 및 의사결정<br/>• 코드 파일 열람 및 `.diff` 생성<br/>• 셸 명령어(Git/Bash) 실행 | • 프레임워크 거품 없이 **가장 버그 없고 환각이 적은 수술적(Surgical) 코드 수정** 수행<br/>• 업계 표준인 **MCP**를 통해 로컬 환경을 안전하게 조작 | • 컴파일러 에러 20줄을 보고 `#include <linux/pmic.h>` 누락을 정확히 추론하여 패치 생성 |
| **Layer 2<br/>오케스트레이션 & 제어**<br/>*(State & Lifecycle)* | **LangGraph** | • 거시적 제어 흐름 (다중 루프)<br/>• 상태 스냅샷 저장 (Checkpointer)<br/>• 사람 승인 대기 (`interrupt`) | • LLM 단독으로는 **수십 번의 실패/재시도 루프 시 컨텍스트가 터져 탈선**함<br/>• 2시간짜리 빌드 후 부팅 실패 시 **처음부터 다시 안 하고 그 지점부터 즉시 재개(Time Travel)** 보장 | • `Sync(루프) → Build(루프) → Boot(실패 시 Build로 롤백)`의 전체 Bring-up 상태 머신 제어 |
| **Layer 3<br/>표준 규격 & 접착제**<br/>*(Protocol & Telemetry)* | **langchain-core** | • 노드 실행 표준 규격 (Runnable)<br/>• 상태 입출력 이벤트 발행<br/>• 트레이싱 콜백 훅(Hooks) 제공 | • 이게 없으면 개발자가 모든 노드마다 수동으로 로그 찍는 코드 수백 줄을 직접 짜야 함<br/>• **LangGraph와 관측 툴(MLflow)을 코드 1줄로 자동 연결해 주는 표준 접착제(Glue)** | • `mlflow.langchain.autolog()` 1줄로 노드 시작/종료, 입출력 State, 소요 시간을 무설정 자동 캡처 |
| **Layer 4<br/>관측성 & 아티팩트 보관**<br/>*(Observability & Storage)* | **MLflow 3**<br/>*(또는 Langfuse)* | • 계층적 실행 트리 (Waterfall 뷰)<br/>• 50MB+ 대용량 빌드 로그 보관<br/>• 패치 diff 및 부트 이미지 영구 저장<br/>• 100% 사내망 셀프호스팅 | • AI가 왜 코드를 그렇게 고쳤는지 **인과관계 증거(Evidence)**를 1초 만에 규명<br/>• LangSmith(클라우드)와 달리 **사내 NDA 보안을 지키며 대용량 바이너리/로그를 안전하게 수용** | • `build_failure_full.log`(50MB), `kernel_fix.diff`, `boot.img`를 Run 단위로 묶어 UI에서 다운로드/열람 |

---

## 2. 관측성 3파전 전면 비교: `MLflow 3` vs `Langfuse` vs `LangSmith`

에이전트 관측성(Observability) 생태계의 대표적인 3대 플랫폼을 **인프라, 보안, 대용량 아티팩트, 평가, 비용** 관점에서 다각도로 비교 분석합니다.

### 2.1 3대 도구 핵심 스펙 비교 매트릭스

| 평가 축 | LangSmith (LangChain 공식) | Langfuse (오픈소스 신흥 강자) | **MLflow 3 (본 프로젝트 채택 ★)** |
| :--- | :--- | :--- | :--- |
| **태생 및 핵심 정체성** | LLM 앱 디버깅 & 테스트 SaaS | 오픈소스 LLM 엔지니어링 & 프롬프트 CMS | **대규모 데이터셋/모델/아티팩트 MLOps & GenAI Tracing** |
| **호스팅 방식** | ❌ **클라우드 SaaS 전용**<br/>*(엔터프라이즈 유료만 온프레미스)* | ✔ **Docker Compose 셀프호스팅**<br/>*(PostgreSQL + ClickHouse)* | **✔ 단일 Python venv + SQLite**<br/>*(Docker조차 불필요한 초경량 로컬 온프레미스)* |
| **사내 보안 & NDA** | ❌ **부적합**<br/>*(소스/로그가 미국 클라우드로 전송)* | ✔ **안전**<br/>*(사내 인프라 구축 시 데이터 격리)* | **✔ 완벽**<br/>*(외부 네트워크 차단된 100% 에어갭 폐쇄망 지원)* |
| **대용량 파일 / 바이너리 보관**<br/>*(50MB+ 로그, diff, .img)* | ❌ **불가**<br/>*(텍스트/JSON 메타데이터 중심)* | ❌ **불가**<br/>*(바이너리 파일 저장소 개념 없음)* | **✔ 완벽 지원**<br/>*(Run 단위 대용량 아티팩트 영구 저장 및 UI 다운로드)* |
| **LangGraph 자동 추적** | ✔ **최상 (네이티브)** | △ **보통**<br/>*(커스텀 CallbackHandler 작성 필요)* | **✔ 최상**<br/>*(`mlflow.langchain.autolog()` 1줄로 완벽 계측)* |
| **프롬프트 관리 (Prompt CMS)** | ✔ 우수 | **✔ 최상 (특화 기능)**<br/>*(UI에서 프롬프트 배포/버전 관리)* | △ 보통<br/>*(코드/아티팩트 기반 관리)* |
| **LLM-as-a-Judge 평가** | ✔ 지원 (웹 UI 기반) | ✔ 지원 (점수화 및 룰 세팅) | **✔ 강력 내장 (`mlflow.evaluate`)**<br/>*(정량적 벤치마크 및 비교 차트 제공)* |
| **라이선스 및 비용** | ❌ 트레이스 호출량 비례 유료 과금 | ✔ Apache 2.0 오픈소스 (무료) | **✔ Apache 2.0 오픈소스 (완전 무료)** |
| **최적 추천 도메인** | 클라우드 기반 B2C 챗봇, RAG 서비스 | 사내 웹 서비스, 비개발자 협업 프롬프트 튜닝 | **임베디드 BSP, 컴파일 빌드, OS 커널, 하드웨어 연동 에이전트** |

### 2.2 도구별 상세 분석: 언제 무엇을 써야 하는가?

1. **`LangSmith`**: LangGraph와의 연동은 가장 자연스러우나, **클라우드 종속과 데이터 외부 반출(NDA 위반)** 때문에 실리콘 벤더/OEM 사내망에서는 도입이 불가능합니다.
2. **`Langfuse`**: 사내 서버에 Docker로 띄워 **"비개발자(기획자, 도메인 전문가)가 웹 UI에서 프롬프트를 실시간으로 고치고 A/B 테스트하는 일반 웹 서비스"**에 가장 적합합니다.
3. **`MLflow 3`**: 50MB가 넘는 Ninja 컴파일 로그, 커널 패치 `.diff`, 부트 이미지 `.img` 바이너리를 가볍게 다루어야 하는 **"시스템 엔지니어링 및 임베디드 BSP Agentic Ops 환경"에서 독보적인 1등 솔루션**입니다.

---

## 3. 핵심 엔지니어링 개념: OTEL과 LLM-as-a-Judge

### 3.1 OTEL (OpenTelemetry)의 의미
* **정의**: CNCF(클라우드 네이티브 컴퓨팅 재단) 주도의 **글로벌 관측성(Observability) 표준 규격**.
* **AI 에이전트에서의 가치**: MLflow 3는 특정 벤더의 독점 규격이 아닌 **OTEL GenAI Semantic Conventions** 표준 스키마를 준수합니다. 따라서 한 번 구축해 둔 트레이스 파이프라인은 추후 Datadog, Grafana 등 어떤 글로벌 모니터링 시스템으로도 코드 변경 없이 100% 호환 이전이 가능합니다.

### 3.2 LLM-as-a-Judge와 평가 데이터셋
* **개념**: 사람이 매번 수백 개의 에이전트 출력(패치 diff)을 눈으로 읽고 채점할 수 없으므로, **더 고성능인 AI(예: Gemini 2.5 Pro)를 '심사위원'으로 앉혀 정밀 채점**하게 만드는 기법입니다.
* **평가 데이터셋**: 대표적인 컴파일 실패 50선, DTB 에러 30선 등 **'공통 모의고사 문제집(Input + Ground Truth + Rubric)'**.
* **MLflow 활용**: LangSmith 독점이 아니며, MLflow의 **`mlflow.evaluate()`** 함수 및 **`Evaluation/Datasets`** 메뉴를 통해 100% 로컬에서 무료로 모델 간 정답률 비교 차트를 생성할 수 있습니다.

---

## 4. 연쇄적 수정(Cascading Fixes)과 아티팩트 라이프사이클 전략

수십 번의 재시도가 일어나는 브링업 환경에서 디스크 용량 폭발과 관측 UI 마비를 방지하기 위한 3대 원칙:

| 구분 | 중간 재시도 (Attempts 1 ~ N-1) | 최종 성공 (Final Success) |
| :--- | :--- | :--- |
| **추론 Trace** | **모두 기록** (각 시도별 에러 문맥, 모델 판단 근거 보존) | **전체 라이프사이클 통계 집계** |
| **빌드 로그 (Ninja)** | **최신 1회분만 롤링 덮어쓰기** (`latest_build_failure.log`) | **성공 요약 로그**만 영구 보관 |
| **소스 패치 (.diff)** | 에이전트 전용 로컬 Git 브랜치에 커밋으로 누적 | **최종 통합 패치(`final_squash.diff`) 1개만 등록** |
| **부트 이미지 (.img)** | **저장하지 않음** (임시 디렉토리에서 소멸) | **최종 1세트만 Artifact 등록 및 배포** |

> **핵심 원칙**: **"추론 과정(Trace)은 상세히 남기되, 아티팩트(파일)는 최종본 위주로 압축한다."**

---

## 5. 결론 및 시리즈 전체 목차

Android BSP 엔지니어링의 Agentic 전환은 단순히 도구를 연결하는 것을 넘어, **하드웨어의 물리 법칙과 OS의 결정론적 검증 체계 안에서 AI가 탈선하지 않도록 궤도와 안전망을 설계하는 하네스(Engineering Harness)의 완성**입니다.

### [Agentic BSP Shift 시리즈 전체 목차]
- **[제0편: 에이전트 오케스트레이션과 워크플로우 (Claude Workflow vs LangGraph)]({{ '/posts/agentic-bsp-shift-frameworks-and-orchestration/' | relative_url }})**
- **[제1편: Android BSP의 Agentic Shift 정의와 생태계 흐름]({{ '/posts/agentic-bsp-shift-definition-and-landscape/' | relative_url }})**
- **[제2편: AI-Native BSP 아키텍처의 5대 기둥]({{ '/posts/agentic-bsp-shift-five-pillars/' | relative_url }})**
- **[제3편: 단계별 전환 전략 (Phase 1: L1에서 L3~L4로 도약하기)]({{ '/posts/agentic-bsp-shift-phase1-strategy/' | relative_url }})**
- **[제4편: Phase 2: L4에서 L5로 (Virtual DUT & 런타임 관측성)]({{ '/posts/agentic-bsp-shift-phase2-strategy/' | relative_url }})**
- **[제5편: Phase 3: L5에서 L6로 (Physical DUT 보드 팜과 다중 에이전트 협업 체계)]({{ '/posts/agentic-bsp-shift-phase3-strategy/' | relative_url }})**
- **[제6편: 실전 구현 (LangGraph와 MLflow 3 기반의 L4 Closed-Loop Bring-up 플랫폼)]({{ '/posts/agentic-bsp-shift-closed-loop-bringup-mlflow-langgraph/' | relative_url }})**
- **[제7편: 4대 계층 아키텍처와 관측성 3파전 (MLflow 3 vs Langfuse vs LangSmith)]({{ '/posts/agentic-bsp-ops-4layer-architecture-and-observability/' | relative_url }})** (현재 글)
