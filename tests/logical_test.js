import {
    assertEquals,
    assertArrayContains,
  } from "https://deno.land/std@0.65.0/testing/asserts.ts";

import nlp16 from "../modules/nlp16.js";

const s = 8;
const z = 4;
const v = 2;
const c = 1;

const A = 5;
const B = 6;
const C = 7;
const D = 8;
const E = 9;
const IP = 13;

let x = new nlp16();
let mem = new Uint16Array([
    0x0015,
    0x1000,
    0x0A15,
    0x5100,
    0x0A15,
    0x5200,
    0x1111,
    0x0A15,
    0x5200,
    0x2222,
    0x0A15,
    0x5200,
    0x4444,
    0x0A15,
    0x5200,
    0x8888,
    0x0015,
    0x1000,
    0x0C15,
    0x5000,
    0x0C15,
    0x5000,
    0x0015,
    0x2000,
    0xAAAA,
    0x0C15,
    0x5000,
    0x0C15,
    0x5000,
    0x0015,
    0x2000,
    0xAAAA,
    0x0E15,
    0x5200,
    0x5555,
    0x0E15,
    0x5200,
    0xAAAA,
    0x0015,
    0x2000,
    0xFFFF,
    0x0615,
    0x5200,
    0xFFFF,
    0x0615,
    0x5200,
    0xEEEE,
    0x0615,
    0x5200,
    0xCCCC,
    0x0615,
    0x5200,
    0x8888,
    0x0615,
    0x5100,
    0xFFFF,
    0xFFFF,
]);

x.load_binary( 0, mem, mem.length);

let cpu = x.web_run(0);

// or
Deno.test({
    name: "OR A, 0 => A=0x0000, z=1",
    fn: () => {
        cpu.next("step");
        cpu.next("step");
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x0000 );
        assertEquals( result2.value.flag.to, z );
    }
});

Deno.test({
    name: "OR A, 0x1111 => A=0x1111",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x1111 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "OR A, 0x2222 => A=0x3333",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x3333 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "OR A, 0x4444 => A=0x7777",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x7777 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "OR A, 0x8888 => A=0xffff",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xffff );
        assertEquals( result2.value.flag.to, s );
    }
});

// not
Deno.test({
    name: "NOT A => 0xffff",
    fn: () => {
        cpu.next("step");  // mov a, 0x0000
        cpu.next("step");
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xffff );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "NOT A => A=0x0000",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x0000 );
        assertEquals( result2.value.flag.to, z );
    }
});

Deno.test({
    name: "NOT A => 0x5555",
    fn: () => {
        cpu.next("step");  // mov a, 0xaaaa
        cpu.next("step");
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x5555 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "NOT A => A=0xaaaa",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xaaaa );
        assertEquals( result2.value.flag.to, s );
    }
});

// xor
Deno.test({
    name: "XOR A, 0x5555 => A=0xffff",
    fn: () => {
        cpu.next("step");  // mov a, 0xaaaa
        cpu.next("step");
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xffff );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "XOR A, 0xaaaa => A=0x5555",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x5555 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

// and
Deno.test({
    name: "AND A, 0xffff => A=0xffff",
    fn: () => {
        cpu.next("step");  // mov a, 0xffff
        cpu.next("step");
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xffff );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "AND A, 0xeeee => A=0xeeee",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xeeee );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "AND A, 0xcccc => A=0xcccc",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0xcccc );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "AND A, 0x8888 => A=0x8888",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x8888 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "AND A, 0x0000 => A=0x0000",
    fn: () => {
        let result1 = cpu.next("step");
        let result2 = cpu.next("step");
        assertEquals( result2.value.register[A].to, 0x0000 );
        assertEquals( result2.value.flag.to, z );
    }
});
