// Self-check for the dot-path helpers used by admin forms and CSV import: `npx tsx lib/admin/paths.check.ts`
import assert from "node:assert/strict";
import { getPath, setPath } from "./paths";

const o: any = {};
setPath(o, "seo.title", "AFCAT");
setPath(o, "options.0", "A");
setPath(o, "options.3", "D");
assert.equal(getPath(o, "seo.title"), "AFCAT");
assert.ok(Array.isArray(o.options), "numeric path segment creates an array");
assert.equal(o.options[3], "D");
assert.equal(getPath(o, "missing.deep.path"), undefined);
console.log("paths ok");
