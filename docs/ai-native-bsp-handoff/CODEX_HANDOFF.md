# Remote Codex Handoff — AI-Native BSP / Agent Shift

## Goal

Continue research and architecture design for agentic software engineering in:

- Android BSP / AOSP platform engineering
- Embedded Linux
- Yocto / OpenEmbedded
- Automotive software
- Silicon-vendor SDK/BSP environments

The central question is not merely whether an LLM can write BSP code. The research should determine whether engineering knowledge can become **versioned, measurable, target-validated skills** that agents can safely orchestrate.

## What led to this direction

The discussion identified a recurring pattern across emerging vendor and open-source efforts:

- agent-readable repository instructions (`AGENTS.md`, `llms.txt`)
- reusable skills (`SKILL.md`-style artifacts)
- tool exposure through CLI/MCP
- build/test/flash/debug workflows
- growing interest in evaluating whether skills actually improve agent performance

A major concern is that moving directly to autonomous agents without validating the underlying skills and tools can create a fragile system. In BSP/embedded work, compile success is not equivalent to boot, peripheral, power, timing, or product correctness.

## Recommended development strategy

Use **Thin Vertical Slice + Bottom-up Hardening**.

First build one deliberately narrow end-to-end loop to expose architectural gaps. Do not optimize it for autonomy or coverage. Then harden the same capability through the maturity levels below.

```text
L1 Console / deterministic tools
L2 Structured workflow
L3 Skill
L4 Evaluated Skill
L5 Target-validated Skill
L6 Agentic orchestration
```

Higher levels should call lower-level validated primitives rather than bypass them with unrestricted shell generation.

## First vertical slice candidate: Boot Failure Diagnosis

Why it is a good starting point:

- substantial evidence can be captured as text/logs
- a known-failure corpus can be built before hardware automation
- deterministic tool primitives are easy to define
- virtual targets can later introduce controlled failures
- reference boards can extend evaluation to real silicon

Possible progression:

```text
known boot logs
→ deterministic collection/classification tools
→ structured diagnostic workflow
→ skill deciding which workflow/tool to use
→ scenario-based evaluation
→ QEMU/Cuttlefish validation where applicable
→ reference-board fault injection / board farm
→ agent closed loop
```

## Key architecture hypotheses to investigate

These are hypotheses, not established industry standards:

1. BSP/SDK delivery may evolve from software+docs toward software+agent-readable knowledge+skills+evals.
2. Skill validation may need a pyramid: mock/log corpus → virtual target → reference silicon → product board.
3. Skill and target knowledge may be separable artifacts: generic workflow skill + target/platform profile.
4. Existing CI/HIL infrastructure such as LAVA, board farms, Cuttlefish, QEMU, virtual ECUs, or vendor simulators may become useful skill-evaluation backends.
5. Vendor differentiation may eventually include how reliably agent workflows can integrate/bring up their silicon, but this is currently a forecast, not a confirmed market requirement.

## Research targets

Prioritize primary sources for:

- Qualcomm Linux / `qcom-linux-skills`
- NVIDIA Jetson BSP Skills
- NVIDIA SkillEvaluator or equivalent skill-eval tooling
- Google AOSP / Android Studio for Platform / Cuttlefish
- Yocto / OpenEmbedded upstream
- NXP S32 Design Studio agent/MCP workflows
- TI CCS / MCAL agent support
- Arm agent resources / MCP
- Samsung/Tizen agent skills
- LAVA / HIL / virtual platform infrastructure
- academic work on skill evaluation and hardware-validated agent benchmarks

## Required next task for Remote Codex

1. Read `AGENTS.md`, this file, `ROADMAP.md`, and `FACTS_AND_HYPOTHESES.md`.
2. Re-verify every externally checkable claim using primary sources.
3. Add source date, URL, evidence type, and confidence.
4. Correct or remove unsupported claims.
5. Compare public approaches from Qualcomm, NVIDIA, Google, Yocto/OE, NXP, TI, Arm, and Samsung.
6. Investigate public implementations of:
   - Skill CI/CD
   - with-skill vs without-skill evaluation
   - skill regression testing
   - emulator-based skill validation
   - hardware-in-the-loop agent evaluation
   - BSP/SDK packages that directly ship agent skills/context
7. Design the Boot Failure Diagnosis vertical slice with measurable exit criteria for L1 through L6.
8. Do not jump directly to speculative autonomous-agent implementation.

## Important constraint

The previous discussion occasionally mixed confirmed vendor facts with architectural extrapolation. This repository must not repeat that mistake. Every major conclusion should make its epistemic status visible.
