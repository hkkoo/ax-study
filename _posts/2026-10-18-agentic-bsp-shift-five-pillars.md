---
layout: post
title: "Android BSP의 Agentic Shift (2) — AI-Native 아키텍처: 에이전트가 사용할 공통 계약"
description: "Target Profile, 단위 Skill, 관측 증거, 독립 검증과 실행 기록을 연결해 BSP 업무를 에이전트가 사용할 수 있는 계약으로 만듭니다."
date: 2026-10-18 01:00:00 +0900
---

[1편]({{ '/posts/agentic-bsp-shift-definition-and-landscape/' | relative_url }})에서는 대상 업무와 현재 기준선, 완료 조건을 먼저 정했습니다. 다음은 에이전트가 그 업무를 반복할 수 있는 환경을 만드는 일입니다.

이 글에서 **AI-Native**는 타깃의 상태와 도구의 입력·출력·실패를 명시하고, 에이전트가 필요한 증거를 찾아 다음 행동을 결정할 수 있게 설계한다는 뜻입니다. 모든 로그를 JSON으로 바꾸거나 특정 프레임워크를 도입하는 것만으로 이 조건이 충족되지는 않습니다.

공통 기반을 다섯 가지 계약으로 나눕니다. 아래 파일명과 데이터 형식은 이 시리즈의 설계 예시이며, 이미 배포된 표준이나 구현을 뜻하지 않습니다.

## 1. Target Profile: 선언과 실제 관측을 구분한다

같은 SoC라도 보드 리비전과 주변장치 연결이 다를 수 있습니다. 에이전트는 모델의 기억으로 핀·전압·버스를 채워 넣지 않고, 승인된 보드 자료와 프로젝트 설정에서 타깃 정보를 확인해야 합니다.

Target Profile에는 대상 SoC·보드 리비전, 소스 manifest/commit, 빌드 wrapper와 타깃, defconfig·DT 경로, 산출물 경로, 장치 식별 방법을 기록합니다. 각 값의 근거 문서·설정 경로와 확인 시점도 연결합니다.

**Profile은 기대하는 설정입니다. 실제 장치 상태를 증명하는 관측 자료는 별도로 보존합니다.** 잘못되거나 오래된 Profile 자체가 오류 원인이 될 수 있으므로, 선언과 관측이 충돌하면 영향을 받는 작업을 중단하고 차이를 조사합니다. `uname`이나 ADB serial 하나만으로 실제 부팅 이미지까지 식별했다고 간주하지 않습니다.

```yaml
# 계약 모양의 예시. 실제 프로젝트의 값과 검증 방법을 채워야 한다.
profile_id: lab-board-rev-a
source_manifest: manifests/pinned.xml
build:
  entrypoint: tools/project-build
  target: board-kernel
observation:
  board_revision: unknown
  booted_image_identity: unknown
```

값이 없으면 `unknown`으로 남깁니다. `unknown`이 그 작업에 필수인 정보라면 실행 대신 인계 사유를 반환합니다.

## 2. Focused Skills: 작업별 입력·권한·검증을 고정한다

