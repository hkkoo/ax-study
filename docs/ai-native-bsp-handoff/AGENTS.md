# AI-Native BSP Research Instructions

These instructions apply to this directory and its descendants.

## Research discipline

1. Never present inference as fact.
2. Classify important claims as one of:
   - `FACT`: directly supported by a primary source.
   - `SIGNAL`: an observable development that suggests a direction but does not prove intent.
   - `INFERENCE`: our architectural interpretation of multiple facts/signals.
   - `FORECAST`: a forward-looking hypothesis.
3. Prefer primary sources in this order:
   - official vendor/upstream repositories
   - official documentation
   - official engineering forums/tutorials
   - peer-reviewed papers or arXiv when appropriate
   - secondary articles only as discovery aids
4. Record source URLs and dates for externally checkable claims.
5. If a claim cannot be verified, downgrade it to `INFERENCE`/`FORECAST` or remove it.

## Architecture direction

Harden capability in this order:

```text
L1 Console / deterministic tools
L2 Structured workflows
L3 Skills
L4 Skill evaluation
L5 Target validation
L6 Agentic orchestration
```

Use a thin end-to-end vertical slice early to validate the architecture, then harden the system bottom-up.

Do not design Level 6 as a separate magic AI layer. Higher levels should compose and reuse validated lower-level capabilities.

## Verification principles

Prefer deterministic evidence and staged validation:

```text
static/mock/log corpus
→ emulator / virtual target
→ vendor reference board
→ customer silicon / carrier
```

Do not assume emulator success implies silicon success.

Separate:
- skill quality
- model/agent quality
- tool reliability
- target/platform fidelity

Evaluate them independently whenever possible.

## Initial research question

Can BSP engineering knowledge be converted into measurable, target-validated Agent Skills?

## Initial vertical slices

1. Boot failure diagnosis
2. Yocto/build failure diagnosis
3. Kernel config / DTS validation
4. Flash + boot validation
5. Peripheral bring-up
6. Power/performance/suspend

Start with Boot Failure Diagnosis unless stronger evidence suggests a better first slice.

## Deliverables

When continuing this research:
- update `FACTS_AND_HYPOTHESES.md`
- update `ROADMAP.md` when maturity assumptions change
- add verified references
- define measurable exit criteria for each level
- avoid speculative implementation until the technical baseline is verified
