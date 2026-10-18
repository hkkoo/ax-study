---
layout: post
title: "Android BSP의 Agentic Shift (1) — 정의와 생태계 흐름"
description: "Agentic Shift를 설명하는 분석 틀과 BSP의 제약, 로그·trace를 에이전트가 활용하는 공개 사례를 살펴봅니다."
date: 2026-10-18 00:00:00 +0900
---

Android와 Linux Kernel, 실리콘 벤더(SoC)의 하드웨어를 함께 다루는 **BSP(Board Support Package) 엔지니어링**에도 AI를 개발 절차에 연결하려는 공개 사례가 나타나고 있습니다. 다만 코드 생성 보조부터 빌드·장치 검증 자동화까지 범위가 달라, 이를 하나의 성숙도 점수로 단정하기는 어렵습니다.

관심의 초점은 코드 자동완성에서 저장소를 조사하고, 도구를 실행하고, 결과를 검증하는 **Agentic Engineering**으로 넓어지고 있습니다. BSP에서는 실제 하드웨어와 긴 빌드 절차까지 연결해야 하므로, 이 전환이 어디까지 진행됐는지 공개된 근거와 설계 제안을 구분해 살펴보겠습니다.

내용의 범위가 방대하므로, 시리즈의 첫 번째 글에서는 **Agentic Shift를 설명하는 분석 틀(L1~L6)**, **임베디드 BSP 환경의 물리적 특수성**, 그리고 **공개 자료에서 확인되는 구현 사례**를 차례대로 정리합니다.

---

## 1. Agentic Shift의 정의: L1에서 L6까지

아래 L1~L6은 이 글에서 변화의 범위를 설명하기 위해 사용하는 **분석 틀**입니다. 업계 공통 표준이나 각 기업의 공식 평가 결과가 아니며, 단계도 항상 순서대로 올라가는 단일 점수는 아닙니다. 예를 들어 자동 빌드 능력과 사람 승인 체계는 별도로 성숙할 수 있습니다.

| 단계 (Level) | 명칭 | 동작 방식 및 특징 | 사람의 역할 |
|---|---|---|---|
| **L1** | **Code Assist & Q&A** | 코드 라인 자동완성, 문법 질의응답, 에러 메시지 단순 해석 | 코드를 직접 작성하며 보조적 타이핑 도움을 받음 |
| **L2** | **Function & Patch Generation** | 단일 함수 작성, 단위 테스트 생성, 간단한 패치 생성 | 생성된 코드 조각을 수동으로 복사·붙여넣기 및 검증 |
| **L3** | **Repository Awareness** | 다중 파일 및 전체 저장소 구조를 파악하고 심볼/참조 기반 수정 | 작업 범위(Scope)를 지정하고 diff를 검토 |
| **L4** | **Closed-Loop Execution** | **Build → Deploy → Test → Log Analysis → Self-Correction** 루프 수행 | 시작 조건과 완료 기준을 설정하고 실행 관찰 |
| **L5** | **Workflow & CI/Gerrit Integration** | 조직의 워크플로를 스킬화(Skill)하고 코드 리뷰(Gerrit) 및 Presubmit 연계 | 아키텍처 가이드라인 수립 및 예외 상황 개입 |
| **L6** | **Orchestrated Autonomous Engineering** | 다중 에이전트가 서브시스템별로 업무를 분담하고 E2E 자율 협업 | 최종 승인(Human Approval) 및 거버넌스 감독 |

이 구분에서 중요한 것은 이름보다 **실행 권한과 검증 책임**입니다. 도구를 호출한다고 곧바로 자율 엔지니어링이 되는 것은 아닙니다. 작업 범위, 관측 근거, 재시도 방법, 완료 판정과 사람의 승인 지점을 함께 설계해야 합니다.

현재 대부분의 엔지니어링 현장은 **L1(코드 자동완성 및 질의응답)** 수준에는 도달해 있습니다. IDE 자동완성이나 챗봇에 에러 메시지를 물어보는 일은 익숙해졌지만, 이것만으로는 BSP 개발의 본질적인 병목(거대한 빌드, 하드웨어 종속성, 부팅 로그 디버깅)을 해결하기에 턱없이 부족합니다. 우리가 다음으로 도약해야 할 실질적인 목표는 L2를 넘어 **L3(저장소/하드웨어 맥락 파악)와 L4(빌드-진단-수정의 자율 폐루프)**입니다.

