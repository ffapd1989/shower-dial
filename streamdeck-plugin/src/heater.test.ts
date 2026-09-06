// SPDX-FileCopyrightText: 2026 Felipe Drummond
// SPDX-License-Identifier: MIT
import { test } from "node:test";
import assert from "node:assert/strict";
import { celsiusOf, nextInCycle, parseTela, TEMPERATURES } from "./heater.ts";

test("double press cycles 37…42 and wraps", () => {
  assert.equal(nextInCycle(37, 37, 42), 38);
  assert.equal(nextInCycle(41, 37, 42), 42);
  assert.equal(nextInCycle(42, 37, 42), 37);
  assert.equal(nextInCycle(50, 37, 42), 37);
  assert.equal(nextInCycle(undefined, 37, 42), 37);
  assert.equal(nextInCycle(46, 44, 50), 48);
});

test("parses a live tela_ line", () => {
  const state = parseTela("41,0,0,175,9600,0,null:pri,5,312583,26 Ago 2024,14,0,0,255,{ 0 - 0 }");
  assert.deepEqual(state, { on: true, heating: false, target: 37, priorityIp: null });
});

test("reads off, heating and a held lock", () => {
  const state = parseTela("11,0,1,18,1380,0,192.168.0.7:pri,13,5327,Sep 16 2022,15,0,0,0");
  assert.deepEqual(state, { on: false, heating: true, target: 45, priorityIp: "192.168.0.7" });
});

test("rejects anything that is not a heater", () => {
  assert.equal(parseTela("<html>hello</html>"), undefined);
  assert.equal(parseTela("1,2,3"), undefined);
});

test("the dial skips the indexes the heater skips", () => {
  assert.equal(celsiusOf(14), 46);
  assert.equal(celsiusOf(15), undefined);
  assert.equal(celsiusOf(16), 48);
  assert.deepEqual(TEMPERATURES.slice(-4), [48, 50, 55, 60]);
});
