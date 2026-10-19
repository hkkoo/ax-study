---
layout: post
title: "Android BSP의 Agentic Shift (2) — AI-Native 아키텍처의 5대 핵심 기둥"
description: "하드웨어 추측 금지(Target Profile), 단위 작업 스킬화, 관측성 가상화, 결정론적 검증과 안전 승인, 파일 기반 상태 관리 등 5대 아키텍처 기둥을 상세히 분석합니다."
date: 2026-10-18 01:00:00 +0900
---

[제1편]({{ '/posts/agentic-bsp-shift-definition-and-landscape/' | relative_url }})에서 임베디드 BSP 개발이 모바일 앱이나 웹 개발과 달리 **물리적 하드웨어 종속성, 거대한 빌드 규모, 보드 브릭(Brick) 위험**이라는 특수한 제약을 갖는다는 점을 확인했습니다.

일반 개발 현장에서는 코드 자동완성과 단순 질의응답 활용이 확산되고 있지만, BSP 조직의 도입 수준은 보안·라이선스 정책과 개발 환경에 따라 다릅니다. 이 글은 L1을 측정된 업계 기준선으로 가정하지 않고, 각 팀이 현재 수준을 확인한 뒤 긴 빌드 시간과 복잡한 하드웨어 디버깅이라는 병목을 줄이는 방법을 살펴봅니다.

우리의 다음 목표인 **L3(저장소/하드웨어 맥락 인식)와 L4(자율 폐루프 디버깅)**로 안전하게 도약하려면 어떤 엔지니어링 레일이 깔려 있어야 할까요? 해답은 "더 똑똑한 AI 모델"을 기다리는 것이 아니라, **"AI의 행동을 통제하고 하드웨어 맥락을 주입하는 단단한 엔지니어링 하네스(Harness)"**를 구축하는 데 있습니다. 이를 지탱하는 **5대 핵심 기둥(Five Pillars)**을 살펴봅니다.

---

## 1. Pillar 1: Target Profile (하드웨어 스펙 추측 금지 원칙)

에이전트가 BSP 환경에서 치명적인 실수를 저지르는 가장 흔한 원인은 **"하드웨어 정보를 모델의 지식에 의존해 추측(Guessing)하는 것"**입니다.

### 추측의 위험성
동일한 SoC(예: Qualcomm QCS8550)를 사용하더라도, 보드 리비전(Rev A vs Rev B)에 따라 I2C 버스 번호, PMIC LDO 레귤레이터 번호, GPIO 핀맵이 완전히 달라집니다. 에이전트가 웹에 공개된 일반적인 드라이버 코드를 참고해 임의로 Device Tree를 수정하면 하드웨어 쇼트나 부팅 불능이 발생합니다.

