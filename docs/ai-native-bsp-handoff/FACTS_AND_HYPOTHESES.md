# Facts, Signals, Inferences, and Forecasts

Last handoff snapshot: 2026-10-21.

This file is deliberately conservative. Remote Codex should re-verify URLs, dates, status, and wording before promoting any item to a stronger category.

## Classification

- **FACT** — directly supported by a primary public source.
- **SIGNAL** — observable activity that suggests a direction but does not establish a broader strategy.
- **INFERENCE** — architectural interpretation derived from multiple facts/signals.
- **FORECAST** — forward-looking hypothesis.

## FACT — primary-source items already identified in discussion

### Qualcomm Linux agent skills

- Public repository: <https://github.com/qualcomm-linux/qcom-linux-skills>
- Public roadmap: <https://github.com/qualcomm-linux/qcom-linux-skills/blob/main/ROADMAP.md>
- The roadmap has publicly listed available/planned skills and priorities. Re-check current status before quoting individual entries.

### NVIDIA Jetson BSP skills

- Public repository: <https://github.com/NVIDIA-AI-IOT/jetson-bsp-skills>
- It exposes Jetson BSP-oriented skills/workflows. Re-check the current catalog and exact scope before summarizing.

### NVIDIA SkillEvaluator

- Public repository: <https://github.com/NVIDIA/SkillEvaluator>
- Treat this as a separate project from Jetson BSP Skills unless a primary source explicitly connects their CI/evaluation pipelines.

### OpenEmbedded-Core agent guidance

- `AGENTS.md`: <https://github.com/openembedded/openembedded-core/blob/master/AGENTS.md>
- This is evidence that upstream repository guidance is becoming agent-readable. It is not by itself evidence of autonomous BSP development.

### Android virtual platform / platform tooling

- Android Studio for Platform: <https://developer.android.com/studio/platform/intro>
- Cuttlefish: <https://source.android.com/docs/devices/cuttlefish>
- Re-verify current agent/build/test capabilities before quoting them as FACT.

### Yocto runtime testing

- Yocto testimage/runtime testing: <https://docs.yoctoproject.org/current/test-manual/runtime-testing.html>
- Existing deterministic runtime-test infrastructure is relevant to agent/skill evaluation, but using it specifically as a skill-certification system is an inference unless upstream explicitly says so.

## SIGNAL — areas with public activity that require updated verification

- NXP S32 Design Studio agent/MCP examples that interact with build/flash/real hardware.
- TI CCS/MCAL agent context and MCP tooling.
- Arm MCP/agent-resource work.
- Samsung/Tizen agent skills.
- Academic benchmarks evaluating skills and/or real-hardware agent behavior.

Remote Codex should locate current primary sources and either promote these to FACT or downgrade/remove them.

## INFERENCE — architectural conclusions from the discussion

These are not current industry standards.

1. A robust BSP agent stack should separate deterministic execution tools from skill-level decision knowledge.
2. Skill evaluation should be independent from agent/model evaluation where possible.
3. BSP skill validation likely benefits from a staged ladder: corpus/mock → emulator/virtual target → reference silicon → product board.
4. Generic skills may become more reusable if target-specific knowledge is externalized into target/platform profiles.
5. Existing board farms, LAVA, Cuttlefish, QEMU, and vendor virtual platforms are plausible validation backends for skill evaluation.
6. Higher-level agent autonomy should compose validated lower-level tools/skills rather than bypass them.

## FORECAST — do not present as current fact

1. BSP/SDK packages may eventually be expected to ship `AGENTS.md`/skills/evals alongside source, firmware, recipes, and documentation.
2. Silicon vendors may compete partly on agent-assisted integration/bring-up quality.
3. Skill performance/regression metrics may become CI release gates for BSP engineering knowledge.
4. A de facto “BSP Skill Certification” pattern may emerge around stable virtual/reference targets plus real-silicon validation.

## Known correction from the discussion

Do **not** claim that NVIDIA Jetson BSP Skills are currently certified by NVIDIA SkillEvaluator on real Jetson hardware unless a primary NVIDIA source explicitly demonstrates that connection. The existence of both projects is factual; the integrated pipeline was an extrapolation.
