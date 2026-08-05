import test from "tape";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkgJson = require("./default.json");

// Validate the config with Renovate
execFileSync(
  "node_modules/.bin/renovate-config-validator",
  ["--no-global", "default.json"],
  { stdio: "inherit" },
);

const renovatePkgExtends = pkgJson.extends;

const baseRules = [
  "config:recommended",
  ":dependencyDashboard",
  ":dependencyDashboardApproval",
  ":labels(renovate, dependencies)",
  "group:monorepos",
  "group:recommended",
  ":semanticCommits",
];

test("Check if extends is correct", function (t) {
  t.equal(renovatePkgExtends.length, 7);

  renovatePkgExtends.forEach((item) => {
    t.ok(baseRules.includes(item), `Rule ${item} is present`);
  });
  t.end();
});

test("Check master issue auto close", function (t) {
  t.ok(pkgJson.dependencyDashboardAutoclose, `Master issue auto close enabled`);

  t.end();
});
