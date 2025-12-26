"use strict";

import { test, expect } from "@playwright/test";

/**
 * CIS 281 - Async, Await, and Promises with your project
 *
 * This file is a homework assignment. You will:
 *   - Implement a series of helper functions that use Promises, async, and await.
 *   - Run the tests with:  npm test
 *   - Fix your code until all tests in this file pass.
 *
 * Where to put this file:
 *   - Place this file in your app's tests/ folder:
 *       todo-list/tests/test_health_with_promises.js
 *       or
 *       bible-vision/tests/test_health_with_promises.js
 *
 * Notes:
 *   - Do NOT change the tests (the test(...) blocks).
 *   - Only change the helpers and TODO sections above the tests.
 */

/**
 * Q1 helper: wait(ms)
 *
 * Task:
 *   Implement wait(ms) so that it returns a Promise which resolves after
 *   at least ms milliseconds.
 *
 * Requirements:
 *   - Use new Promise and setTimeout.
 *   - Do not use async/await inside wait; return a raw Promise.
 */
function wait(ms) {
  // TODO Q1:
  //   - Return a Promise.
  //   - Inside the Promise, use setTimeout to resolve after ms milliseconds.
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Q2: makeResolvedValue(value)
 *
 * Task:
 *   Implement makeResolvedValue(value) so that it:
 *     - Returns a Promise that resolves immediately with the given value.
 *
 * Requirements:
 *   - Use Promise.resolve(...) or new Promise(...) (your choice).
 *   - The returned object MUST be a Promise.
 */
function makeResolvedValue(value) {
  // TODO Q2:
  //   - Return a Promise that immediately resolves to value.
  return Promise.resolve(value);
}

/**
 * Q3: doubleAfterShortDelay(n)
 *
 * Task:
 *   Implement doubleAfterShortDelay(n) as an async function that:
 *     - Uses wait(10) to delay a little bit.
 *     - After the wait, returns n * 2.
 *
 * Requirements:
 *   - Declare the function with async.
 *   - Use await wait(10) inside.
 *   - Return the doubled number.
 */
async function doubleAfterShortDelay(n) {
  // TODO Q3:
  await wait(10);
  return n * 2;
}

/**
 * Q4: sumSquaresParallel(nums)
 *
 * Task:
 *   Implement sumSquaresParallel(nums) so that:
 *     - It returns a Promise that resolves to the sum of the squares of nums.
 *     - Each square is computed asynchronously:
 *         * Wait 5 ms (using wait) and then compute n * n.
 *         * Do this for every number in nums.
 *     - Use Promise.all to run these waits in parallel.
 *
 * Requirements:
 *   - You MUST use Promise.all somewhere.
 *   - You may use async/await or .then chaining.
 *   - sumSquaresParallel([]) should resolve to 0.
 */
function sumSquaresParallel(nums) {
  // TODO Q4:
  //   1. Map nums to an array of Promises that:
  //        - wait 5 ms
  //        - then resolve to n * n
  //   2. Use Promise.all on that array.
  //   3. Sum the results and return that sum.
  const promises = nums.map((n) => {
    return wait(5).then(() => n * n);
  });

  return Promise.all(promises).then((values) => {
    let sum = 0;
    for (const v of values) {
      sum += v;
    }
    return sum;
  });
}

/**
 * Q5: collectSuccessfulValues(promises)
 *
 * Task:
 *   Implement collectSuccessfulValues(promises) so that:
 *     - It uses Promise.allSettled(promises).
 *     - It returns a Promise that resolves to an array of the successful values
 *       only (status === "fulfilled"), in the same order.
 *
 * Example:
 *   collectSuccessfulValues([
 *     Promise.resolve("A"),
 *     Promise.reject(new Error("no")),
 *     Promise.resolve("B"),
 *   ]) resolves to ["A", "B"].
 *
 * Requirements:
 *   - Use Promise.allSettled.
 *   - Do not throw if some Promises reject.
 */
function collectSuccessfulValues(promises) {
  // TODO Q5:
  //   1. Call Promise.allSettled(promises).
  //   2. Keep only results with status === "fulfilled".
  //   3. Return an array of their .value fields.
  return Promise.allSettled(promises).then((results) => {
    const values = [];

    for (const r of results) {
      if (r.status === "fulfilled") {
        values.push(r.value);
      }
    }

    return values;
  });
}

/**
 * Q6: apiHealth(request)
 *
 * This one uses YOUR real project.
 *
 * Playwright gives us a "request" fixture that can call your API while the
 * server is running.
 *
 * Task:
 *   Implement apiHealth(request) so that it:
 *     - Sends a GET request to "/api/health".
 *     - Awaits the response.
 *     - Awaits response.json().
 *     - Returns the parsed JSON.
 *
 * Requirements:
 *   - apiHealth MUST be async.
 *   - Use await request.get(...) and await response.json().
 *   - Do not swallow errors; let Playwright see failures if the API is broken.
 */
async function apiHealth(request) {
  const response = await request.get("/api/health");
  const data = await response.json();
  return data;
}

/**
 * Q7: fetchHealthTwiceInParallel(request)
 *
 * Task:
 *   Implement fetchHealthTwiceInParallel(request) so that it:
 *     - Starts two calls to apiHealth(request) in parallel.
 *     - Uses Promise.all to await them both.
 *     - Returns an array [firstResult, secondResult].
 *
 * Requirements:
 *   - MUST use Promise.all.
 *   - Use async/await, not nested .then chains.
 */
async function fetchHealthTwiceInParallel(request) {
  const first = apiHealth(request);
  const second = apiHealth(request);

  const results = await Promise.all([first, second]);
  return results;
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

test("Q1: wait returns a Promise that delays at least the given time", async () => {
  const start = Date.now();
  const p = wait(10);

  // Basic sanity: should be a Promise-like object
  expect(typeof p.then).toBe("function");

  await p;
  const elapsed = Date.now() - start;
  expect(elapsed).toBeGreaterThanOrEqual(8);
});

test("Q2: makeResolvedValue resolves to the original value", async () => {
  const p = makeResolvedValue("hello");
  expect(p instanceof Promise).toBeTruthy();

  const v = await p;
  expect(v).toBe("hello");

  const n = await makeResolvedValue(123);
  expect(n).toBe(123);
});

test("Q3: doubleAfterShortDelay doubles numbers after a small wait", async () => {
  const start = Date.now();
  const result = await doubleAfterShortDelay(7);
  const elapsed = Date.now() - start;

  expect(result).toBe(14);
  expect(elapsed).toBeGreaterThanOrEqual(8);

  const result2 = await doubleAfterShortDelay(0);
  expect(result2).toBe(0);
});

test("Q4: sumSquaresParallel uses Promise.all-style parallelism", async () => {
  const start = Date.now();
  const sum = await sumSquaresParallel([2, 3, 4]);
  const elapsed = Date.now() - start;

  expect(sum).toBe(4 + 9 + 16);

  const sumEmpty = await sumSquaresParallel([]);
  expect(sumEmpty).toBe(0);

  // It should not be doing 3 sequential waits of 5 ms each.
  // We cannot perfectly prove parallelism, but this gives a hint:
  expect(elapsed).toBeLessThan(25);
});

test("Q5: collectSuccessfulValues keeps only fulfilled results", async () => {
  const p1 = Promise.resolve("A");
  const p2 = Promise.reject(new Error("no"));
  const p3 = Promise.resolve("B");

  const values = await collectSuccessfulValues([p1, p2, p3]);

  expect(Array.isArray(values)).toBe(true);
  expect(values.length).toBe(2);
  expect(values[0]).toBe("A");
  expect(values[1]).toBe("B");
});

test("Q6: apiHealth calls /api/health and returns JSON", async ({ request }) => {
  const data = await apiHealth(request);

  expect(data).toBeTruthy();
  expect(typeof data).toBe("object");

  // We expect an "ok" flag in most projects, but do not require any exact shape.
  // If your /api/health returns a different structure, you can inspect it in
  // the Playwright output to debug.
  expect("ok" in data).toBe(true);
});

test("Q7: fetchHealthTwiceInParallel returns two health objects", async ({ request }) => {
  const results = await fetchHealthTwiceInParallel(request);

  expect(Array.isArray(results)).toBe(true);
  expect(results.length).toBe(2);

  for (const item of results) {
    expect(item).toBeTruthy();
    expect(typeof item).toBe("object");
    expect("ok" in item).toBe(true);
  }
});