---

## 2. BSP에서 에이전트에 추가 설계가 필요한 이유

BSP 업무는 다음과 같은 **물리적·환경적 조건**을 포함하므로 에이전트가 사용할 수 있는 절차와 검증 기준을 구체적으로 설계해야 합니다.

### 2.1 물리적 장치(DUT)와 칩셋 의존성
- 소프트웨어뿐 아니라 SoC 리비전, PMIC 전원 시퀀싱, 클럭 트리, 핀믹스(Pinmux), DDR 트레이닝, 플래시 메모리 파티션 등 **물리적 환경의 상태**가 동작을 결정합니다.
- AI가 하드웨어 스펙을 모른 채 코드를 수정하면, 컴파일은 통과하더라도 보드가 켜지지 않거나 영구 손상(Brick)될 위험이 있습니다.

### 2.2 초거대 코드베이스와 긴 빌드 시간
- AOSP의 다중 저장소 구성, 커널의 Kleaf, Android의 Soong, Yocto의 BitBake처럼 빌드 절차는 프로젝트에 따라 다릅니다.
- 빌드 시간이 긴 환경에서 검증 없이 변경과 재빌드를 반복하면 시간과 컴퓨팅 자원이 낭비됩니다. 에이전트는 먼저 실제 build entrypoint와 변경 범위를 확인하고, 단계별로 검증해야 합니다.

### 2.3 로그는 다 비정형이 아니다

