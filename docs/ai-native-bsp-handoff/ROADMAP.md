# AI-Native BSP Capability Roadmap

## Strategy

Use a thin E2E prototype once, then harden bottom-up.

The prototype exists to expose missing interfaces, context, verification, and target constraints. It is not evidence that the system is production-ready.

## L1 — Console / Deterministic Tools

Goal: make core engineering actions reliable without an agent.

Candidate primitives:

- build
- flash
- reboot/reset
- serial capture
- log collection
- target identification
- boot-stage detection
- test invocation
- artifact collection

Exit criteria should include reproducibility, structured output, explicit errors, safe retries, and versioned tool contracts.

## L2 — Structured Workflow

Goal: compose L1 primitives into deterministic state machines.

Examples:

```text
build → flash → wait-boot → collect-log → test → report
```

Prefer declarative workflows where practical. At this level an LLM should not be necessary for normal execution.

## L3 — Skill

Goal: encode engineering decision knowledge about **when and why** to select a workflow/tool.

Principle:

```text
Skill → validated tool/workflow selection
```

is preferred over:

```text
Skill → arbitrary shell generation
```

## L4 — Skill Evaluation

Goal: prove that a skill improves measurable outcomes and does not introduce regressions.

Minimum comparisons:

- agent baseline
- agent + skill
- agent + skill + target context, when applicable

Candidate metrics:

- task success
- diagnosis accuracy
- tool-selection accuracy
- unsafe/invalid action rate
- retries
- tool calls
- token/cost usage
- completion time
- cross-model robustness
- regression versus previous skill version

## L5 — Target Validation

Goal: establish that an evaluated skill remains correct when interacting with a real system.

Validation ladder:

```text
static/mock/log corpus
→ virtual target
→ vendor reference board
→ customer/product board
```

Different claims require different levels. Framework/init/build behavior may be meaningfully tested virtually; DDR/PMIC/PHY/timing/real-peripheral behavior generally requires silicon.

## L6 — Agentic Orchestration

Goal: allow an agent to orchestrate multiple validated skills/workflows/tools and close a bounded engineering loop.

Example:

```text
issue
→ collect evidence
→ diagnose
→ propose/perform bounded change
→ build
→ deploy/flash
→ validate
→ revise or report
```

Autonomy should be gated by risk and evidence quality. Destructive or silicon-sensitive operations should use explicit policy and target-state checks.

## Vertical-slice sequence

Recommended order:

1. Boot log / boot failure diagnosis
2. Build failure / Yocto recipe diagnosis
3. Kernel config / DTS validation
4. Flash + boot validation
5. Peripheral bring-up
6. Power / suspend / performance

## First-slice success definition

For Boot Failure Diagnosis, define a benchmark corpus before optimizing the agent.

Suggested benchmark fields:

- target/platform
- BSP/kernel/toolchain version
- injected/known failure
- expected boot stage
- expected root cause class
- required evidence
- expected next safe action
- prohibited actions
- final oracle

The first production milestone should be a reproducible L1-L4 pipeline. L5/L6 should follow only after the evaluation baseline is stable.
