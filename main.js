import nlp16 from "./modules/nlp16.js";

console.log("start");
let x = new nlp16();
let mem = new Uint16Array(32);

for( let i=0;i<16;i++ ) mem[i] = 0x0010;
mem[0] = 0x0019; // mov 49 -> e
mem[1] = 0x1031;
mem[2] = 0x1219; // add 32 + 32 -> e
mem[3] = 0x1120;
mem[4] = 0x1119; // sub 32 - 32 -> e
mem[5] = 0x1120;
mem[6] = 0x1219; // add 32 + 4369 -> e
mem[7] = 0x1220;
mem[8] = 0x1111;
mem[9] = 0x1119; // sub 4369 - 32 -> e
mem[10] = 0x2120;
mem[11] = 0x1111;
mem[12] = 0x1119; // sub 32 - 4369 -> e
mem[13] = 0x1220;
mem[14] = 0x1111;
mem[15] = 0x0019; // mov flag -> e
mem[16] = 0x4000;
mem[17] = 0x1629; // addwc 0+0 -> e
mem[18] = 0x1100;
mem[19] = 0xffff;

console.log( mem );
x.load_binary( 0, mem, 32);
//x.run(0);
let y = x.web_run(0);
try {
for( let i=0; i<20; i++ ) {
    let result1 = y.next();
    console.log(result1);
    y.next();
    console.log(x.register);
}
} catch( err ) {
    console.log(err);
}