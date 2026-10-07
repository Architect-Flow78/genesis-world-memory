# Contributing to GENESIS

A useful contribution should let another person reproduce the change.

Start with `node test_genesis.js`. For a behavior report, attach the seed, current tick, exported snapshot, continuation length, runtime version and expected/observed behavior. Do not use private or sensitive data in a public issue.

## Concrete next experiments

1. **Separate the effects of a scar.** Compare threshold-only, candidate-weight-only and inheritance-only interventions against the existing combined rule. Keep external forcing paired and report all selected seeds.
2. **Measure memory cost.** Profile simulation time versus retained scars and population size. Preserve the current behavior for equivalence tests before optimizing.
3. **Connect events to another renderer or sound.** Consume real birth/death/inheritance events; do not create unrecorded events purely to improve the story.

These are proposed contributions, not existing integrations. The current engine has no robot navigation, obstacle avoidance or external-sensor adapter.

Keep model changes distinct from visual changes. Explain new constants. Do not label visually localized field peaks as certified solitons or translate a birth count into intelligence, biological fitness or physical efficiency.

Project author: Nicolae Pascal. License: CC BY 4.0, as stated in LICENSE.md.
