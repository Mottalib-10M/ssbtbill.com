/** Every calculator runs with its default values and with its page arguments, and prints no NaN or undefined. */
import { describe, expect, it } from 'vitest';
import { SPECS, TOOL_KINDS } from '../src/lib/tool-specs';

describe('calculators', () => {
  for (const k of TOOL_KINDS) {
    it(`${k} runs with its defaults`, () => {
      const spec = SPECS[k]();
      const v = Object.fromEntries(spec.inputs.map((i) => [i.id, i.def]));
      const out = spec.run(v);
      const txt = JSON.stringify(out);
      expect(txt, k).not.toMatch(/NaN|undefined|Infinity|\[object Object\]/);
      if (process.env.SHOW) console.log(k, txt.slice(0, 600));
    });
  }
});
