'use strict';
// Run: node examples/compare-memory.cjs [seed] [continuation_steps]
// No UI, network, npm packages or external service is required.
const fs = require('node:fs');
const path = require('node:path');
const { World, memoryTrial } = require('../genesis_engine.js');
function integer(text, fallback, min, max, label) {
  if (text === undefined) return fallback;
  const value = Number(text);
  if (!Number.isSafeInteger(value) || value < min || value > max)
    throw new Error(`${label} must be an integer between ${min} and ${max}.`);
  return value;
}
try {
  const seed = integer(process.argv[2], 7807, 0, 4294967295, 'seed');
  const steps = integer(process.argv[3], 1800, 1, 100000, 'steps');
  const world = new World({ seed }).advance(1600);
  const result = { seed, ...memoryTrial(world, steps) };
  const target = path.resolve('comparison.json');
  fs.writeFileSync(target, JSON.stringify(result, null, 2) + '\n');
  console.table({
    'Keep existing scars': {
      births: result.kept.newBirths,
      inheritedBirths: result.kept.newInheritances,
      livingAtEnd: result.kept.living,
    },
    'Erase existing scars': {
      births: result.erased.newBirths,
      inheritedBirths: result.erased.newInheritances,
      livingAtEnd: result.erased.living,
    },
  });
  console.log(`Initial scars: ${result.initialScars}; different agent states: ${result.stateDifferent}`);
  console.log('Both branches can create new scars. This tests deletion of prior memory.');
  console.log(`Full report: ${target}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
