import nlp16 from "./nlp16.js";

console.log("start");
let x = new nlp16();
let cpu;

let bin = document.querySelector('#bin');
let text = document.querySelector('#text');
let reset = document.querySelector('#reset');
let next = document.querySelector('#next');
let con = document.querySelector('#console_main');
let executable_bin;
let size;
let mem;
bin.addEventListener('change', async(ev) => {
    let file = bin.files[0];
    let reader = new FileReader();
    size = file.size;
    let data = new ArrayBuffer(size);

    reader.addEventListener('load',() => {
        executable_bin = reader.result;
        mem = new Uint16Array(executable_bin);
        console.log( mem );
        x.load_binary( 0, mem, size );
    });
    reader.readAsArrayBuffer(file);
});

text.addEventListener('change', async(ev) => {
    let file = text.files[0];
    let reader = new FileReader();
    reader.addEventListener('load', () => {
        let lines = reader.result.split('\n');
        mem = new Uint16Array( lines.length );
        let address = 0;
        for( let word of lines ) {
            mem[address] = parseInt(word, 16) & 0xffff;
            address++;
        }
        console.log(mem);
        x.load_binary( 0, mem, lines.length );
        set_memory( 0, mem, lines.length );
        console.log( x.memory );
    });
    reader.readAsText( file );
});

reset.addEventListener('click', () => {
    cpu = x.web_run(0);
});

next.addEventListener('click', () => {
    let result1 = cpu.next();
    let result2 = cpu.next();
    //console.log( {result1, result2});
    document.querySelector('#reg_0').innerText = padding(result1.value.ir1);
    document.querySelector('#reg_1').innerText = padding(result1.value.ir2);
    document.querySelector('#reg_2').innerText = padding(result1.value.ir3);
    document.querySelector('#reg_13').innerText = padding(result1.value.ip);
    if( "register" in result2.value ) {
        console.log("register: " + result2.value.register.id );
        let changed_reg = result2.value.register;
        document.querySelector('#reg_'+changed_reg.id ).innerText = padding( changed_reg.to );
        if( changed_reg.id == 9 ) {
            con.innerText += String.fromCharCode( changed_reg.to );
        }
    }

});

function padding( number ) {
    return ('000' + number.toString(16)).slice(-4);
}

function set_memory( address, mem, length ) {
    let memory = document.querySelector('#memory');

    for( let i=0; i<length; i++ ) {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        td1.classList.add('address');
        td1.innerText = padding( address+i );
        let td2 = document.createElement('td');
        td2.classList.add('mem_value');
        td2.innerText = padding(mem[i]);
        tr.appendChild(td1);
        tr.appendChild(td2);
        memory.appendChild(tr);
    }
}

// for( let i=0;i<16;i++ ) mem[i] = 0x0010;
// mem[0] = 0x0019; // mov 49 -> e
// mem[1] = 0x1031;
// mem[2] = 0x1219; // add 32 + 32 -> e
// mem[3] = 0x1120;
// mem[4] = 0x1119; // sub 32 - 32 -> e
// mem[5] = 0x1120;
// mem[6] = 0x1219; // add 32 + 4369 -> e
// mem[7] = 0x1220;
// mem[8] = 0x1111;
// mem[9] = 0x1119; // sub 4369 - 32 -> e
// mem[10] = 0x2120;
// mem[11] = 0x1111;
// mem[12] = 0x1119; // sub 32 - 4369 -> e
// mem[13] = 0x1220;
// mem[14] = 0x1111;
// mem[15] = 0x0019; // mov flag -> e
// mem[16] = 0x4000;
// mem[17] = 0x1629; // addwc 0+0 -> e
// mem[18] = 0x1100;
// mem[19] = 0xffff;

// let y = x.web_run(0);
// try {
// for( let i=0; i<20; i++ ) {
//     let result1 = y.next();
//     console.log(result1);
//     y.next();
//     console.log(x.register);
// }
// } catch( err ) {
//     console.log(err);
// }