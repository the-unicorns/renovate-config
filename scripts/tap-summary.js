#!/usr/bin/env node
// Reads TAP on stdin, writes a GitHub Actions job summary (Markdown) on stdout.
// Non-TAP lines are ignored, so it tolerates the renovate-config-validator
// output that shares the test script's stdout.

const ASSERTION = /^(not )?ok\b\s*(\d+)?\s*(.*)$/;
const DIRECTIVE = /\s+#\s*(SKIP|TODO)\b(.*)$/i;
const COMMENT = /^#\s*(.*)$/;
// tape closes with "# tests 9" / "# pass 9" / "# fail 1" / "# ok" -- those are
// counters, not the name of the group the next assertions belong to.
const COUNTER = /^(tests|pass|fail|failed|ok|not ok)\b/i;

function parse(tap) {
  const results = [];
  let group = "";

  for (const raw of tap.split("\n")) {
    const line = raw.trim();

    const comment = line.match(COMMENT);
    if (comment) {
      if (!COUNTER.test(comment[1])) group = comment[1];
      continue;
    }

    const assertion = line.match(ASSERTION);
    if (!assertion) continue;

    let name = assertion[3] || "";
    let status = assertion[1] ? "fail" : "pass";

    const directive = name.match(DIRECTIVE);
    if (directive) {
      name = name.slice(0, directive.index).trim();
      if (directive[1].toUpperCase() === "SKIP") status = "skip";
    }

    results.push({
      id: assertion[2] || String(results.length + 1),
      name: name.replace(/^-\s*/, "") || "(unnamed)",
      group,
      status,
    });
  }

  return results;
}

const ICON = { pass: "✅", fail: "❌", skip: "⏭️" };

function render(results) {
  if (results.length === 0) {
    return "## Tests\n\n⚠️ No TAP assertions were found — did the suite run?\n";
  }

  const count = (s) => results.filter((r) => r.status === s).length;
  const failed = count("fail");
  const skipped = count("skip");

  const headline = [
    `${count("pass")} passed`,
    failed > 0 ? `${failed} failed` : null,
    skipped > 0 ? `${skipped} skipped` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const lines = [
    `## Tests ${failed > 0 ? "❌" : "✅"} ${headline}`,
    "",
    "| # | Test | Result |",
    "| --: | --- | :-: |",
  ];

  let group = null;
  for (const r of results) {
    if (r.group !== group) {
      group = r.group;
      if (group) lines.push(`| | **${escapePipes(group)}** | |`);
    }
    lines.push(`| ${r.id} | ${escapePipes(r.name)} | ${ICON[r.status]} |`);
  }

  return lines.join("\n") + "\n";
}

// Test names here contain things like ":labels(renovate, dependencies)"; a
// literal pipe would otherwise split the table cell.
function escapePipes(text) {
  return text.replace(/\|/g, "\\|");
}

let stdin = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (stdin += chunk));
process.stdin.on("end", () => process.stdout.write(render(parse(stdin))));
