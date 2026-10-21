# AI-Native BSP / Agentic Embedded Engineering

이 디렉터리는 Android BSP, Embedded Linux, Yocto/OpenEmbedded, Automotive Software, Silicon Vendor 개발 환경에서의 **Agent Shift**를 조사하고 설계하기 위한 작업 공간입니다.

핵심 질문:

> BSP engineering knowledge를 machine-readable Skill로 만들고, 그 Skill을 measurable하고 target-validated한 engineering artifact로 발전시킬 수 있는가?

## 문서 구조

- `AGENTS.md` — 이 영역에서 작업하는 Codex/agent용 연구 규칙
- `CODEX_HANDOFF.md` — 지금까지의 대화와 연구 방향을 Remote Codex로 넘기기 위한 handoff
- `ROADMAP.md` — Console → Workflow → Skill → Eval → Target Validation → Agentic 성숙도 모델
- `FACTS_AND_HYPOTHESES.md` — FACT / SIGNAL / INFERENCE / FORECAST를 분리해 관리하는 원장

## 현재 작업 가설

초기에는 하나의 narrow use case로 얇은 end-to-end agent loop를 먼저 만들어 전체 architecture와 병목을 확인한다. 그 이후 production capability는 아래 순서로 bottom-up hardening한다.

```text
L1  Console / deterministic tools
 ↓
L2  Structured workflows
 ↓
L3  Skills
 ↓
L4  Skill evaluation
 ↓
L5  Target validation
 ↓
L6  Agentic orchestration
```

Agent가 raw shell command를 자유롭게 생성하는 구조보다는 **validated tool + validated skill + validated target** 위에서 reasoning하도록 만드는 것을 기본 방향으로 한다.

## 첫 vertical-slice 후보

1. Boot failure diagnosis
2. Yocto/build failure diagnosis
3. Kernel config / DTS validation
4. Flash + boot validation
5. Peripheral bring-up
6. Power / suspend / performance

첫 구현 후보는 **Boot Failure Diagnosis**다. 로그 corpus로 시작할 수 있고, 이후 QEMU/Cuttlefish/reference board로 검증 수준을 단계적으로 올리기 쉽기 때문이다.
