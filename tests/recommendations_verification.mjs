import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Taste Compass Recommendation Engine Verification Suite ===");

  // 1. Error Test: Missing Seeds -> 400
  console.log("\n[Test 1] Missing seeds validation");
  const res1 = await fetch(`${BASE_URL}/api/recommendations?mode=more_like_this`);
  assert.strictEqual(res1.status, 400, "Should return HTTP 400 for missing seeds");
  const data1 = await res1.json();
  assert.strictEqual(data1.success, false, "Should have success: false");
  console.log("✓ Correctly returned HTTP 400 with message:", data1.error);

  // 2. Error Test: Invalid Mode -> 400
  console.log("\n[Test 2] Invalid mode validation");
  const res2 = await fetch(`${BASE_URL}/api/recommendations?mode=invalid_mode&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595`);
  assert.strictEqual(res2.status, 400, "Should return HTTP 400 for invalid mode");
  const data2 = await res2.json();
  assert.strictEqual(data2.success, false, "Should have success: false");
  console.log("✓ Correctly rejected invalid mode with HTTP 400");

  // 3. Mode 1: More Like This (Spirited Away -> Movies)
  console.log("\n[Test 3] Mode 1: More Like This");
  const res3 = await fetch(`${BASE_URL}/api/recommendations?mode=more_like_this&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&domain=movies`);
  assert.strictEqual(res3.status, 200, "Should return HTTP 200");
  const data3 = await res3.json();
  assert.strictEqual(data3.success, true);
  assert.strictEqual(data3.mode, "more_like_this");
  assert.ok(data3.recommendations.length > 0, "Should return recommendations");
  const first3 = data3.recommendations[0];
  assert.ok(typeof first3.affinity === "number" && first3.affinity >= 0 && first3.affinity <= 100, "Affinity must be 0-100 integer");
  assert.strictEqual(Number.isInteger(first3.affinity), true, "Affinity must be an integer");
  assert.strictEqual(first3.domain, "movies");
  assert.strictEqual(first3.badgeLabel, ":: CINEMA");
  assert.ok(first3.coverImageUrl && first3.coverImageUrl.startsWith("http"), "Must have coverImageUrl");
  assert.ok(first3.bridgeReasoning.length > 10, "Must have non-empty bridgeReasoning");
  console.log(`✓ Mode 1 passed: Top rec "${first3.title}" (${first3.affinity}% affinity)`);

  // 4. Mode 2: Surprise Me (Popularity <= 0.60)
  console.log("\n[Test 4] Mode 2: Surprise Me (popularity <= 0.60)");
  const res4 = await fetch(`${BASE_URL}/api/recommendations?mode=surprise_me&seeds=3A02361C-987B-4F7E-9AAD-071C3853AD92&domain=movies`);
  assert.strictEqual(res4.status, 200, "Should return HTTP 200");
  const data4 = await res4.json();
  assert.strictEqual(data4.success, true);
  assert.strictEqual(data4.mode, "surprise_me");
  assert.ok(data4.recommendations.length > 0, "Should return surprise recommendations");
  for (const item of data4.recommendations) {
    assert.ok(
      item.popularity <= 0.60,
      `Item "${item.title}" popularity (${item.popularity}) exceeds 0.60 ceiling`
    );
  }
  console.log(`✓ Mode 2 passed: All ${data4.recommendations.length} recommendations strictly have popularity <= 0.60`);

  // 5. Mode 3: Go Wild (Spirited Away -> Books)
  console.log("\n[Test 5] Mode 3: Go Wild (Cross-Domain Leap)");
  const res5 = await fetch(`${BASE_URL}/api/recommendations?mode=go_wild&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&targetDomain=books`);
  assert.strictEqual(res5.status, 200, "Should return HTTP 200");
  const data5 = await res5.json();
  assert.strictEqual(data5.success, true);
  assert.strictEqual(data5.mode, "go_wild");
  assert.strictEqual(data5.targetDomain, "books");
  assert.ok(data5.recommendations.length > 0, "Should return cross-domain recommendations");
  const first5 = data5.recommendations[0];
  assert.strictEqual(first5.domain, "books");
  assert.strictEqual(first5.badgeLabel, ":: BOOKS");
  assert.ok(first5.bridgeReasoning.includes("Cross-domain leap"), "Bridge text must indicate cross-domain leap");
  console.log(`✓ Mode 3 passed: Top rec "${first5.title}" in domain "${first5.domain}" (${first5.affinity}% affinity)`);

  // 6. Mode 4: Trip Guide (Spirited Away -> Tokyo Places)
  console.log("\n[Test 6] Mode 4: Trip Guide (Tokyo Location Grounding)");
  const res6 = await fetch(`${BASE_URL}/api/recommendations?mode=trip_guide&seeds=9B33A620-68CA-49B3-BFCF-F09CCF8AD595&city=Tokyo`);
  assert.strictEqual(res6.status, 200, "Should return HTTP 200");
  const data6 = await res6.json();
  assert.strictEqual(data6.success, true);
  assert.strictEqual(data6.mode, "trip_guide");
  assert.strictEqual(data6.city, "Tokyo");
  assert.ok(data6.recommendations.length > 0, "Should return Tokyo recommendations");
  const first6 = data6.recommendations[0];
  assert.strictEqual(first6.domain, "places");
  assert.strictEqual(first6.badgeLabel, ":: PLACES");
  assert.ok(first6.address, "Place entity must have address");
  console.log(`✓ Mode 4 passed: Top place "${first6.title}" in Tokyo (${first6.address})`);

  // 7. Music Artist Mode 1 (Khruangbin)
  console.log("\n[Test 7] Music Artist Affinity (Khruangbin)");
  const res7 = await fetch(`${BASE_URL}/api/recommendations?mode=more_like_this&seeds=BAF6317A-DF94-4C90-92AE-63F86560C21B&domain=music`);
  assert.strictEqual(res7.status, 200, "Should return HTTP 200");
  const data7 = await res7.json();
  assert.strictEqual(data7.success, true);
  const first7 = data7.recommendations[0];
  assert.strictEqual(first7.domain, "music");
  assert.strictEqual(first7.badgeLabel, ":: VINYL");
  console.log(`✓ Music seed passed: Top artist "${first7.title}" (${first7.affinity}% affinity)`);

  console.log("\n===============================================================");
  console.log(" ALL 7 AUTOMATED INTEGRATION & CONTRACT ASSERTIONS PASSED! ");
  console.log("===============================================================");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
