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
let mem_addr, mem_data;
let old_addr = [ 0, 0 ];

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
        mem_addr = document.querySelectorAll('.address');
        mem_data = document.querySelectorAll('.mem_value');
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
        mem_addr = document.querySelectorAll('.address');
        mem_data = document.querySelectorAll('.mem_value');
    });
    reader.readAsText( file );
});

reset.addEventListener('click', () => {
    cpu = x.web_run(0);
});

next.addEventListener('click', () => {
    let result1, result2;
    try {
        result1 = cpu.next();
        result2 = cpu.next();
        //console.log( {result1, result2});
        document.querySelector('#reg_0').innerText = padding(result1.value.ir1);
        document.querySelector('#reg_1').innerText = padding(result1.value.ir2);
        document.querySelector('#reg_2').innerText = padding(result1.value.ir3);
        document.querySelector('#reg_13').innerText = padding(result1.value.ip);
        let ip = result1.value.ip;
        let ip_count = result1.value.ip_count;
        for( let add = old_addr[0]; add<old_addr[0]+old_addr[1]; add++ ) {
            mem_addr[ add ].classList.remove( 'exec' );
            mem_data[ add ].classList.remove( 'exec' );
        }
        old_addr = [ ip, ip_count ];
        for( let add = ip; add<ip + ip_count; add++ ) {
            mem_addr[ add ].classList.add( 'exec' );
            mem_data[ add ].classList.add( 'exec' );
        }
        if( "register" in result2.value ) {
            for( let elm of document.querySelectorAll('.reg_value') ) {
                elm.classList.remove('exec');
            }
            for( let reg of result2.value["register"] ) {
                let reg_element = document.querySelector('#reg_'+reg.id );
                reg_element.innerText = padding( reg.to );
                reg_element.classList.add('exec');
                if( reg.id == 9 ) {
                    con.innerText += String.fromCharCode( reg.to );
                }
            }
        }
        if( "flag" in result2.value ) {
            let flag = result2.value["flag"]["to"];
            if( flag & 8 ){

                document.querySelector('#flag_s').classList.add('indicator_on');
            } 
            else {
                document.querySelector('#flag_s').classList.remove('indicator_on');
            }
            if( flag & 4 ) document.querySelector('#flag_z').classList.add('indicator_on');
            else document.querySelector('#flag_z').classList.remove('indicator_on');
            if( flag & 2 ) document.querySelector('#flag_v').classList.add('indicator_on');
            else document.querySelector('#flag_v').classList.remove('indicator_on');
            if( flag & 1 ) document.querySelector('#flag_c').classList.add('indicator_on');
            else document.querySelector('#flag_c').classList.remove('indicator_on');
        }
    } catch( err ) {
        console.log( err );
        console.log( {result1, result2 });
    }
});

function padding( number ) {
    return ('000' + number.toString(16)).slice(-4);
}

function set_memory( address, mem, length ) {
    let memory = document.querySelector('#memory_view1');

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
