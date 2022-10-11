class nlp16 {
    constructor() {
        this.memory = new Uint16Array(16*1024);
        this.register = new Uint16Array(16);

        this.instructions = {};
        this.instructions[0] = this.mov;
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
                } else {
                    console.log( err.message );
                    break;
                }
            }
        }
    }

    decode() {
        let ip = this.register[ 13 ]; // Instruction Pointer
        let ir0 = this.memory[ ip ];
        let ir1 = this.memory[ ip+1 ];
        let ir2 = this.memory[ ip+2 ];
        this.register[ 0 ] = ir0;
        let opcode = ir0 >> 8;
        let flag = (ir0 >> 4) & 15;
        let op1 = ir0 & 15;
        let ip_count = 1;

        // 1 word instruction
        if( opcode == 0xc0 || opcode == 0xe0 ) {
            return [ ip_count, ip, opcode, flag, this.register[13], null, null ];
        }

        // 2 or 3 words instruction
        this.register[1] = ir1;
        ip_count++;
        let op2 = (ir1 >> 12) & 15;
        let op3 = (ir1 >> 8 ) & 15;
        if( op2 == 1 ) op2 = ir1 & 255;
        else if( op2 == 2 ) {
            op2 = ir2;
            this.register[2] = ir2;
            ip_count++;
        }
        if( op3 == 1 ) op3 = ir1 & 255;
        else if( op3 == 2 ) {
            op3 = ir2;
            this.register[2] = ir2;
            ip_count++;
        }
        return [ ip_count, ip, opcode, flag, op1, op2, op3 ];
    }

    update_ip( count ) {
        this.register[ 13 ] += count;
    }

    change_ip( address ) {
        this.register[ 13 ] = address;
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
            if( err instanceof UnasignedFlagError ) {
                throw new UnasignedFlagError(err.message);
            } else throw new Error( err );
        }
        if( result ) {
            try {
                this.instructions[opcode](flag, op1,op2, op3);
            } catch( err ) {
                if( err instanceof TypeError ) {
                    throw new UnasignedInstructionError('Unasigned instruction error');
                } else throw new Error( err );
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
        let reg_flag = this.register[4];
        switch( flag ) {
            case 0: // NOP
                return false;
                break;
            case 1: // 常に実行
                return true;
                break;
            default:
                throw new UnasignedFlagError('Unasigned flag error');
        }
    }

    mov( flag, op1, op2, op3 ) {
        console.log( "mov命令" );
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

console.log("start");
let x = new nlp16();
let mem = new Uint16Array(16);

for( let i=0;i<16;i++ ) mem[i] = 0x0010;
mem[6] = 0xff1f;

console.log( mem );
x.load_binary( 0, mem, 16);
x.run(0);