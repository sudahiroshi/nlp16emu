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
    0x2000,
    0x8000,
    0x2815,
    0x5000,
    0x2815,
    0x5000,
    0x2815,
    0x5000,
    0x0015,
    0x1001,
    0x2815,
    0x5000,
    0x0015,
    0x1001,
    0x2015,
    0x5000,
    0x2015,
    0x5000,
    0x0015,
    0x2000,
    0x4000,
    0x2015,
    0x5000,
    0x2015,
    0x5000,
    0x0015,
    0x2000,
    0x8000,
    0x2C15,
    0x5000,
    0x2C15,
    0x5000,
    0x2C15,
    0x5000,
    0x0015,
    0x1001,
    0x2C15,
    0x5000,
    0x0015,
    0x1001,
    0x2415,
    0x5000,
    0x2415,
    0x5000,
    0x0015,
    0x2000,
    0x4000,
    0x2415,
    0x5000,
    0x2415,
    0x5000,
    0x0015,
    0x2000,
    0x8001,
    0x2415,
    0x5000,
    0x2415,
    0x5000,
    0x0015,
    0x2000,
    0x8888,
    0x2A15,
    0x5000,
    0x2A15,
    0x5000,
    0x2A15,
    0x5000,
    0x2A15,
    0x5000,
    0x0015,
    0x2000,
    0x8888,
    0x2215,
    0x5000,
    0x2215,
    0x5000,
    0x2215,
    0x5000,
    0x2215,
    0x5000,
    0xFFFF,
    0xFFFF,
]);    

x.load_binary( 0, mem, mem.length);

let cpu = x.web_run(0);
Deno.test({
    name: "SLR A => A=0x4000",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x4000 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SLR A => A=0x2000",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x2000 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SLR A => A=0x1000",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x1000 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SLR A => A=0x0000",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0 );
        assertEquals( result2.value.flag.to, z );
    }
});

Deno.test({
    name: "SLL A => A=0x0002",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x0002 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SLL A => A=0x0004",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x0004 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SLL A => A=0x8000",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x8000 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "SLL A => A=0",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0 );
        assertEquals( result2.value.flag.to, z );
    }
});

Deno.test({
    name: "SAR A => A=0xc000",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0xc000 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "SAR A => A=0xe000",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0xe000 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "SAR A => A=0xf000",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0xf000 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "SAR A => A=0x0000",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0 );
        assertEquals( result2.value.flag.to, z );
    }
});

Deno.test({
    name: "SAL A => A=0x0002",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x0002 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SAL A => A=0x0004",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x0004 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "SAL A => A=0x8000",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x8000 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "SAL A => A=0",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0 );
        assertEquals( result2.value.flag.to, z );
    }
});

Deno.test({
    name: "SAL A => A=0x8002",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x8002 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "SAL A => A=0x8004",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x8004 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "ROR A => A=0x4444",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x4444 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "ROR A => A=0x2222",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x2222 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "ROR A => A=0x1111",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x1111 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "ROR A => A=0x8888",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x8888 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "ROL A => A=0x1111",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x1111 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "ROL A => A=0x2222",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x2222 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "ROL A => A=0x4444",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x4444 );
        assertEquals( result2.value.flag.to, 0 );
    }
});

Deno.test({
    name: "ROL A => A=0x8888",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0x8888 );
        assertEquals( result2.value.flag.to, s );
    }
});

