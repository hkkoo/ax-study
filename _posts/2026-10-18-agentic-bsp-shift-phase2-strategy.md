---
layout: post
title: "Android BSP의 Agentic Shift (4) — 단계별 전환 전략: Phase 2 (L4에서 L5로 도약하기)"
description: "가상 장비(Cuttlefish/QEMU)를 활용한 런타임 폐루프와 Perfetto SQL 관측성, 그리고 Gerrit Presubmit 연동을 통한 L5 조직 워크플로 안착 전략을 다룹니다."
date: 2026-10-18 03:00:00 +0900
---

[제3편]({{ '/posts/agentic-bsp-shift-phase1-strategy/' | relative_url }})에서 우리는 호스트 상의 소스 탐색(L3)과 컴파일·정적 분석 폐루프(L4)를 정복하는 **Phase 1 전략**을 다루었습니다.

컴파일 에러를 스스로 고치고 빌드 산출물을 만들어내는 능력은 대단한 도약이지만, BSP 엔지니어라면 누구나 알고 있는 냉혹한 진실이 있습니다.
**"컴파일이 성공했다고 해서, 보드가 정상 부팅된다는 보장은 어디에도 없다."**

BSP의 진짜 난제는 빌드 이후에 터져 나옵니다. 커널 부팅 중 특정 드라이버에서 발생하는 Null pointer dereference, init 데몬의 무한 재기동 루프, Binder IPC 교착 상태로 인한 시스템 정지 등은 모두 **런타임(Runtime)**에서만 관측됩니다.

이번 4편에서는 빌드 통과를 넘어, **가상 장치(Virtual DUT)와 Perfetto 관측성을 활용해 런타임 디버깅 폐루프를 완성하고 조직의 CI/Gerrit(L5)에 안착시키는 Phase 2 전략**을 다룹니다.

---

## 1. Phase 2의 핵심 난제: 왜 실물 보드로 직행하면 안 되는가?

Phase 1을 마친 팀이 가장 흔히 저지르는 실수는 곧바로 에이전트에게 연구실의 실물 타깃 보드(Physical DUT)를 연결해 플래시를 맡기는 것입니다. 이는 십중팔구 실패로 끝납니다.

### 실물 보드 직행 시 발생하는 3대 병목
1. **보드 브릭(Brick)과 수동 복구의 늪**: 에이전트가 잘못된 파티션이나 부트로더 바이너리를 플래시하여 보드가 벽돌이 되면, 결국 엔지니어가 물리 점퍼를 만지거나 EDL/JTAG 툴을 들고 수동 복구해야 합니다.
2. **보드 자원 부족과 락(Lock) 경합**: 개발팀 내 가용 보드는 항상 부족합니다. 여러 에이전트가 동시에 하나의 물리 보드에 플래시와 재부팅을 시도하면 테스트 상태가 오염됩니다.
3. **물리적 노이즈와 비결정론**: 전원 노이즈, USB 케이블 접촉 불량, 온도에 따른 스로틀링 등 소프트웨어와 무관한 외부 변수가 에이전트의 판단을 교란합니다.

### 전략적 해법: Virtual DUT (가상 런타임)를 샌드박스로 활용
따라서 Phase 2의 핵심 전략은 실물 보드 투입 전, **완전한 소프트웨어 샌드박스인 가상 장비(Virtual DUT)** 위에서 런타임 자율 폐루프를 먼저 입증하는 것입니다.

---

## 2. Virtual DUT 샌드박스: Cuttlefish와 QEMU

```text
[Phase 2 런타임 폐루프]
소스 수정 & 커널/HAL 빌드
  ↓
Virtual DUT 인스턴스 기동 (Cuttlefish / QEMU)
  ↓
부팅 로그 및 Perfetto Trace 캡처
  ↓
Trace Processor SQL 질의 (에러/지연 인과 추적)
  ↓
에이전트 원인 규명 및 패치 재생성 ── (성공 시 Gerrit Presubmit 검증 보고)
```

### 2.1 Android Cuttlefish: AOSP 표준 가상 플랫폼
Cuttlefish는 구글이 GKI 및 플랫폼 검증을 위해 사용하는 공식 가상 참조 장치입니다.
- **실물 폰과 100% 동일한 플랫폼 스택**: GKI 리눅스 커널, VINTF, Vendor HAL, init 1단계/2단계, SELinux 정책, Framework 전체를 에뮬레이션합니다.
- **완벽한 상태 복원력 (Ephemeral VM)**: 에이전트가 잘못된 HAL이나 커널 모듈을 올려 부팅 패닉이 나더라도, VM 프로세스를 죽이고 30초 만에 깨끗한 초기 상태 스냅샷으로 복원할 수 있습니다.
- **무제한 병렬성**: 서버 자원이 허용하는 한 수십 명의 에이전트가 각자 독립된 Cuttlefish 인스턴스에서 동시 디버깅을 수행할 수 있습니다.

### 2.2 QEMU ARM64: 초고속 저수준 커널 검증
커널 드라이버나 부트로더(TF-A, U-Boot), Device Tree의 초기 초기화를 디버깅할 때는 안드로이드 전체 프레임워크가 필요하지 않습니다. QEMU ARM64 가상 머신을 띄우면 수 초 만에 커널 부팅 완료 지점까지 도달하여 드라이버 probe 성공 여부를 검증할 수 있습니다.

---

## 3. 관측성의 가상화: Perfetto Trace Processor SQL 질의

가상 장치가 부팅되면서 뿜어내는 로그는 수십만 줄에 달합니다. 에이전트가 이 방대한 텍스트를 통째로 읽는 것은 불가능합니다.

