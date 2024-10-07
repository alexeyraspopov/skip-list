import { test } from "node:test";
import { deepEqual, equal } from "node:assert/strict";
import { FixedSkipList as SkipList } from "./FixedSkipList.js";

const LARGE_LIST_COUNT = 1000000;

test("baseline rank", () => {
  let count = LARGE_LIST_COUNT;
  let data = [];
  let order = (ia, ib) => ascending(data[ia], data[ib]);
  let rank = new Uint32Array(count);

  for (let i = 0; i < count; i++) {
    let value = (Math.random() * 10) | 0;
    let index = data.push(value) - 1;
    rank[i] = index;
  }
  rank.sort(order);
});

test("a lot of records", () => {
  let count = LARGE_LIST_COUNT;
  let data = [];
  let order = (ia, ib) => ascending(data[ia], data[ib]);
  let list = new SkipList(count, 1 / 8, order);

  for (let i = 0; i < count; i++) {
    let value = (Math.random() * 10) | 0;
    let index = data.push(value) - 1;
    list.insert(index);
  }
});

test("empty to one", () => {
  let list = new SkipList(10, 0, ascending);
  equal(list.size, 0);
  list.insert("4");
  equal(list.heads[0], list.tails[0]);
  equal(list.size, 1);
});

test("insert left and insert right", () => {
  let listA = new SkipList(10, 0, ascending);
  listA.insert(4);
  listA.insert(3);
  listA.insert(2);
  let listB = new SkipList(10, 0, ascending);
  listB.insert(4);
  listB.insert(5);
  listB.insert(6);
});

test("remove from list", () => {
  let list = new SkipList(10, 1 / 4, ascending);

  list.insert(4);
  list.insert(8);
  list.insert(7);
  list.insert(5);
  equal(list.size, 4);
  deepEqual(Array.from(list), [4, 5, 7, 8]);
  list.remove(5);
  equal(list.size, 3);
  deepEqual(Array.from(list), [4, 7, 8]);
  list.remove(4);
  equal(list.size, 2);
  deepEqual(Array.from(list), [7, 8]);
  list.remove(8);
  equal(list.size, 1);
  deepEqual(Array.from(list), [7]);
  list.remove(7);
  equal(list.size, 0);
  deepEqual(Array.from(list), []);
});

test("find insertion points", () => {
  let data = ["A", "B", "B", "B", "D", "F"];
  let order = (ia, ib) => ascending(data[ia], data[ib]);
  let list = new SkipList(10, 1 / 2, order);
  for (let i = 0; i < data.length; i++) list.insert(i);
  /*         6    7    8    9   10 */
  data.push("9", "B", "E", "G", "A");

  equal(list.size, 6);

  // right
  equal(
    list.bisect((c) => list.compare(6, c) < 0),
    0,
  );
  equal(
    list.bisect((c) => list.compare(7, c) < 0),
    3,
  );
  equal(
    list.bisect((c) => list.compare(8, c) < 0),
    4,
  );
  equal(
    list.bisect((c) => list.compare(9, c) < 0),
    null,
  );

  // left
  equal(
    list.bisect((c) => list.compare(6, c) <= 0),
    0,
  );
  let left;
  left = list.bisect((c) => list.compare(7, c) <= 0);
  equal(left, 0);
  equal(list.nexts[0][left], 1);
  left = list.bisect((c) => list.compare(8, c) <= 0);
  equal(left, 4);
  equal(list.nexts[0][left], 5);
  equal(
    list.bisect((c) => list.compare(9, c) <= 0),
    null,
  );
  equal(
    list.bisect((c) => list.compare(10, c) <= 0),
    0,
  );
});

function ascending(a, b) {
  return a == b ? 0 : a < b ? -1 : a > b ? 1 : 0;
}
