const test = require('tape');
const pkgJson = require('./package.json');

// Validate the config with Renovate
require('renovate/bin/config-validator');

const renovatePkgExtends = pkgJson['renovate-config'].default.extends;

const baseRules = [
    "config:base",
    ":masterIssue",
    ":masterIssueApproval",
    ":labels(renovate, dependencies)",
    "group:monorepos",
    "group:recommended",
    ":semanticCommits"
]

test('Check if extends is correct', function (t) {

    t.equal(renovatePkgExtends.length, 7)

    renovatePkgExtends.forEach((item) => {
        t.ok(baseRules.includes(item), `Rule ${item} is present`);
    });
    t.end();
});

test('Check master issue auto close', function (t) {
    t.ok(pkgJson['renovate-config'].default.masterIssueAutoclose, `Master issue auto close enabled`);

    t.end();
});