여기서 [제2편]에서 제시했던 **호스트 측 가상화(Host-side Virtualization)**가 결정적인 무기가 됩니다. 구글 Perfetto의 **Trace Processor Agent Mode**를 활용하여, 에이전트가 SQL 질의를 통해 인과관계를 스스로 좁혀 나가도록 만듭니다.

### 실전 질의 시나리오: Vendor HAL 기동 실패 및 부팅 지연 추적

에이전트는 텍스트를 스크롤하지 않고 다음 3단계 SQL 쿼리로 원인을 확정합니다:

#### Step 1: 부팅 단계 요약 및 지연 구간 탐색
```sql
SELECT phase, duration_ms, status
FROM boot_phases
WHERE status != 'OK' OR duration_ms > 2000;
```
→ *결과: `HAL_INIT` 단계에서 15초 타임아웃 발생 확인.*

#### Step 2: 드라이버 Probe 및 서비스 실패 쿼리
```sql
SELECT service_name, exit_code, restart_count
FROM android_services
WHERE restart_count > 0;
```
→ *결과: `vendor.sensors-hal-2-1` 서비스가 5회 크래시 후 무한 재기동 중임을 확인.*

#### Step 3: SELinux 차단 및 Binder IPC 에러 교차 검증
```sql
SELECT timestamp, scontext, tcontext, tclass, permissive
FROM selinux_denials
WHERE scontext LIKE '%sensors%'
ORDER BY timestamp DESC LIMIT 5;
```
→ *결과: `sensors` 데몬이 `/dev/i2c-3` 노드에 접근하려다 SELinux `avc: denied`로 차단된 사실을 확인.*

에이전트는 이 3번의 SQL 질의(소모 토큰 500개 미만)만으로 **"센서 HAL 소스 오류가 아니라, Device Tree 권한 정책 누락이 원인"**이라는 정확한 인과 증거를 도출해 냅니다.

---

## 4. L5로의 도약: 조직 워크플로 스킬화와 Gerrit Presubmit 연동

개인 개발자의 터미널에서 혼자 도는 에이전트는 진정한 의미의 엔지니어링 혁신이 아닙니다. Phase 2의 완성은 **조직의 코드 리뷰 시스템(Gerrit)과 CI 파이프라인에 에이전트가 정식 빌드/검증 주체로 통합되는 L5 단계**입니다.

### 4.1 Gerrit Presubmit 자율 검증 파이프라인
1. **Change 감지**: 엔지니어가 Gerrit에 신규 커밋(Patchset)을 업로드합니다.
2. **에이전트 인스턴스 기동**: 에이전트가 격리된 worktree에 체인지를 체크아웃하고, 빌드 wrapper를 호출합니다.
3. **Virtual DUT 자동 검증**: 컴파일된 이미지를 Cuttlefish 인스턴스에 올려 부팅을 실행하고, 사전에 정의된 Verifier(기본 VTS 테스트, 부팅 마커 통과 여부)를 수행합니다.
4. **회귀 분석 (Regression Detection)**: 이전 통과 빌드의 Perfetto Trace와 비교하여, 부팅 시간이 500ms 이상 지연되었거나 불필요한 Binder 트랜잭션이 늘어났는지 검사합니다.
5. **감사 가능한 리뷰 코멘트 작성**:
   - 통과 시: `Verified +1` 부여 및 Perfetto Trace 링크 첨부.
   - 실패 시: 실패 원인 SQL 결과 스니펫과 수정 권고안을 Gerrit 인라인 코멘트로 등록.

### 4.2 Non-destructive 거버넌스 유지
에이전트는 검증과 피드백(`Verified +1`)까지만 자율적으로 수행하며, 최종 머지(`Code-Review +2` 및 `Submit`)는 반드시 **사람 시니어 엔지니어의 승인 게이트**를 거치도록 고정합니다.

---

## 5. Phase 2 정량적 KPI 및 성공 기준

| 측정 지표 | 목표 기준선 | 측정 방식 및 의미 |
|---|---|---|
| **런타임 부팅 버그 자율 규명률** | **70% 이상** | 가상 DUT에서 발생한 부팅 실패 사례 중 에이전트가 정확한 원인 소스/설정과 로그 증거를 매핑한 비율 |
| **Presubmit 성능/부팅 회귀 차단율** | **90% 이상** | 메인 브랜치에 머지되기 전 부팅 지연이나 데몬 크래시를 사전 감지하여 반려한 비율 |
| **엔지니어 런타임 디버깅 시간 절감** | **60% 이상** | 수만 줄의 dmesg/logcat을 육안 분석하는 대신 에이전트의 SQL 질의 요약 리포트를 검토하는 시간으로 단축 |

---

## 다음 단계로의 비전: Phase 3 완결편

Phase 2를 통해 "가상 장치(Virtual DUT) 기반의 런타임 폐루프와 Gerrit CI 통합(L4~L5)"이 안착되면, 조직은 비로소 거대한 테스트 인프라와 안전망을 확보하게 됩니다.

다음 마지막 **[제5편: Phase 3: L5에서 L6로 — 실물 보드 팜(Physical DUT Farm), 하드웨어 인더루프, 그리고 다중 에이전트 협업 체계]({{ '/posts/agentic-bsp-shift-phase3-strategy/' | relative_url }})**에서 가상 장치를 넘어 실제 실리콘 칩셋을 다루는 실물 보드 하네스와 실전 ROI/KPI 종합 평가 체계를 다루며 전체 시리즈를 완성합니다.
