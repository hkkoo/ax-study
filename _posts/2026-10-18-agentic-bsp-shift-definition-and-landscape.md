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

일반 소프트웨어 개발에서 IDE 자동완성과 챗봇 활용이 확산되고 있지만, 보안·라이선스 정책이 엄격한 BSP 현장에서는 도구 사용 가능 여부와 현재 수준이 조직마다 다릅니다. 따라서 L1을 업계 전체의 측정된 기준선으로 간주하지 않고, 각 팀이 실제 사용 현황을 먼저 기록해야 합니다. 이 글에서는 코드 보조를 출발점으로 삼아 **L3(저장소/하드웨어 맥락 파악)와 L4(빌드-진단-수정의 검증된 폐루프)**로 나아가는 설계 방법을 다룹니다.

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

## 3. 글로벌 실리콘 벤더와 주요 기업들의 AI Shift 지형도

공개 자료는 각 조직의 내부 AI 활용도를 보여주는 완전한 지표가 아닙니다. 외부로 공개된 오픈소스 저장소, 개발자 문서, RFC 제안에서 **직접 검증 가능한 작업 흐름(Verifiable Workflow)**을 바탕으로 글로벌 벤더들의 현주소를 분석합니다.

> [!NOTE]
> **공개 수준과 내부 역량의 분리 (NDA Boundary)**
> 공개 Agent Skill의 부재가 해당 기업 내부에서 AI를 쓰지 않는다는 의미는 결코 아닙니다. 반도체 벤더 특성상 고객사 전용 BSP, 독점 펌웨어, 내부 검증 인프라는 엄격한 기밀유지협약(NDA)에 묶여 있기 때문입니다. 따라서 아래의 분석은 외부 엔지니어가 직접 재현하고 참조할 수 있는 **'공개 엔지니어링 에이전트 성숙도'**를 기준으로 합니다.

### 3.1 실리콘 벤더의 Agentic 성숙도 3대 그룹 분류

업계의 주요 플레이어들은 AI를 다루는 방식과 공개 수준에 따라 크게 3개 그룹으로 나뉩니다:

| 그룹 구분 | 대표 기업 및 프로젝트 | On-device AI 제품 | 공개 AI-for-Engineering 수준 | 특징 및 주력 방향 |
|---|---|:---:|:---:|---|
| **Group A<br/>(Agent-Native 선도)** | Google (AndroidX, Perfetto),<br/>NVIDIA (Jetson),<br/>Qualcomm (Qualcomm Linux) | 매우 높음 | **매우 높음 ~ 높음<br/>(L3~L5)** | 공식 Agent Skill 카탈로그, 워크플로 체이닝, 격리 작업공간, Gerrit CI 연계 등 E2E 절차 공개 |
| **Group B<br/>(Agent-Ready / 전환 착수)** | MediaTek (Genio),<br/>Renesas,<br/>STMicroelectronics, NXP 등 | 높음 | **중간 ~ 초기<br/>(L2~L3)** | CLI/SDK 도구와 문서가 구조화되어 있어 에이전트 도구 연동이 용이하며, 공식 스킬 리포지토리나 전용 AI 어시스턴트 도입 시작 |
| **Group C<br/>(Traditional BSP 중심)** | Rockchip,<br/>Allwinner 계열,<br/>중소 SoC 벤더 | 보통~높음 | **초기 / 보조 도구 중심<br/>(L1~L2)** | 전통적 Git/tarball 소스 트리, 독점 바이너리 펌웨어(DDR/BL31 blob), 전용 플래시 툴(CLI) 중심 구조 유지 |

---

### 3.2 주요 기업별 공개 현황과 엔지니어링 시사점

