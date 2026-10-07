# Model and evidence

GENESIS 11 is a discrete, noisy, weakly damped sine–Gordon field on a periodic 600-cell ring plus a programmed population of agents. It extends Nicolae Pascal's Organism 8/9 architecture. The drawing is a separate artistic representation.

## What a scar does

On death, an agent deposits a field displacement and a record containing location, K, experience, family and generation. The scar fades multiplicatively by `0.99975` each step. Near a scar, the programmed birth threshold is lower and the candidate sampling weight is higher. An unused sufficiently strong scar can contribute part of K and 60% of the recorded experience to one later descendant. The strength can still affect the region after inheritance has been used.

Birth remains conditional: excited local field peak, available space, population cap and a random gate. No agent is spawned unconditionally by the retirement call. No theorem of biological life or physical soliton stability is asserted.

## Memory removal protocol

`memoryTrial(world, steps)` clones the current state twice. In one copy it erases the existing scars. It does not erase current agents or their internal memory, nor the present or previous field. Both copies receive the same external field noise keyed to seed, time and cell. New scars are enabled in both branches. After branching, other random choices and states can differ as a consequence of the intervention.

`memoryEnabled: false` is a different experiment: it disables scar memory for the whole run. Do not confuse these protocols.

The reported state difference compares agent identifiers, sites, rounded K values and generation. Field RMS difference is a separate numerical indicator; neither is a fitness or intelligence score.

## What the existing checks show

The test suite contains 20 checks, with eight specified paired runs and a 20,000-step finite-state check. These test implementation behavior under the selected parameters, not general numerical stability, evolutionary optimality or scientific novelty. Same-seed reproducibility was checked in the tested Node.js runtime; exact cross-engine floating-point equality is not promised.

The reference table in the README was regenerated locally on 7 October 2026 using Node.js 22.16.0 without modifying `genesis_engine.js` or `test_genesis.js` from the supplied bundle.

## Source limitations retained

The threshold named in legacy code is used as a model parameter. K is not forced toward the golden ratio in this version. The radial potential uses divisor counts; the generation-dependent radial change is explicitly programmed, not an independently discovered evolutionary law. Agent experience is a scalar used for inheritance, not a trained skill.

See the preserved detailed Russian model note, [MODEL_RU.md](MODEL_RU.md), and [source attribution](../SOURCES.md).
