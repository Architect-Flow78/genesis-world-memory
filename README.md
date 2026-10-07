# GENESIS — The world remembers

**A small JavaScript artificial-life sandbox where an agent can disappear while its environmental memory influences later births.**

Open one HTML file. Retire an agent. Watch its scar remain. Then clone the world, erase existing scars in one branch, and compare two continuations under the same external field noise.

**[Русский](README_RU.md) · [Model details](docs/MODEL.md) · [Reproduce the comparison](examples/compare-memory.cjs)**

![GENESIS: a running world with agents, lineage and environmental scars](assets/demo-en.png)

[Watch a recorded run](assets/preview-en.mp4) · [Download the repository ZIP](https://github.com/Architect-Flow78/genesis-world-memory/archive/refs/heads/main.zip)

**Topics:** `artificial-life` · `environmental-memory` · `agent-based-modeling` · `generative-art` · `javascript`

## Try it

Download this repository and open **`index.html`** in a modern browser. No server, installation, login or API key is needed. The original Russian demo is `GENESIS_11_RU.html`.

Select an agent and press **Leave a scar**. Its death leaves a fading record of K, accumulated experience and lineage. A later field-driven birth near that record may inherit part of it. Descendants are not created unconditionally at death.

Press **Compare two futures** to remove *only the existing scars* from one copy of the current world. Current agents and fields start identical; both branches receive the same external field noise. **Both may create new scars afterwards.** The comparison is not a permanently memory-free world versus a memory-enabled world.

The initial screen is a computed state after 1,600 simulation steps, not a manually arranged population.

## Reuse the engine without the artwork

The independent engine is `genesis_engine.js`. It runs in Node.js as well as in the browser and has no runtime package dependencies.

```js
const { World, memoryTrial } = require('./genesis_engine.js');

const world = new World({ seed: 7807 }).advance(1600);
const report = memoryTrial(world, 1800);

console.log(report.kept.newBirths);    // 56 in this reference run
console.log(report.erased.newBirths);  // 53 in this reference run
console.log(report.stateDifferent);   // true
```

Or run the ready example with Node.js 22:

```bash
node examples/compare-memory.cjs
node test_genesis.js
```

The example writes a full `comparison.json`. Change the seed or continuation length:

```bash
node examples/compare-memory.cjs 123 1800
```

## What a developer can take from it

A **headless experiment loop**: save a state, branch it, intervene in memory and export the result. A **lineage mechanism**: agents return parameters to their environment; later births can inherit them. A **visual frontend**: connect an alternative model or renderer while keeping the experiment separate from its appearance.

A procedural-world developer can prototype persistent local inheritance. An artificial-life researcher can modify one memory rule and rerun paired continuations. A creative coder can use actual birth, death and inheritance events to drive a visual or musical system. Navigation, learned skills, audio and game-engine integrations are not included.

## A reproducible example, not a claim that memory is better

Seed `7807`, branch at tick `1600`, continue for `1800` steps:

| Outcome | Keep existing scars | Erase existing scars |
|---|---:|---:|
| New births | 56 | 53 |
| Births with inheritance | 42 | 36 |
| Living agents at the end | 42 | 40 |

Initially both copies have the same field and 39 agents; the intervention removes 23 old scars from one copy. This example verifies that the implemented memory mechanism affects the continuation. **More births is not automatically better**, and the table does not establish biological learning, ecological fitness or superiority over another simulator.

The included suite has **20 checks**, including seeded replay, snapshot continuation, eight specified paired trials and a 20,000-step finite-state test. See [recorded evidence](evidence/test_results.json). Run the tests rather than relying on a badge.

## Model in one paragraph

A noisy, lightly damped discrete sine–Gordon field lives on a ring. Programmed peak, threshold, spacing and probability rules create agents. Each agent has K, fast/slow coherence memory, tension, fear, experience and a finite life. Death perturbs the field and leaves a fading scar. Scars affect birth thresholds, candidate weights and inherited parameters. New rules are documented in [MODEL.md](docs/MODEL.md); the detailed Russian source note is [MODEL_RU.md](docs/MODEL_RU.md).

The agent drawings are an artistic frontend. This is **not a biological-life or consciousness claim**, nor a verified physical soliton simulator. Agent creation, inheritance and fading are explicit model rules. “Experience” is a scalar used by those rules, not a demonstrated task-solving skill.

## Project lineage and contributions

Created by **Nicolae Pascal**, continuing the TPM / Organism 8–9 line of experiments. The broader research context is retained, but no prior knowledge of TPM is required to run this project. See [source provenance](SOURCES.md) and [contribution ideas](CONTRIBUTING.md).

**License:** CC BY 4.0, retained from the supplied source bundle. See [LICENSE.md](LICENSE.md) and [NOTICE.md](NOTICE.md). The software and its presentation were developed with AI assistance.
