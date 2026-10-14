import assert from "node:assert";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

async function test(name, fn) {
  totalTests++;
  process.stdout.write(`  [Test ${totalTests}] ${name} ... `);
  const t0 = Date.now();
  try {
    await fn();
    const dur = Date.now() - t0;
    console.log(`PASS (${dur}ms)`);
    passedTests++;
  } catch (err) {
    const dur = Date.now() - t0;
    console.log(`FAIL (${dur}ms)`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
    failures.push({ name, error: err.message });
  }
}

async function fetchJson(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON from ${url} (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  return { status: res.status, data };
}

async function verifyImageReachable(url) {
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(12000) });
    return res.status >= 200 && res.status < 400;
  } catch {
    // If HEAD is blocked or times out, try GET with range or timeout
    try {
      const res = await fetch(url, { headers: { Range: "bytes=0-10", "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(12000) });
      return res.status >= 200 && res.status < 400;
    } catch {
      return false;
    }
  }
}

export async function runAdversarialHarness() {
  console.log("================================================================================");
  console.log("   TASTEMEM EMPIRICAL CHALLENGER: ADVERSARIAL RECOMMENDATION ENGINE HARNESS     ");
  console.log("================================================================================");
  console.log(`Base URL: ${BASE_URL}\n`);

  // ===========================================================================
  // SUITE 1: Mode 1 (More Like This)
  // ===========================================================================
  console.log("--- SUITE 1: Mode 1 (More Like This) - Same-Domain High-Affinity ---");

  await test("Mode 1: Movies domain (Spirited Away) returns same-domain with high affinity", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&domain=movies"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.mode, "more_like_this");
    assert.ok(data.recommendations.length >= 5, "Expected at least 5 recommendations");

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "movies", "Must return same domain (movies)");
      assert.strictEqual(rec.badgeLabel, ":: CINEMA", "Badge must be :: CINEMA");
      assert.ok(typeof rec.affinity === "number", "Affinity must be a number");
      assert.ok(Number.isInteger(rec.affinity), "Affinity must be an integer");
      assert.ok(rec.affinity >= 0 && rec.affinity <= 100, "Affinity must be 0-100");
    }

    const top = data.recommendations[0];
    assert.ok(top.affinity >= 85, `Top recommendation affinity should be >= 85%, got ${top.affinity}%`);
  });

  await test("Mode 1: Music domain (Khruangbin) returns music artists with high affinity", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=BAF6317A-DF94-4C90-92AE-63F86560C21B&domain=music"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.mode, "more_like_this");
    assert.ok(data.recommendations.length >= 5);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "music");
      assert.strictEqual(rec.badgeLabel, ":: VINYL");
      assert.ok(Number.isInteger(rec.affinity));
      assert.ok(rec.affinity >= 0 && rec.affinity <= 100);
    }
    const top = data.recommendations[0];
    assert.ok(top.affinity >= 85, `Top recommendation affinity should be >= 85%, got ${top.affinity}%`);
  });

  await test("Mode 1: Anime domain (Cowboy Bebop) returns anime entities", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=6EBC0C74-90B9-4E45-941B-1BBAA521DA16&domain=anime"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.mode, "more_like_this");

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "anime");
      assert.strictEqual(rec.badgeLabel, ":: ANIME");
      assert.ok(Number.isInteger(rec.affinity));
    }
  });

  await test("Mode 1: Books domain (American Gods) returns books entities", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=B00ABB53-EFEA-4EB3-AC00-60B9AB1A6650&domain=books"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.mode, "more_like_this");

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "books");
      assert.strictEqual(rec.badgeLabel, ":: BOOKS");
      assert.ok(Number.isInteger(rec.affinity));
    }
  });

  // ===========================================================================
  // SUITE 2: Mode 2 (Surprise Me) — Strict Popularity Ceiling <= 0.60
  // ===========================================================================
  console.log("\n--- SUITE 2: Mode 2 (Surprise Me) - Strict Popularity <= 0.60 Check ---");

  await test("Mode 2: Movies seed (Blade Runner 2049) - ALL returned entities have popularity <= 0.60", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=surprise_me&seeds=3A02361C-987B-4F7E-9AAD-071C3853AD92&domain=movies"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.mode, "surprise_me");
    assert.ok(data.recommendations.length > 0, "Must return at least 1 recommendation");

    const violations = [];
    for (const rec of data.recommendations) {
      assert.ok(typeof rec.popularity === "number", `Item ${rec.title} missing popularity`);
      if (rec.popularity > 0.60) {
        violations.push({ title: rec.title, pop: rec.popularity });
      }
      assert.ok(
        rec.bridgeReasoning.includes("discovery") ||
        rec.bridgeReasoning.includes("indie") ||
        rec.bridgeReasoning.includes("underground") ||
        rec.bridgeReasoning.includes("mainstream index"),
        `Bridge reasoning for '${rec.title}' should have indie/rarity wording: ${rec.bridgeReasoning}`
      );
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found ${violations.length} entities violating popularity <= 0.60: ${JSON.stringify(violations)}`
    );
  });

  await test("Mode 2: Music seed (Khruangbin) - ALL returned entities have popularity <= 0.60", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=surprise_me&seeds=BAF6317A-DF94-4C90-92AE-63F86560C21B&domain=music"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.recommendations.length > 0);

    const violations = [];
    for (const rec of data.recommendations) {
      if (rec.popularity > 0.60) {
        violations.push({ title: rec.title, pop: rec.popularity });
      }
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found ${violations.length} entities violating popularity <= 0.60: ${JSON.stringify(violations)}`
    );
  });

  await test("Mode 2: Anime seed (Cowboy Bebop) - ALL returned entities have popularity <= 0.60", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=surprise_me&seeds=6EBC0C74-90B9-4E45-941B-1BBAA521DA16&domain=anime"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.recommendations.length > 0);

    const violations = [];
    for (const rec of data.recommendations) {
      if (rec.popularity > 0.60) {
        violations.push({ title: rec.title, pop: rec.popularity });
      }
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found ${violations.length} entities violating popularity <= 0.60: ${JSON.stringify(violations)}`
    );
  });

  await test("Mode 2: Books seed (American Gods) - ALL returned entities have popularity <= 0.60", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=surprise_me&seeds=B00ABB53-EFEA-4EB3-AC00-60B9AB1A6650&domain=books"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.recommendations.length > 0);

    const violations = [];
    for (const rec of data.recommendations) {
      if (rec.popularity > 0.60) {
        violations.push({ title: rec.title, pop: rec.popularity });
      }
    }
    assert.strictEqual(
      violations.length,
      0,
      `Found ${violations.length} entities violating popularity <= 0.60: ${JSON.stringify(violations)}`
    );
  });

  // ===========================================================================
  // SUITE 3: Mode 3 (Go Wild) — Cross-Domain Leaps
  // ===========================================================================
  console.log("\n--- SUITE 3: Mode 3 (Go Wild) - Cross-Domain Leaps ---");

  await test("Mode 3: Movies -> Books leap", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&targetDomain=books"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "go_wild");
    assert.strictEqual(data.targetDomain, "books");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "books");
      assert.strictEqual(rec.badgeLabel, ":: BOOKS");
      assert.ok(rec.bridgeReasoning.includes("Cross-domain leap"));
      assert.ok(rec.bridgeReasoning.includes("literary narrative"));
    }
  });

  await test("Mode 3: Movies -> Music leap", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&targetDomain=music"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "go_wild");
    assert.strictEqual(data.targetDomain, "music");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "music");
      assert.strictEqual(rec.badgeLabel, ":: VINYL");
      assert.ok(rec.bridgeReasoning.includes("Cross-domain leap"));
      assert.ok(rec.bridgeReasoning.includes("sonic soundscapes"));
    }
  });

  await test("Mode 3: Movies -> Places leap", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&targetDomain=places"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "go_wild");
    assert.strictEqual(data.targetDomain, "places");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.strictEqual(rec.badgeLabel, ":: PLACES");
      assert.ok(rec.bridgeReasoning.includes("Cross-domain leap"));
      assert.ok(rec.bridgeReasoning.includes("physical sanctuary"));
    }
  });

  await test("Mode 3: Music -> Movies leap", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=go_wild&seeds=BAF6317A-DF94-4C90-92AE-63F86560C21B&targetDomain=movies"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "go_wild");
    assert.strictEqual(data.targetDomain, "movies");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "movies");
      assert.strictEqual(rec.badgeLabel, ":: CINEMA");
      assert.ok(rec.bridgeReasoning.includes("Cross-domain leap"));
      assert.ok(rec.bridgeReasoning.includes("cinematic storytelling"));
    }
  });

  await test("Mode 3: Movies -> Anime leap", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&targetDomain=anime"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "go_wild");
    assert.strictEqual(data.targetDomain, "anime");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "anime");
      assert.strictEqual(rec.badgeLabel, ":: ANIME");
      assert.ok(rec.bridgeReasoning.includes("Cross-domain leap"));
      assert.ok(rec.bridgeReasoning.includes("hand-crafted animation"));
    }
  });

  await test("Mode 3: Smart default leap when targetDomain is omitted", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&domain=movies"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "go_wild");
    // Default for movies is books
    assert.strictEqual(data.targetDomain, "books");
    assert.ok(data.recommendations.length > 0);
    assert.strictEqual(data.recommendations[0].domain, "books");
  });

  // ===========================================================================
  // SUITE 4: Mode 4 (Trip Guide) — Location Grounding
  // ===========================================================================
  console.log("\n--- SUITE 4: Mode 4 (Trip Guide) - City Location Grounding ---");

  await test("Mode 4: Tokyo location grounding", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Tokyo"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mode, "trip_guide");
    assert.strictEqual(data.city, "Tokyo");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.strictEqual(rec.badgeLabel, ":: PLACES");
      assert.ok(rec.bridgeReasoning.includes("Tokyo Cultural Haven"));
      assert.ok(
        rec.address.includes("Japan") ||
        rec.address.includes("Tokyo") ||
        rec.address.includes("Chiba") ||
        rec.address.includes("Maihama"),
        `Expected Tokyo/Japan address, got: ${rec.address}`
      );
    }
  });

  await test("Mode 4: London location grounding", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=London"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.city, "London");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.ok(rec.bridgeReasoning.includes("London Cultural Haven"));
      assert.ok(
        rec.address.includes("London") || rec.address.includes("United Kingdom"),
        `Expected London/UK address, got: ${rec.address}`
      );
    }
  });

  await test("Mode 4: Paris location grounding", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Paris"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.city, "Paris");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.ok(rec.bridgeReasoning.includes("Paris Cultural Haven"));
      assert.ok(
        rec.address.includes("Paris") || rec.address.includes("France") || rec.address.includes("750"),
        `Expected Paris/France address, got: ${rec.address}`
      );
    }
  });

  await test("Mode 4: New York (and NYC alias) location grounding", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=NYC"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.city, "New York");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.ok(rec.bridgeReasoning.includes("New York Cultural Haven"));
      assert.ok(
        rec.address.includes("New York") || rec.address.includes("NY"),
        `Expected NY address, got: ${rec.address}`
      );
    }
  });

  await test("Mode 4: Berlin location grounding", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Berlin"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.city, "Berlin");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.ok(rec.bridgeReasoning.includes("Berlin Cultural Haven"));
      assert.ok(
        rec.address.includes("Berlin") || rec.address.includes("Germany"),
        `Expected Berlin address, got: ${rec.address}`
      );
    }
  });

  await test("Mode 4: Kyoto location grounding", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Kyoto"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.city, "Kyoto");
    assert.ok(data.recommendations.length > 0);

    for (const rec of data.recommendations) {
      assert.strictEqual(rec.domain, "places");
      assert.ok(rec.bridgeReasoning.includes("Kyoto Cultural Haven"));
    }
  });

  // ===========================================================================
  // SUITE 5: Artwork & Bridges
  // ===========================================================================
  console.log("\n--- SUITE 5: Artwork & Bridges ---");

  await test("Artwork: All recommendations across modes have non-empty valid image URLs", async () => {
    const samples = [
      "/api/recommendations?mode=more_like_this&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&domain=movies",
      "/api/recommendations?mode=surprise_me&seeds=3A02361C-987B-4F7E-9AAD-071C3853AD92&domain=movies",
      "/api/recommendations?mode=go_wild&seeds=BAF6317A-DF94-4C90-92AE-63F86560C21B&targetDomain=books",
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Tokyo",
    ];

    let totalRecsChecked = 0;
    const imageUrlsToProbe = [];

    for (const sampleUrl of samples) {
      const { data } = await fetchJson(sampleUrl);
      for (const rec of data.recommendations) {
        totalRecsChecked++;
        assert.ok(rec.coverImageUrl, `Missing coverImageUrl for '${rec.title}'`);
        assert.ok(typeof rec.coverImageUrl === "string", "coverImageUrl must be string");
        assert.ok(
          rec.coverImageUrl.startsWith("http://") || rec.coverImageUrl.startsWith("https://"),
          `coverImageUrl must be HTTP/HTTPS: ${rec.coverImageUrl}`
        );
        if (imageUrlsToProbe.length < 5) {
          imageUrlsToProbe.push({ title: rec.title, url: rec.coverImageUrl });
        }
      }
    }

    assert.ok(totalRecsChecked >= 30, `Expected at least 30 recommendations checked, got ${totalRecsChecked}`);

    // Probe 5 sample image URLs to verify they are live and reachable (not 404)
    for (const probe of imageUrlsToProbe) {
      const reachable = await verifyImageReachable(probe.url);
      assert.ok(reachable, `Image URL for '${probe.title}' is not reachable: ${probe.url}`);
    }
  });

  await test("Bridges: Bridge text is substantive, grammatically sound, and free of placeholders", async () => {
    const samples = [
      "/api/recommendations?mode=more_like_this&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&domain=movies",
      "/api/recommendations?mode=surprise_me&seeds=3A02361C-987B-4F7E-9AAD-071C3853AD92&domain=movies",
      "/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&targetDomain=music",
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Paris",
    ];

    for (const sampleUrl of samples) {
      const { data } = await fetchJson(sampleUrl);
      for (const rec of data.recommendations) {
        const bridge = rec.bridgeReasoning;
        assert.ok(bridge, `Missing bridgeReasoning for ${rec.title}`);
        assert.ok(bridge.length >= 25, `Bridge text too short (${bridge.length} chars): "${bridge}"`);
        assert.ok(!bridge.includes("undefined"), `Bridge text contains 'undefined': "${bridge}"`);
        assert.ok(!bridge.includes("[object Object]"), `Bridge text contains '[object Object]': "${bridge}"`);
        assert.ok(!bridge.includes("NaN"), `Bridge text contains 'NaN': "${bridge}"`);
        assert.ok(!bridge.includes("null"), `Bridge text contains 'null': "${bridge}"`);
      }
    }
  });

  // ===========================================================================
  // SUITE 6: Adversarial Boundary & Stress Cases
  // ===========================================================================
  console.log("\n--- SUITE 6: Adversarial Boundary & Stress Cases ---");

  await test("Error case: Missing seeds returns HTTP 400 with helpful error", async () => {
    const { status, data } = await fetchJson("/api/recommendations?mode=more_like_this");
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes("Missing required 'seeds' parameter"));
  });

  await test("Error case: Empty whitespace seeds returns HTTP 400", async () => {
    const { status, data } = await fetchJson("/api/recommendations?mode=more_like_this&seeds=%20%20,%20");
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
  });

  await test("Error case: Invalid mode returns HTTP 400 with valid modes list", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=ultra_instinct&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595"
    );
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes("Invalid mode 'ultra_instinct'"));
    assert.ok(data.error.includes("more_like_this, surprise_me, go_wild, trip_guide"));
  });

  await test("Error case: Non-existent UUID returns HTTP 400 from upstream Qloo, not 500 crash", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=00000000-0000-0000-0000-000000000000&domain=movies"
    );
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
    assert.ok(data.error.includes("Qloo API responded with status 400"));
  });

  await test("Robustness: Multiple comma-separated seeds processed cleanly", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595,3A02361C-987B-4F7E-9AAD-071C3853AD92&domain=movies"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.recommendations.length > 0);
  });

  await test("Robustness: Seed by canonical title string resolves correctly", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=Spirited%20Away&domain=movies"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.seedUsed, "Spirited Away");
    assert.ok(data.recommendations.length > 0);
  });

  await test("Robustness: Music album UUID redirects to artist without 400 error", async () => {
    // Texas Sun album UUID -> redirected to Khruangbin artist UUID
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=more_like_this&seeds=D0E431FD-B38C-4A08-B862-5CF083FC20A6&domain=music"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.recommendations.length > 0);
  });

  await test("Robustness: Unknown city falls back to Tokyo gracefully without crashing", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=AtlantisLostCity"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.city, "Tokyo"); // Default fallback
    assert.ok(data.recommendations.length > 0);
  });

  await test("Robustness: Special characters and XSS attempts in city parameter handled safely", async () => {
    const { status, data } = await fetchJson(
      "/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=%3Cscript%3Ealert(1)%3C/script%3E"
    );
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.city, "Tokyo"); // Normalized city fallback
    assert.ok(data.recommendations.length > 0);
  });

  // ===========================================================================
  // Summary
  // ===========================================================================
  console.log("\n================================================================================");
  console.log(` RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log("================================================================================");

  if (failedTests > 0) {
    console.log("\nFailed Tests Summary:");
    for (const f of failures) {
      console.log(`- ${f.name}: ${f.error}`);
    }
    process.exit(1);
  } else {
    console.log("\nALL ADVERSARIAL CHALLENGE ASSERTIONS VERIFIED EMPIRICALLY!");
  }
}

runAdversarialHarness().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
