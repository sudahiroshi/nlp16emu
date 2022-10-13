class nlp16 {
    constructor() {
        this.memory = new Uint16Array(16*1024);
        this.register = new Uint16Array(16);

        this.reg_ir1 = 0;
        this.reg_ir2 = 1;
        this.reg_ir3 = 2;
        this.reg_iv = 3;
        this.reg_flag = 4;
        this.reg_a = 5;
        this.reg_b = 6;
        this.reg_c = 7;
        this.reg_d = 8;
        this.reg_e = 9;
        this.reg_mem = 10;
        this.reg_bank = 11;
        this.reg_address = 12;
        this.reg_ip = 13;
        this.reg_sp = 14;
        this.reg_zero = 15;

        this.flag_c = 1;
        this.flag_v = 2;
        this.flag_z = 4;
        this.flag_s = 8;

        this.define_instructions();
    }
    define_instructions() {
        this.instructions = {};
        let mov = ( flag, op1, op2, op3 ) => {
            console.log({flag, op1, op2, op3})
            try {
                this.store_register( op1, op2 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0] = mov;

        let add = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 + op3;
                if( result > 0xffff ) {
                    result &= 0xffff;
                    new_flag |= this.flag_c | this.flag_v;
                }
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag = this.flag_z;
                this.store_register( op1, result );
                this.store_flag( new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[18] = add;

        let sub = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 - op3;
                if( result < 0 ) {
                    result &= 0xffff;
                    new_flag |= this.flag_c | this.flag_v;
                }
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag = this.flag_z;
                this.store_register( op1, result );
                this.store_flag( new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[17] = sub;

        let addwc = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 + op3;
                if( flag & this.flag_c ) result += 1;
                if( result > 0xffff ) {
                    result &= 0xffff;
                    new_flag |= this.flag_c | this.flag_v;
                }
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag = this.flag_z;
                this.store_register( op1, result );
                this.store_flag( new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[22] = addwc;

        let subwc = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 - op3;
                if( flag & this.flag_c ) result -= 1;
                if( result < 0 ) {
                    result &= 0xffff;
                    new_flag |= this.flag_c | this.flag_v;
                }
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag = this.flag_z;
                this.store_register( op1, result );
                this.store_flag( new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[21] = subwc;
    }
    /**
     * プログラムのロード
     * @param {number} address ロードするアドレス
     * @param {Uint16Array} data ロードするデータ
     * @param {number} size ロードするサイズ
     */
    load_binary( address, data, size ) {
        for( let i=0; i<size; i++ ) {
            this.memory[ address + i ] = data[ i ];
        }
    }

    run( address ) {
        this.change_ip( address );
        while(true) {
            let [ ip_count, ip, opcode, flag, op1, op2, op3 ] = this.decode();
            this.update_ip( ip_count );
            try {
                console.log( {ip, opcode, flag, op1, op2, op3})
                this.exec( opcode, flag, op1, op2, op3 );
            } catch( err ) {
                if( err instanceof UnasignedInstructionError ) {
                    console.log(err.message);
                    console.log("Operation Code: " + opcode.toString(16) + ", flag: " + flag.toString(16) + ", Op1:" + op1.toString(16) + " in address: " + ip.toString(16) );
                    break;
                } else if( err instanceof UnasignedFlagError ) {
                    console.log(err.message);
                    console.log("Operation Code: " + opcode.toString(16) + ", flag: " + flag.toString(16) + ", Op1:" + op1.toString(16) + " in address: " + ip.toString(16) );
                    break;
                } else if( err instanceof IllegalRegisterError ) {
                    console.log(err.message);
                    console.log("Operation Code: " + opcode.toString(16) + ", flag: " + flag.toString(16) + ", Op1:" + op1.toString(16) + " in address: " + ip.toString(16) );
                    break;
                } else {
                    console.log( err.message );
                    break;
                }
            }
        }
    }

    *web_run( address ) {
        this.change_ip( address );
        while(true) {
            let [ ip_count, ip, opcode, flag, op1, op2, op3 ] = this.decode();
            yield { ip_count, ip, opcode, flag, op1, op2, op3 };
            this.update_ip( ip_count );
            try {
                this.exec( opcode, flag, op1, op2, op3 );
                yield;
            } catch( err ) {
                throw err;
            }

        }
    }

    /**
     * 命令をデコードする
     * @returns op2, op3は，値を返している
     */
    decode() {
        let ip = this.register[ this.reg_ip ]; // Instruction Pointer
        let ir1 = this.memory[ ip ];
        let ir2 = this.memory[ ip+1 ];
        let ir3 = this.memory[ ip+2 ];
        this.register[ this.reg_ir1 ] = ir1;
        let opcode = ir1 >> 8;
        let flag = (ir1 >> 4) & 15;
        let op1 = ir1 & 15;
        let ip_count = 1;

        // 1 word instruction
        if( opcode == 0xc0 || opcode == 0xe0 ) {
            return [ ip_count, ip, opcode, flag, this.register[this.reg_ip], null, null ];
        }

        // 2 or 3 words instruction
        this.register[this.reg_ir2] = ir2 & 255;
        ip_count++;
        let op2 = (ir2 >> 12) & 15;
        let op3 = (ir2 >> 8 ) & 15;
        if( op2 == 1 ) op2 = ir2 & 255;
        else if( op2 == 2 ) {
            op2 = ir3;
            this.register[this.reg_ir3] = ir3;
            ip_count++;
        } else {
            op2 = this.register[op2];
        }
        if( op3 == 1 ) op3 = ir2 & 255;
        else if( op3 == 2 ) {
            op3 = ir3;
            this.register[this.reg_ir3] = ir3;
            ip_count++;
        } else {
            op3 = this.register[op3];
        }
        return [ ip_count, ip, opcode, flag, op1, op2, op3 ];
    }

    update_ip( count ) {
        this.store_register( this.reg_ip, this.register[this.reg_ip] + count );
    }

    change_ip( address ) {
        this.store_register( this.reg_ip, address );
    }

    /**
     * 実行条件をチェックして命令を実行します
     * @param {number} opcode 実行する命令
     * @param {number} flag 実行条件
     * @param {number} op1 オペランド1（たいていはdestination）
     * @param {number} op2 オペランド2
     * @param {number} op3 オペランド3（存在しない場合はnull）
     */
    exec( opcode, flag, op1, op2, op3 ) {
        let result = true;
        try {
            result = this.check_flag(flag);
        } catch( err ) {
            throw err;
        }
        if( result ) {
            try {
                this.instructions[opcode](this.register[this.reg_flag], op1, op2, op3);
            } catch( err ) {
                if( err instanceof TypeError ) {
                    throw new UnasignedInstructionError('Unasigned instruction error');
                } else throw err;
            }
        } else {
            console.log("skiped");
        }
    }

    /**
     * フラグが実行条件と合致するか調べる
     * @param {number} flag 実行条件
     * @return {boolean} 実行するか（する場合true）
     */
    check_flag( flag ) {
        let reg_flag = this.register[ this.reg_flag ];
        switch( flag ) {
            case 0: // NOP
                return false;
                break;
            case 2: // C==1?
                return (reg_flag & this.flag_c) != 0;
                break;
            case 4: // V==1?
                return (reg_flag & this.flag_v) != 0;
                break;
            case 6: // Z==1?
                return (reg_flag & this.flag_z) != 0;
                break;
            case 8: // S==1?
                return (reg_flag & this.flag_s) != 0;
                break;
            case 1: // 常に実行
                return true;
                break;
            case 3: // C==0?
                return (reg_flag & this.flag_c) == 0;
                break;
            case 5: // V==0?
                return (reg_flag & this.flag_v) == 0;
                break;
            case 7: // Z==0?
                return (reg_flag & this.flag_z) == 0;
                break;
            case 9: // S==0?
                return (reg_flag & this.flag_s) == 0;
                break;
            default:
                throw new UnasignedFlagError('Unasigned flag error');
        }
    }

    store_register( register, value ) {
        value &= 0xffff;
        switch( register ) {
            case this.reg_ir1:
            case this.reg_ir2:
            case this.reg_ir3:
                throw new IllegalRegisterError('IR1-3に書き込もうとしました');
                break;
            case this.reg_iv:
                this.register[ this.reg_iv ] = value;
                break;
            case this.reg_4:
                throw new IllegalRegisterError('Flagに書き込もうとしました');
                break;
            case this.reg_a:
            case this.reg_b:
            case this.reg_c:
            case this.reg_d:
                this.register[ register ] = value;
                break;
            case this.reg_e:
                console.log( "e: " + (value & 0xff ));
                this.register[ register ] = (value & 0xff );
                break;
            case this.reg_mem:
                // 一旦bankを無視します．
                this.memory[ this.register[ this.reg_address ] ] = value;
                this.register[ register ] = value;
                break;
            case this.reg_bank:
            case this.reg_address:
                this.register[ register ] = value;
                break;
            case this.reg_ip:
                this.register[ register ] = value;
                break;
            case this.reg_sp:
                this.register[ register ] = value;
                break;
            case this.reg_zero:
                break;
            default:
                throw new IllegalRegisterError('レジスタ名が異常です\nregister_id: ' + register );
        }
    }
    store_flag( value ) {
        console.log( {value})
        this.register[ this.reg_flag ] = value;
    }

    mov( flag, op1, op2, op3 ) {
        console.log(op2);
        console.log(this);
        console.log( this.register);
        try {
        let value = this.register[ op2 ];
        console.log( {op1, op2, value })
        this.store_register( op1, this.register[ op2 ] );
        console.log( "mov命令" );
        } catch( err ) {
            console.log(err);
            throw err;
        }
    }
}

class UnasignedInstructionError extends Error {
    constructor(...params) {
        super(...params);
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, UnasignedInstructionError)
        }
        this.name = 'UnasignedInstructionError';
    }
}

class UnasignedFlagError extends Error {
    constructor(...params) {
        super(...params);
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, UnasignedFlagError)
        }
        this.name = 'UnasignedFlagError';
    }
}

class IllegalRegisterError extends Error {
    constructor(...params) {
        super(...params);
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, IllegalRegisterError)
        }
        this.name = 'IllegalRegisterError';
    }
}

console.log("start");
let x = new nlp16();
//x.setup();
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