- `printk`/`dmesg` 메시지는 사람이 읽기 쉬운 텍스트가 중심입니다. [util-linux의 `dmesg`](https://github.com/util-linux/util-linux/blob/master/sys-utils/dmesg.c)는 JSON 출력을 지원하지만 버전과 대상 이미지에서 사용 가능한지 확인해야 합니다. JSON으로 포장해도 메시지에 없던 장치·상태·원인 정보가 생기지는 않습니다.
- 커널 trace event는 이름과 타입이 있는 필드를 제공할 수 있습니다. Linux 커널 [Event Tracing 문서](https://docs.kernel.org/trace/events.html)에 따르면 각 event의 `format` 파일은 기록된 필드를 설명하고 binary trace를 해석하는 데 사용됩니다.
- Android와 Linux의 [Perfetto Trace Processor](https://perfetto.dev/docs/analysis/trace-processor)는 trace를 테이블과 SQL 질의로 다룹니다. [AI 분석 가이드](https://perfetto.dev/docs/getting-started/using-ai)와 에이전트 환경에서 결과 크기를 제한하고 오류를 JSON으로 내보내는 [CLI agent mode](https://perfetto.dev/docs/reference/trace-processor-cli)도 공개됐습니다.
- UART 텍스트는 보드별로 다르고, 로그 버퍼는 용량이 제한됩니다. 계측을 추가할 때는 손실·오버헤드·타이밍 영향을 함께 측정해야 합니다.

따라서 관측성 개선은 모든 로그를 새 형식으로 바꾸는 일부터 시작할 필요가 없습니다. [원본 printk 로그](https://www.kernel.org/doc/html/latest/core-api/printk-basics.html)를 보존하면서 **구조화된 trace와 프로젝트별 메타데이터를 연결하고, 에이전트가 필요한 구간을 질의하는 경로**를 만드는 것이 현실적인 출발점입니다. 모델이 만든 원인 가설과 로그·trace에서 직접 확인한 사실도 구분해야 합니다.

BSP의 Agentic Engineering은 **"확인된 타깃 정보 + 작업에 맞는 절차와 도구 + 검증 가능한 결과 + 재현 가능한 실행 상태"**를 연결하는 일입니다.

---

## 3. 공개 사례에서 확인되는 구현과 제안

공개 자료는 각 조직의 내부 AI 활용도를 보여주는 완전한 지표가 아닙니다. 아래는 공개 저장소와 문서에서 **직접 확인할 수 있는 작업 흐름**의 예입니다. L1~L6 점수로 조직 전체를 순위화하지 않습니다.

> 공개 사례의 부재만으로 해당 회사 내부에서 AI를 사용하지 않는다고 결론 내릴 수는 없습니다.

| 프로젝트 | 공개 자료에서 확인되는 것 | 범위와 주의점 |
|---|---|---|
| [AndroidX Agent Skills](https://android.googlesource.com/platform/frameworks/support/+/f91db2f7ac997fe61637d7e1446afe2e8c110103/.agents/) | 테스트, 커밋, 격리된 작업공간 등 저장소 작업 절차 | Android 앱/BSP 전반의 자율화 수준을 뜻하지 않음 |
| [Perfetto AI 가이드](https://perfetto.dev/docs/getting-started/using-ai)와 [RFC-0025](https://github.com/google/perfetto/discussions/5763) | 에이전트용 trace Skill과 AI 통합 방향. RFC는 진행 중인 설계 제안 | RFC에 적힌 항목 모두가 현재 구현됐다는 뜻은 아님 |
| [Linux Kernel event tracing](https://docs.kernel.org/trace/events.html) | trace event의 필드 형식과 구조화된 수집 기반 | AI 전용으로 새로 만들어진 인터페이스는 아님 |
| [Qualcomm Linux Skills](https://github.com/qualcomm-linux/qcom-linux-skills) | meta-qcom 빌드, QDL, 커널 backport, 부팅 검증을 위한 개별 절차 | Qualcomm Linux 공개 프로젝트를 대상으로 함. 모든 Qualcomm Android BSP를 포괄하지 않음 |
| [NVIDIA Jetson Skills](https://github.com/NVIDIA/skills) | 이미지 준비·승격·플래시·검증 단계를 잇는 작업 절차 | 공개된 기술 흐름의 사례이며 내부 성숙도 순위는 아님 |
| [Intel Linux Kernel Oops Skill](https://github.com/intel/linux-kernel-oops) | Oops에서 정보를 구조화해 뽑고 디버그 심볼로 분석하는 절차 | 공개 문서상 x86 중심. ARM64 BSP에 그대로 적용할 수 없음 |

### 이 사례들이 보여주는 설계 원칙

1. **분석은 원본 증거에서 출발합니다.** Perfetto Trace Processor는 trace를 SQL로 질의하고, 결과를 재현 가능한 형태로 살펴볼 수 있게 합니다. [CLI 문서에는 에이전트용 출력 모드](https://perfetto.dev/docs/reference/trace-processor-cli)도 설명되어 있습니다.
2. **작업 절차를 작게 나누고 전제를 적습니다.** Qualcomm의 스킬 카탈로그는 빌드, 플래시, 부팅 검증 등을 각각 별도 절차로 제공합니다.
3. **위험한 단계와 검증 단계를 구분합니다.** NVIDIA의 공개 흐름은 이미지 준비, 배포, 장치 플래시·검증을 이어주며, 각 단계가 무엇을 전제로 하는지 기록합니다.
4. **L점수보다 검증 가능한 업무 범위를 봅니다.** BSP 프로젝트에 적용할 때는 실제 대상과 산출물이 절차의 전제에 맞는지 확인해야 합니다.

---

## 4. 앞으로 이어질 내용 (시리즈 목차)

Android BSP의 Agentic 전환은 단순히 한두 개의 프롬프트를 바꾸는 작업이 아닙니다. 앞으로 다음 단계별 전략들을 순차적으로 다룰 예정입니다:

- **제2편: AI-Native BSP 아키텍처의 5대 기둥**: L1을 넘어 폐루프(L4)를 가능하게 만드는 엔지니어링 전제 조건
- **제3편: 단계별 전환 전략 (Phase 1: L1에서 L3~L4로 도약하기)**: 호스트 빌드 & 정적 진단의 자율 폐루프 구축
- **제4편: Phase 2: L4에서 L5로 (Virtual DUT & 런타임 관측성)**: Cuttlefish/QEMU 가상 장치 부팅 및 Perfetto SQL 질의
- **제5편: Phase 3: L5에서 L6로 (Physical DUT & 조직적 안착)**: 실물 보드 팜, 하드웨어 루프, 정량적 KPI 측정 체계

BSP 엔지니어링은 하드웨어의 동작을 소프트웨어와 검증 절차로 확인하는 일입니다. 이 시리즈에서는 에이전트가 실제로 활용할 수 있는 관측 데이터, 작업 절차, 완료 증거를 구체적인 BSP 사례에 연결해 보겠습니다.