공개된 [Qualcomm Linux Skills](https://github.com/qualcomm-linux/qcom-linux-skills)와 [AndroidX의 에이전트 절차](https://android.googlesource.com/platform/frameworks/support/+/f91db2f7ac997fe61637d7e1446afe2e8c110103/.agents/)는 개별 작업 절차를 참고할 수 있는 사례입니다. 프로젝트에 적용할 때는 대상과 전제를 다시 확인해야 합니다.

한 Skill은 다음을 명시합니다.

| 계약 요소 | 빌드 오류 수정 Skill의 예 |
|---|---|
| 입력·전제 | 재현 가능한 오류, 고정된 소스·설정·툴체인, 타깃 Profile |
| 허용 범위 | 격리 worktree 내 지정 파일 수정, 등록된 빌드 wrapper 실행 |
| 판단과 절차 | 오류 재현 → 관련 심볼 조사 → 수정 가설 → 최소 패치 → 검증 |
| 완료 기준 | 지정 빌드와 필수 검사 통과, 진단을 숨기는 수정 여부 검토 |
| 중단·인계 | 재현 실패, 필수 정보 부족, 승인 필요, 시간·재시도 한도 도달 |
| 산출물 | diff, 명령·종료 코드, 검사 결과와 원본 증거 경로 |

Skill 문서에 금지 사항을 적는 것과 실행 권한을 제한하는 것은 다릅니다. wrapper와 실행 정책이 명령·타깃·쓰기 범위·자원 한도를 실제로 검사해야 합니다. 작업 도중 에이전트가 완료 기준이나 검증 스크립트를 임의로 완화해서는 안 됩니다.

추천 시작 단위는 `kernel-build`, `dts-binding-check`, `kernel-oops-triage`입니다. 장치 플래시나 재부팅을 포함하는 Skill은 별도의 승인·점유·복구 계약을 요구합니다.

## 3. Observability: 원본에서 필요한 증거를 질의한다

`printk`/`dmesg`는 텍스트 메시지를 제공하고, kernel trace event에는 필드 형식이 정의된 데이터가 있습니다. 사용자 공간의 util-linux `dmesg`에는 JSON 출력이 있지만, JSON으로 감싸도 원문에 없던 장치·상태 정보가 생기지는 않습니다. ([dmesg 구현](https://github.com/util-linux/util-linux/blob/master/sys-utils/dmesg.c), [kernel event tracing](https://docs.kernel.org/trace/events.html))

현실적인 출발점은 기존 원본을 보존하면서 호스트에서 필요한 구간을 검색·질의하는 것입니다. 반복해서 필요한 의미 정보가 빠져 있다면 타깃의 tracepoint나 진단 이벤트를 보강할 수도 있습니다. 이때 수집 비용·손실·타이밍 영향을 함께 측정합니다.

```text
UART / dmesg / logcat / 구조화된 trace
                 ↓ 원본·수집 조건 보존
지원 형식의 Trace Processor 또는 프로젝트별 파서
                 ↓ 시간·대상·출처를 연결한 질의
에이전트: 관측된 사실 → 원인 가설 → 다음 검증 선택
```

관측 계약에는 다음이 필요합니다.

- **대상·출처**: run ID, 보드 ID, 소스·이미지 식별 정보, 원본 파일 위치.
- **시간**: 시계 종류와 단위, 부팅 세션, 다른 로그와의 정렬 방법 및 오차.
- **의미**: 이벤트·장치·작업 ID, 필드 정의와 스키마 버전.
- **완전성**: 수집 시작·종료, 누락·버퍼 손실, 잘린 질의 결과 여부.

Perfetto는 이 경로를 구현하는 도구 중 하나입니다. 지원하는 trace와 Android log는 SQL로 질의할 수 있고, 현재 CLI의 `--agent` 모드는 출력 크기 제한과 에이전트용 오류 출력을 제공합니다. RFC-0025는 더 넓은 AI 통합을 설명하는 설계 제안으로 구분합니다. 임의 UART·dmesg 텍스트가 자동으로 같은 테이블에 들어오지는 않습니다. ([AI 가이드](https://perfetto.dev/docs/getting-started/using-ai), [CLI 문서](https://perfetto.dev/docs/reference/trace-processor-cli), [RFC-0025](https://github.com/google/perfetto/discussions/5763))

**SQL 결과는 관측 자료입니다. 원인 확정에는 가설을 구분할 재현과 검증이 추가로 필요합니다.** 다음 편들에서는 이 구분을 호스트와 런타임 작업에 적용합니다.

## 4. Verification: 완료 판정을 생성 과정과 분리한다

검증자는 에이전트의 설명과 별개로 실행합니다. 빌드 종료 코드 `0`은 지정 타깃의 컴파일 증거이고, DTS 검사 통과는 해당 스키마 검사 범위의 증거입니다. 실제 보드 동작이나 모든 기능이 검증됐다는 뜻은 아닙니다.

| 결과 | 판정 조건 |
|---|---|
| `PASS` | 과제에 사전 등록된 필수 검사와 증거 요건을 모두 충족 |
| `FAIL` | 필수 검사 실패 또는 요구 조건 위반 |
| `INCONCLUSIVE` | 수집 누락·타깃 불일치·인프라 장애 등으로 판정할 증거 부족 |

독립적인 판정 절차가 항상 완전한 것은 아닙니다. 숨은 회귀를 놓칠 수 있으므로 사람의 diff 검토와 후속 재작업 결과도 연결합니다. 에이전트가 테스트를 삭제하거나 경고를 억제해 검사를 통과하는 변경도 확인해야 합니다.

장치 변경은 대상·산출물 해시·허용 작업·복구 절차를 묶은 정책으로 제한합니다. 이미지 배포·플래시는 기본적으로 사람 승인을 요구하며, 사전 승인 정책을 쓰더라도 대상·해시·범위·만료 조건을 실행 시 확인합니다. 다른 상태 변경도 등록된 허용·승인 조건이 충족될 때만 실행합니다. 실물 DUT 운영과 CI 피드백 권한은 5편에서 구체화합니다.

## 5. State & Measurement: 대화 밖에 실행과 비용을 남긴다

대화 요약만으로 장시간 디버깅 상태를 유지하지 않습니다. 실행별로 다음 자료를 보존합니다.

```text
runs/<run-id>/
  run.json          # 과제·비교군·모델·정책 버전·한도·최종 결과
  profile.yaml      # 실행 시점의 기대 설정 스냅샷
  events.jsonl      # 명령·상태 전이·재시도·승인·사람 개입
  source/           # manifest·commit·수정 diff
  artifacts.json    # 산출물 해시와 빌드 조건
  evidence/         # 원본 로그·trace·관측된 타깃 상태
  verification.json # 검사 버전·결과·근거 경로
```

소스 → 빌드 산출물 → 실제 타깃 → 관측 자료의 연결을 남깁니다. 실제 로드한 이미지 확인이 불가능했다면 그 한계를 표시합니다. 출처 연결만으로 모든 거짓 완료가 사라지는 것은 아닙니다.

첫 실행부터 사람 투입시간·전체 경과시간·검증 결과·재시도·비용을 기록합니다. 비밀 정보와 공개할 수 없는 보드 자료는 접근 범위를 제한하고, 공개 리포트에는 재현에 필요한 비민감 메타데이터를 남깁니다.

## 이 편의 산출물과 다음 검증

이 편을 적용하면 한 과제에 대해 **Profile, Skill 계약, 관측 명세, 검증자, 실행 기록 형식**이 있어야 합니다. 정보가 빠진 입력을 주었을 때 `unknown`과 인계 사유가 반환되고, 허용 범위를 벗어난 실행이 정책으로 거부되는지 확인합니다.

[3편]({{ '/posts/agentic-bsp-shift-phase1-strategy/' | relative_url }})에서는 이 공통 계약으로 호스트 업무 하나를 끝까지 수행하고, 현재 방식과 비교할 파일럿을 설계합니다.

{% include agentic-bsp-series.md %}
