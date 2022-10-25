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

mem[  0] = 0x0015;
mem[  1] = 0x1001;
mem[  2] = 0x1815;
mem[  3] = 0x5000;
mem[  4] = 0x1815;
mem[  5] = 0x5000;
mem[  6] = 0x0016;
mem[  7] = 0x2000;
mem[  8] = 0x7FFE;
mem[  9] = 0x0017;
mem[ 10] = 0x2000;
mem[ 11] = 0xFFFF;
mem[ 12] = 0x1116;
mem[ 13] = 0x6500;
mem[ 14] = 0x1116;
mem[ 15] = 0x6500;
mem[ 16] = 0x1116;
mem[ 17] = 0x6500;
mem[ 18] = 0x1118;
mem[ 19] = 0x5700;
mem[ 20] = 0xFFFF;
mem[ 21] = 0xFFFF;

x.load_binary( 0, mem, 32);

let cpu = x.web_run(0);
Deno.test({
    name: "A = 1 - 1",
    fn: () => {
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[IP].to, 4 );  // IPが4になっている
        assertEquals( result2.value.register[A].to, 0 );  // Aが0になっている
        assertEquals( result2.value.flag.to, z );  // フラグがz
    }
});

Deno.test({
    name: "A = 0 - 1",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[A].to, 0xffff );  // Aが0xffffになっている
        assertEquals( result2.value.flag.to, c + s );  // フラグがc,s
    }
});

Deno.test({
    name: "B = 32766 - (-1)",
    fn: () => {
        cpu.next();
        cpu.next();
        cpu.next();
        cpu.next();
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[B].to, 0x7fff );  // Bが0x7fffになっている
        assertEquals( result2.value.flag.to, c + v );  // フラグが0
    }
});

Deno.test({
    name: "B = 32767 - (-1)",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[B].to, 0x8000 );
        assertEquals( result2.value.flag.to, s + v + c );
    }
});

Deno.test({
    name: "B = -32768 - (-1)",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[B].to, 0x8001 );
        assertEquals( result2.value.flag.to, s + c );
    }
});

Deno.test({
    name: "D = 0xffff - 0xffff",
    fn: () => {
        let result1 = cpu.next();
        let result2 = cpu.next();
        assertEquals( result2.value.register[D].to, 0 );
        assertEquals( result2.value.flag.to, z );
    }
});
