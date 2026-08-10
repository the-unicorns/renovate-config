import test from "tape";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkgJson = require("./default.json");

const renovatePkgExtends = pkgJson.extends;

const baseRules = [
  "config:recommended",
  "security:minimumReleaseAgeNpm",
  ":dependencyDashboard",
  ":dependencyDashboardApproval",
  ":labels(renovate, dependencies)",
  "group:monorepos",
  "group:recommended",
  ":semanticCommits",
];

// Runs inside a test rather than at import time: a validator failure used to
// abort the process before tape emitted any TAP at all, so CI reported an
// empty run instead of naming the offending option.
test("default.json passes renovate-config-validator", function (t) {
  let valid = true;

  try {
    execFileSync(
      "node_modules/.bin/renovate-config-validator",
      ["--no-global", "default.json"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    valid = false;
    // The validator names the option it rejected on stdout. This goes to
    // stderr rather than into the assertion name, which would otherwise carry
    // the whole report into the CI summary table.
    console.error(
      [error.stdout, error.stderr].filter(Boolean).join("").trim(),
    );
  }

  t.ok(valid, "Config is valid");

  t.end();
});

test("Check if extends is correct", function (t) {
  baseRules.forEach((rule) => {
    t.ok(renovatePkgExtends.includes(rule), `Rule ${rule} is present`);
  });

  // The loop above only catches presets that went missing. Comparing both
  // directions also catches ones that were added, renamed or duplicated --
  // a duplicate used to pass, since the old check paired a length assertion
  // with a one-way membership test.
  t.deepEqual(
    [...renovatePkgExtends].sort(),
    [...baseRules].sort(),
    "extends contains exactly the expected presets",
  );

  t.end();
});

test("Check master issue auto close", function (t) {
  t.ok(pkgJson.dependencyDashboardAutoclose, `Master issue auto close enabled`);

  t.end();
});