### 아키텍처 해결책: 선언적 Target Profile
보드와 칩셋의 하드웨어 진실(Single Source of Truth)을 별도의 정형화된 설정 파일로 주입하고, 에이전트가 이를 반드시 읽고 전제로 삼도록 강제합니다. 이는 NVIDIA의 [`jetson-bsp-skills`](https://github.com/NVIDIA-AI-IOT/jetson-bsp-skills)가 타깃 명세(Target Profile)를 최상위 계약으로 선언하여 낡은 바이너리(Stale Artifact)의 플래싱을 차단하고, Qualcomm의 [`qcom-device-info`](https://github.com/qualcomm-linux/qcom-linux-skills)가 런타임 하드웨어 프로브 결과와 설정값을 대조하는 접근과 정확히 일치합니다.

- **SoC & 보드 명세**: SoC 파트명, 실리콘 리비전, 보드 HW Rev, PMIC 파트 넘버
- **빌드 및 환경 Entrypoint**: 커널 브랜치, Defconfig 경로, Toolchain 위치, AOSP lunch 타깃
- **산출물 및 패키징 경로**: DTB/DTBO 출력 경로, Image, vendor_boot, vmlinux 심볼 파일
- **장치 연결 정보**: ADB Serial 번호, UART tty 마운트 경로, Fastboot 장치 ID

> **원칙**: 프로필에 명시되지 않은 정보는 `unknown`으로 유지해야 하며, 프로필의 설정값과 실제 런타임 로그(`uname`, devkmsg)가 불일치할 경우 에이전트는 작업을 중단하고 차이를 먼저 조사해야 합니다.

---

## 2. Pillar 2: Focused Skills (작고 명확한 단위 작업 절차)

### '만능 에이전트'의 실패
하나의 거대한 시스템 프롬프트에 "너는 안드로이드 BSP 전문가야. 소스 보고 알아서 빌드하고 디버깅해서 고쳐줘"라고 지시하는 방식(Do-everything Agent)은 반드시 실패합니다. 컨텍스트가 오염되고 어떤 순서로 판단해야 할지 길을 잃기 때문입니다.

### 절차 중심의 단위 스킬화
Qualcomm의 [`qcom-linux-skills`](https://github.com/qualcomm-linux/qcom-linux-skills), Android 저수준·커널 전문 스킬셋인 [`jonaschen/Android-Software`](https://github.com/jonaschen/Android-Software), Yocto의 [`yocto-agent-skills`](https://github.com/Higangssh/yocto-agent-skills), Renesas의 [`renesas-skills`](https://github.com/renesas/renesas-skills)처럼, 각 엔지니어링 작업 단위를 작고 명확한 계약(Contract)을 가진 **Skill**로 모듈화해야 합니다.

각 스킬은 다음 4가지 요소를 엄격히 정의합니다:
1. **Input (입력)**: 에러 로그 위치, 대상 소스 파일, 타깃 프로필
2. **Prerequisites (전제 조건)**: 컴파일러 환경 초기화 여부, 워크스페이스 격리 상태
3. **Procedure (수행 절차)**: 어떤 증거를 먼저 확인하고 어떤 순서로 파일을 수정하는지
4. **Outcome (산출물)**: 패치 diff, 컴파일된 DTBO, 검증 리포트

| 추천 단위 스킬 | 주 담당 업무 | 참조 벤더 구현 및 비고 |
|---|---|---|
| `kernel-build` | 프로젝트 표준 빌드 wrapper/Kleaf 호출 | 독립 `make` 추측 방지 (NVIDIA/Qualcomm 패턴) |
| `kernel-gki-expert` | GKI KMI 심볼 검증, 벤더 `.ko` 모듈 빌드, DTBO 검증 | [`jonaschen/Android-Software`](https://github.com/jonaschen/Android-Software) |
| `dts-binding-check` | `dtschema` 및 `dtc`를 통한 문법/바인딩 검사 | 빌드 전 조기 문법 오류 차단 |
| `kernel-oops-triage` | 패닉 콜스택 파싱 및 호스트 `addr2line` 심볼 매핑 | Intel [`linux-kernel-oops`](https://github.com/intel/linux-kernel-oops) 기반 심볼 역추적 |
| `yocto-doc-router` | 프로젝트 릴리즈 버전에 맞는 공식 문서 라우팅 | [`yocto-agent-skills`](https://github.com/Higangssh/yocto-agent-skills) (BitBake 문법 환각 방지) |
| `configure-debug` | 타깃 하드웨어 디버거 및 launch.json 설정 | Renesas [`configure-renesas-debug`](https://github.com/renesas/renesas-skills) |
| `patch-backport` | Upstream 커널 커밋 검색 및 충돌(Conflict) 해결 | Qualcomm `qcom-kernel-platform-backport` (DTS 의존성 추적) |
| `boot-validate` | UART/dmesg에서 부팅 성공 마커 판정 | Qualcomm `qcom-boot-validate` (PASS/FAIL 판정) |

---

## 3. Pillar 3: AI-Native Observability (관측 데이터의 가상화)

"AI가 로그를 잘 읽게 하려면 커널의 `printk`를 전부 JSON 포맷으로 바꿔야 할까?"라는 질문이 나올 수 있습니다. 커널 로그 형식을 일괄 변경하는 대신, 기존 메시지를 보존하고 호스트에서 파싱·정규화하는 경로부터 만드는 편이 현실적입니다. 사용자 공간의 `dmesg`는 JSON 출력 옵션을 제공하는 구현도 있지만, JSON 포장은 원문에 없는 장치·상태 정보를 만들어 주지 않습니다. 커널 trace event처럼 이미 구조화된 데이터는 그 필드 정의와 함께 수집해 로그와 연결할 수 있습니다.

### 호스트 측 가상화 (Virtualization)
올바른 해법은 **커널을 바꾸는 것이 아니라, 호스트의 툴링을 개선하는 것**입니다.

```text
[타깃 장치 로그]
UART 스트림 / dmesg (/dev/kmsg) / ftrace / Android logcat
                     ↓ (수십 MB의 비정형 원본 데이터)
[호스트 어댑터: Perfetto Trace Processor 또는 프로젝트별 파서]
지원되는 입력은 PerfettoSQL 테이블로 노출; 그 외 원본은 별도 어댑터 필요
                     ↓
[에이전트 인터페이스: PerfettoSQL]
"예: SELECT ts, prio, tag, msg FROM android_logs WHERE prio >= 6"
```

Perfetto Trace Processor는 지원하는 trace와 로그를 테이블로 제공하고 SQL 질의를 수행합니다. 현재 CLI에는 에이전트가 읽기 쉬운 결과 형식과 출력 크기 제한을 제공하는 `--agent` 모드가 있습니다. RFC-0025는 Perfetto의 AI 통합 방향을 설명하는 설계 제안이며, CLI 모드 자체와 구분해야 합니다. 예를 들어 Perfetto가 수집하거나 지원하는 Android log를 포함한 trace에서는 다음처럼 실제 `android_logs` 테이블을 질의할 수 있습니다. `ts`는 나노초 단위입니다. UART 텍스트나 임의의 `dmesg` 덤프가 자동으로 같은 스키마에 들어오는 것은 아니므로, 입력 어댑터·시간 기준·원본 위치를 별도로 정해야 합니다.

```sql
SELECT ts, prio, tag, msg
FROM android_logs
WHERE prio >= 6 AND ts BETWEEN 1200000000 AND 1500000000
ORDER BY ts;
```

이 접근은 원본 전체를 매번 모델 컨텍스트에 넣는 양을 줄이고 결과를 재현 가능하게 하지만, 분석 오류나 환각을 없애지는 않습니다. 질의 결과와 원본 증거를 함께 보존하고 모델의 해석은 별도로 검증해야 합니다. ([Perfetto CLI agent mode](https://perfetto.dev/docs/reference/trace-processor-cli), [Android log 테이블](https://perfetto.dev/docs/data-sources/android-log), [RFC-0025](https://github.com/google/perfetto/discussions/5763))

### Fact vs Hypothesis 분리 프로토콜
- **Fact (증명된 사실)**: `t=1.24s에 i2c transfer timed out(-110) 에러 발생` (로그 증거 라인 링크)
- **Hypothesis (추론된 가설)**: `DTS 상의 PMIC LDO 전압 공급이 누락되었을 가능성`
- 에이전트는 증명된 사실과 자신의 가설을 명확히 구분해야 하며, 가설을 입증할 검증 절차(Verifier) 없이 곧바로 소스 코드를 수정할 수 없습니다.

---

## 4. Pillar 4: Deterministic Verifier & Human Approval (비파괴 기본 원칙)

### 'LLM as a Judge'의 함정 피하기
"이 패치가 버그를 잘 고쳤는가?"를 같은 LLM의 설명만으로 판정하면 독립적인 검증이 되지 않습니다. 완료 판정은 결정론적 검사와 사람이 확인할 수 있는 증거에 연결해야 합니다.

### 결정론적 검증자 (Deterministic Verifier)
작업 완료 판정은 항상 **스크립트와 도구의 종료 코드(Exit Code)**로 판정해야 합니다:
- 컴파일러 종료 코드 `0` (Kleaf/AOSP 빌드 성공; 단독 완료 기준은 아님)
- 변경 diff에서 진단을 숨기는 코드·테스트 삭제·경고 억제·ABI 변경 여부를 정책 기반으로 검사
- `dtschema` 유효성 검사 `PASS`
- 런타임 작업에서는 대상 보드·이미지 식별을 기록하고, 해당 드라이버의 기능별 관측 기준을 확인
- 정해진 회귀 테스트(VTS/CTS 또는 로컬 테스트) 통과

실제 업계에서도 Qualcomm은 LAVA 랩 테스트 결과와 부팅 검증 스킬([`qcom-yocto-lava-ci-report`](https://github.com/qualcomm-linux/qcom-linux-skills), `qcom-boot-validate`)에서 종료 코드로 판정하고, NVIDIA 역시 [`jetson-validate-image`](https://github.com/NVIDIA-AI-IOT/jetson-bsp-skills)를 통해 사전에 작성된 검증 스크립트 결과로만 다음 단계(Promote) 승격을 허용합니다.

### 비파괴 기본 원칙 (Non-destructive Default)
물리 장치를 다루는 BSP 환경에서는 에이전트의 권한을 엄격히 계층화해야 합니다.

| 에이전트 자율 수행 허용 | 반드시 사람의 승인(Approval) 필요 |
|---|---|
| 소스 코드 읽기 및 심볼 탐색 | 보드 플래시(Flash / QDL / Fastboot) |
| 격리된 워크스페이스 내 코드 수정 | 파티션 테이블 재작성 (Partition Write) |
| 로컬 빌드 및 컴파일 에러 수정 | eFuse / Secure Boot 관련 조작 (금지) |
| 로그 및 트레이스 파일 분석 질의 | Gerrit 패치 업로드 및 Merge 제출 |

---

## 5. Pillar 5: State Outside Conversation (대화창 밖 상태 및 4각 Provenance)

### 컨텍스트 윈도우 유실 문제
디버깅이 길어지면 수십 번의 툴 호출과 에러 메시지가 대화창에 쌓입니다. 결국 LLM의 컨텍스트 윈도우가 넘치거나 요약되면서 **초기에 관측했던 중요한 하드웨어 증거가 유실(Lost-in-the-middle)**됩니다.

### 파일 기반 상태 관리
에이전트의 두뇌(Conversation Memory)에만 의존하지 않고, 모든 상태를 **로컬 디스크의 정형화된 파일**로 영속화합니다:
- `run.json`: 실행 메타데이터, 사용된 모델, 타깃 프로필, 시작/종료 시각
- `events.jsonl`: 에이전트가 실행한 모든 명령, 종료 코드, 상태 전이 기록
- `evidence/`: 원본 dmesg, UART 덤프, 빌드 실패 로그 스냅샷

이는 Google AndroidX의 [Git Worktree 기반 격리(`AGENTS.md`)](https://android.googlesource.com/platform/frameworks/support/+/f91db2f7ac997fe61637d7e1446afe2e8c110103/.agents/)와 NVIDIA의 아티팩트 매니페스트(`state.json`) 관리 패턴과 일치합니다.

```text
Source (Git Commit / Diff Hash)
      ↕ (빌드 인과관계)
Artifact (Image / DTBO SHA256)
      ↕ (배포 인과관계)
Target Board (HW Rev / SoC ID)
      ↕ (관측 인과관계)
Observation (Canonical Log Stream)
```

이 출처 연결은 이전 빌드의 낡은 바이너리(Stale Artifact)를 시험하는 실수를 발견하는 데 도움이 됩니다. 다만 잘못된 타깃 식별이나 계측 누락까지 없애지는 않으므로, 실제 부팅한 이미지의 식별 정보와 측정 범위도 결과에 남겨야 합니다.

---

## 요약: 모델 중심에서 '엔지니어링 하네스' 중심으로

| 구분 | 1세대 AI 코딩 (Model-centric) | 2세대 AI-Native BSP (Harness-centric) |
|---|---|---|
| **핵심 자산** | 더 강력한 거대 언어 모델 (LLM) | 하드웨어를 통제하는 **프로필, 스킬, 검증자** |
| **로그 처리** | 수만 줄의 raw 텍스트 복사-붙여넣기 | **Perfetto Trace Processor를 통한 SQL 질의** |
| **안전 장치** | "조심해서 고쳐줘"라는 프롬프트 당부 | **비파괴 권한 분리 및 Human Approval Gate** |
| **완료 판정** | AI의 "수정 완료했습니다"라는 답변 | **결정론적 스크립트 기반 Verifier의 Exit Code 0** |

결국 AI-Native Android BSP의 핵심은 모델 자체가 아니라, **하드웨어와 OS의 엄격한 규칙 속에서 AI가 안전하게 궤도를 돌 수 있도록 만들어 주는 레일(Rail)**을 까는 일입니다.

다음 **[제3편: 단계별 전환 전략 — Phase 1 (L1에서 L3~L4로 도약하기)]({{ '/posts/agentic-bsp-shift-phase1-strategy/' | relative_url }})**에서는 이 5대 기둥을 바탕으로, L1 수준의 단순 질의응답을 넘어 현장에서 가장 먼저 빌드 오류 트리아지, DT 바인딩 검증, Oops 분석의 자율 폐루프를 어떻게 구축할 것인지 구체적인 실행 계획을 살펴보겠습니다.
