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
let mem = new Uint16Array(32);

mem[  0] = 0x1215;
mem[  1] = 0x1200;
mem[  2] = 0x0000;
mem[  3] = 0x1B15;
mem[  4] = 0x5000;
mem[  5] = 0x0016;
mem[  6] = 0x2000;
mem[  7] = 0x7FFE;
mem[  8] = 0x0017;
mem[  9] = 0x2000;
mem[ 10] = 0xFFFF;
mem[ 11] = 0x1216;
mem[ 12] = 0x5600;
mem[ 13] = 0x1216;
mem[ 14] = 0x5600;
mem[ 15] = 0x1216;
mem[ 16] = 0x5600;
mem[ 17] = 0x1218;
mem[ 18] = 0x5700;
mem[ 19] = 0xFFFF;
mem[ 20] = 0xFFFF;

x.load_binary( 0, mem, 32);

let cpu = x.web_run(0);
Deno.test({
    name: "A = 0 + 0",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[IP].to, 3 );  // IPが3になっている
        assertEquals( result2.value.register[A].to, 0 );  // Aが0になっている
        assertEquals( result2.value.flag.to, z );  // フラグが0
    }
});

Deno.test({
    name: "inc A",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 1 );  // Aが1になっている
        assertEquals( result2.value.flag.to, 0 );  // フラグが0
    }
});

Deno.test({
    name: "B = A + 0x7ffe",
    fn: () => {
        cpu.next();
        cpu.next();
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[B].to, 0x7fff );  // Bが0x7fffになっている
        assertEquals( result2.value.flag.to, 0 );  // フラグが0
    }
});

Deno.test({
    name: "B = A + 0x7fff",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[B].to, 0x8000 );
        assertEquals( result2.value.flag.to, s + v );
    }
});

Deno.test({
    name: "B = A + 0x8000",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[B].to, 0x8001 );
        assertEquals( result2.value.flag.to, s );
    }
});

Deno.test({
    name: "D = A + 0xffff",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[D].to, 0 );
        assertEquals( result2.value.flag.to, c + z );
    }
});