#### 1. Google: 저장소 격리와 테스트 훈육 (Discipline)
- **[AndroidX Agent Skills](https://android.googlesource.com/platform/frameworks/support/+/f91db2f7ac997fe61637d7e1446afe2e8c110103/.agents/) (`AGENTS.md`)**: 에이전트가 코드를 건드리기 전 격리된 작업공간(Worktree)을 만들고, 단위 테스트를 돌려 변경 전후를 비교하며, 승인된 형식으로만 커밋하도록 강제하는 **엄격한 저장소 훈육 규칙**을 정립했습니다.
- **[Perfetto AI 가이드](https://perfetto.dev/docs/getting-started/using-ai) & [RFC-0025](https://github.com/google/perfetto/discussions/5763)**: 수백 MB의 시스템 트레이스를 모델에 직접 밀어 넣지 않고, Trace Processor를 통해 에이전트가 필요한 구간만 SQL로 정밀 질의할 수 있는 [CLI agent mode](https://perfetto.dev/docs/reference/trace-processor-cli)와 인터페이스 표준을 구축하고 있습니다.

#### 2. Qualcomm: 작고 명확한 Non-destructive BSP 절차
- **[Qualcomm Linux Skills](https://github.com/qualcomm-linux/qcom-linux-skills)**: Qualcomm은 "AI에게 코드를 통째로 맡긴다"가 아니라, **BSP 엔지니어의 작업 절차(Procedure)를 작은 스킬로 모듈화**하는 전략을 취합니다.
- 기기 식별(`qcom-device-info`), Yocto 빌드(`qcom-yocto-build-image`), QDL 플래시(`qcom-flash-qdl`), 부팅 검증(`qcom-boot-validate`), 커널 백포트(`qcom-kernel-platform-backport`) 등 단계별로 입출력과 전제조건을 명시하고, 비파괴(Non-destructive) 기본 원칙과 명확한 PASS/FAIL 기준을 제시합니다.

#### 3. NVIDIA: Target Profile 기반 E2E 파이프라인
- **[NVIDIA Jetson Skills](https://github.com/NVIDIA/skills)**: 임베디드 리눅스/보드 환경에서 가장 완성도 높은 E2E Chaining 모델을 보여줍니다.
- 하드웨어 형상을 선언하는 `Target Profile`을 기반으로, `Setup → Customize (카메라/핀믹스/PCIe) → Build → Promote → Flash → Validate`로 이어지는 다단계 프로모션 파이프라인을 구축했습니다. 상위 스킬이 하위 스킬을 호출하고, 산출물 상태(State)를 파일로 남겨 낡은 빌드(Stale Artifact)의 플래싱을 원천 방지합니다.

#### 4. MediaTek: 온디바이스 AI와 엔지니어링 AI의 경계
- MediaTek은 스마트폰 및 IoT(Genio) 분야에서 강력한 칩셋과 NeuroPilot NPU 런타임을 보유하고 있어 **'AI on Silicon'** 역량은 최상위권입니다.
- 하지만 **'AI for BSP Engineering'** 관점에서는 공식 Agent Skill 카탈로그의 외부 공개가 상대적으로 제한적입니다. 이는 대다수 안드로이드 BSP와 칩셋 드라이버가 고객사 전용 NDA 경계 내에서 개발되기 때문입니다.
- 그럼에도 불구하고 Genio 플랫폼의 AOSP/Yocto 빌드 래퍼 및 호스트 CLI 도구가 체계화되어 있어, 조직 내부에서 Target Profile과 호환성 리졸버(Compatibility Resolver) 스킬만 얹으면 매우 빠르게 L4 수준으로 도약할 수 있는 높은 잠재력을 가지고 있습니다.

#### 5. Rockchip: 실전 E2E 에이전틱 실험의 최적 플랫폼
- Rockchip은 전통적인 오픈소스 커널/U-Boot 리포지토리와 독점 바이너리 패키지([rkbin](https://github.com/rockchip-linux/rkbin)), 플래시 툴([rkdeveloptool](https://github.com/rockchip-linux/rkdeveloptool)) 체제를 유지하고 있습니다.
- 공식 AI 에이전트 스킬은 공개되어 있지 않지만, **실제 임베디드 현장의 폐루프 실험용으로는 가장 현실적인 타깃**입니다. 오픈소스 영역(Kernel, DTS, U-Boot)은 에이전트에게 소스 레벨 심층 분석을 맡기고, 비공개 영역(DDR 초기화 바이너리, BL31 신뢰 펌웨어)은 릴리즈 노트와 버전 출처(Provenance) 정합성 검사로 역할을 분리하여 처리하는 실전형 아키텍처를 검증하기에 적합합니다.

#### 6. Renesas & ST: 임베디드 벤더의 지식 자산화
- **Renesas**: 중견 실리콘 벤더 가운데 공식 에이전트 스킬 리포지토리([renesas-skills](https://github.com/renesas/renesas-skills))를 공개하며 자사 SoC의 디버거 설정과 BSP 지식을 에이전트가 읽을 수 있는 형태로 변환하기 시작했습니다.
- **STMicroelectronics**: [STM32 Sidekick](https://www.st.com/content/st_com/en/about/ai-at-st/stm32-sidekick.html)처럼 방대한 데이터시트, 레퍼런스 매뉴얼, 애플리케이션 노트를 임베딩하여 엔지니어의 질의에 정확한 근거를 제시하는 문서 기반 어시스턴트(Grounded Assistant, L1~L2)에 집중하고 있습니다.

---

### 3.3 'Traditional BSP'의 역설: 덜 자동화된 환경일수록 AI ROI가 더 크다

실리콘 벤더 지형도를 분석하면서 얻을 수 있는 가장 중요한 공학적 통찰은 다음과 같습니다:

> **"이미 CI/CD가 완벽히 갖춰진 최첨단 환경(Group A)보다, 오히려 문서가 파편화되어 있고 수작업 빌드/플래시가 만연한 전통적 BSP 환경(Group C)에서 Agentic Shift의 실질적 투자 수익률(ROI)이 훨씬 더 높을 수 있다."**

```text
[ 전통적 BSP 환경의 엔지니어 수작업 병목 ]
PDF 매뉴얼 검색 ──▶ 브랜치 확인 ──▶ DTS 노드 추적 ──▶ 바이너리 펌웨어 버전 대조 ──▶ 수작업 빌드 ──▶ 수동 플래시 ──▶ 시리얼 터미널 육안 확인
               ▲                                                                                                    │
               └────────────────────── 문제 발생 시 수작업 디버깅 루프 무한 반복 ────────────────────────────────────┘
```

전통적 환경에서는 엔지니어가 코드 작성보다 **"맞는 브랜치 찾기, 누락된 DTS 속성 찾기, 바이너리 펌웨어 버전 충돌 해결, 플래시 툴 옵션 맞추기"**와 같은 반복적 조사와 환경 세팅(Human Touch)에 대부분의 시간을 뺏깁니다.

이 반복 과정을 `target-profile`과 `focused-skills`로 묶어 에이전트에게 위임하면, 엔지니어의 직접 투입 시간(Human Touch Time)을 극적으로 절감하는 효과를 거둘 수 있습니다. 즉, 에이전틱 전환의 가치는 벤더의 최신 기술 유무가 아니라 **"현재 우리 팀의 업무 파이프라인에서 사람이 낭비하고 있는 병목이 어디에 있는가"**에 정비례합니다.

---

## 4. 앞으로 이어질 내용 (시리즈 목차)

Android BSP의 Agentic 전환은 단순히 한두 개의 프롬프트를 바꾸는 작업이 아닙니다. 앞으로 다음 단계별 전략들을 순차적으로 다룰 예정입니다:

- **[제2편: AI-Native BSP 아키텍처의 5대 기둥]({{ '/posts/agentic-bsp-shift-five-pillars/' | relative_url }})**: L1을 넘어 폐루프(L4)를 가능하게 만드는 엔지니어링 전제 조건
- **[제3편: 단계별 전환 전략 (Phase 1: L1에서 L3~L4로 도약하기)]({{ '/posts/agentic-bsp-shift-phase1-strategy/' | relative_url }})**: 호스트 빌드 & 정적 진단의 자율 폐루프 구축
- **[제4편: Phase 2: L4에서 L5로 (Virtual DUT & 런타임 관측성)]({{ '/posts/agentic-bsp-shift-phase2-strategy/' | relative_url }})**: Cuttlefish/QEMU 가상 장치 부팅 및 Perfetto SQL 질의
- **[제5편: Phase 3: L5에서 L6로 (Physical DUT 보드 팜과 다중 에이전트 협업 체계)]({{ '/posts/agentic-bsp-shift-phase3-strategy/' | relative_url }})**: 실물 보드 팜, 하드웨어 루프, 정량적 ROI/KPI 측정 체계

BSP 엔지니어링은 하드웨어의 동작을 소프트웨어와 검증 절차로 확인하는 일입니다. 이 시리즈에서는 에이전트가 실제로 활용할 수 있는 관측 데이터, 작업 절차, 완료 증거를 구체적인 BSP 사례에 연결해 보겠습니다.
