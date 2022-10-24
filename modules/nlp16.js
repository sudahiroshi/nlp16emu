/**
 * NLP-16 CPUエミュレータ本体
 */
export default class nlp16 {
    /**
     * コンストラクタ
     * メモリ領域の取得，レジスタの配置，命令セットの定義
     */
    constructor() {
        /**
         * メモリ
         * @type {Array}
         */
        this.memory = new Uint16Array(16*1024);
        /**
         * レジスタ
         * @type {Array}
         */
        this.register = new Uint16Array(16);

        /**
         * class内で使用するレジスタ名とレジスタ番号の対応
         * @type {Number}
         */
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

        /**
         * class内で使用するフラグ名とビットの対応
         * @type {Number}
         */
        this.flag_c = 1;
        this.flag_v = 2;
        this.flag_z = 4;
        this.flag_s = 8;

        /**
         * 命令を実行することによって変更されるレジスタ・メモリ
         */
        this.changes = {};
        this.changes[ "register" ] = [];

        this.define_instructions();
    }
    /**
     * 命令セットの定義
     */
    define_instructions() {
        this.instructions = {};
        let op_mov = ( flag, op1, op2, op3 ) => {
            console.log({flag, op1, op2, op3})
            try {
                this.store_register( op1, op2 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0] = op_mov;

        let op_add = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 + op3;
                // 負数+負数->正数 または 正数+正数->負数 のときSフラグが立つ
                if(
                    ((op2>0x8000)&&(op3>0x8000)&&(result<0x8000)) ||
                    ((op2<0x8000)&&(op3<0x8000)&&(result>=0x8000)) ) {
                    new_flag |= this.flag_v;
                }
                // 17bit目に1が立つときCフラグが立つ
                if( result & 0x10000 )  new_flag |= this.flag_c;
                result &= 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[18] = op_add;

        let op_sub = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let neg_op3 = -op3;
                let result = op2 + neg_op3;
                // 負数+負数->正数 または 正数+正数->負数 のときSフラグが立つ
                if(
                    ((op2>0x8000)&&(neg_op3>0x8000)&&(result<0x8000)) ||
                    ((op2<0x8000)&&(neg_op3<0x8000)&&(result>=0x8000)) ) {
                    new_flag |= this.flag_v;
                }
                // 17bit目に1が立つときCフラグが立つ
                if( result & 0x10000 )  new_flag |= this.flag_c;
                result &= 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[17] = op_sub;

        let op_addc = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 + op3;
                if( flag & this.flag_c ) result += 1;
                // 負数+負数->正数 または 正数+正数->負数 のときSフラグが立つ
                if(
                    ((op2>0x8000)&&(op3>0x8000)&&(result<0x8000)) ||
                    ((op2<0x8000)&&(op3<0x8000)&&(result>=0x8000)) ) {
                    new_flag |= this.flag_v;
                }
                // 17bit目に1が立つときCフラグが立つ
                if( result & 0x10000 )  new_flag |= this.flag_c;
                result &= 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[22] = op_addc;

        let op_subc = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let neg_op3 = -op3;
                let result = op2 + neg_op3;
                if( flag & this.flag_c ) result -= 1;
                // 負数+負数->正数 または 正数+正数->負数 のときSフラグが立つ
                if(
                    ((op2>0x8000)&&(neg_op3>0x8000)&&(result<0x8000)) ||
                    ((op2<0x8000)&&(neg_op3<0x8000)&&(result>=0x8000)) ) {
                    new_flag |= this.flag_v;
                }
                // 17bit目に1が立つときCフラグが立つ
                if( result & 0x10000 )  new_flag |= this.flag_c;
                result &= 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[21] = op_subc;

        let op_or = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 | op3;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[10] = op_or;

        let op_not = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = (~op2) & 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[12] = op_not;

        let op_xor = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 ^ op3;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[14] = op_xor;

        let op_and = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 & op3;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[6] = op_and;

        let op_inc = ( flag, op1, op2, op3 ) => {
            try {
                op_add( flag, op1, op2, 1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[27] = op_inc;

        let op_dec = ( flag, op1, op2, op3 ) => {
            try {
                op_sub( flag, op1, op2, 1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[24] = op_dec;

        let op_incc = ( flag, op1, op2, op3 ) => {
            try {
                op_addc( flag, op1, op2, 1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[31] = op_incc;

        let op_decc = ( flag, op1, op2, op3 ) => {
            try {
                op_subc( flag, op1, op2, 1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[28] = op_decc;

        let op_slr = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 >> 1;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x28] = op_slr;

        let op_sll = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = (op2 << 1) & 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x20] = op_sar;

        let op_sar = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = op2 >> 1;
                result |= op2 & 0x8000;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x2c] = op_sar;

        let op_sal = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = (op2 << 1) | (op2 & 0x8000) & 0xffff;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x24] = op_sal;

        let op_ror = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = (op2 >> 1);
                if( op2 & 1 ) result |= 0x8000;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x2a] = op_ror;

        let op_rol = ( flag, op1, op2, op3 ) => {
            try {
                let new_flag = 0;
                let result = (op2 << 1) & 0x8000;
                if( op2 & 0x8000 ) result |= 1;
                if( result >= 0x8000 )  new_flag |= this.flag_s;
                if( result == 0 )    new_flag |= this.flag_z;
                this.store_register( op1, result );
                this.store_flag( flag, new_flag );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x22] = op_rol;

        let op_push = ( flag, op1, op2, op3 ) => {
            try {
                let result = this.register[ this.sp ] - 1;
                this.store_register( this.sp, result );
                this.store_memory( result, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0xd0] = op_push;

        let op_pop = ( flag, op1, op2, op3 ) => {
            try {
                let result1 = this.memory[ this.register[ this.sp ] ];
                this.store_register( op1, result1 );
                let result2 = this.register[ this.sp ] + 1;
                this.store_register( this.sp, result2 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0xd0] = op_push;

        let op_call = ( flag, op1, op2, op3 ) => {
            try {
                let new_sp = this.register[ this.sp ] - 1;
                this.store_register( this.sp, new_sp );
                this.store_memory( this.register[ this.sp ], this.ip );
                this.store_register( this.ip, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0xb0] = op_call;

        let op_calladd = ( flag, op1, op2, op3 ) => {
            try {
                let new_sp = this.register[ this.sp ] - 1;
                this.store_register( this.sp, new_sp );
                this.store_memory( this.register[ this.sp ], this.ip );
                let result = op2 + op3;
                this.store_register( this.ip, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0xba] = op_calladd;

        let op_callsub = ( flag, op1, op2, op3 ) => {
            try {
                let new_sp = this.register[ this.sp ] - 1;
                this.store_register( this.sp, new_sp );
                this.store_memory( this.register[ this.sp ], this.ip );
                let result = op1 + op2;
                this.store_register( this.ip, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0xb9] = op_callsub;

        let ret = ( flag, op1, op2, op3 ) => {
            try {
                let new_ip = this.memory( this.register[ this.sp ] );
                let new_sp = this.register[ this.sp ] + 1;
                this.store_register( this.sp, new_sp );
                this.store_register( this.ip, new_ip );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0xc0] = op_ret;
        this.instructions[0xe0] = op_ret;   // reti

        let op_load = ( flag, op1, op2, op3 ) => {
            try {
                let result1 = this.memory[ op2 ];
                this.store_register( op1, result1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x80] = op_load;

        let op_loadadd = ( flag, op1, op2, op3 ) => {
            try {
                let result1 = this.memory[ op2 + op3 ];
                this.store_register( op1, result1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x8a] = op_loadadd;

        let op_loadsub = ( flag, op1, op2, op3 ) => {
            try {
                let result1 = this.memory[ op2 - op3 ];
                this.store_register( op1, result1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x89] = op_loadsub;

        let op_store = ( flag, op1, op2, op3 ) => {
            try {
                this.store_memory( op2, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x90] = op_store;

        let op_storeadd = ( flag, op1, op2, op3 ) => {
            try {
                let result1 = op2 + op3;
                this.store_memory( result, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x9a] = op_storeadd;

        let op_storesub = ( flag, op1, op2, op3 ) => {
            try {
                let result1 = op2 - op3;
                this.store_memory( result, op1 );
            } catch( err ) {
                throw err;
            }
        }
        this.instructions[0x99] = op_storesub;
    }

    /**
     * プログラムのロード
     * @param {Number} address ロードするアドレス
     * @param {Uint16Array} data ロードするデータ
     * @param {Number} size ロードするサイズ
     */
    load_binary( address, data, size ) {
        for( let i=0; i<size; i++ ) {
            this.memory[ address + i ] = data[ i ];
        }
    }

    /**
     * プログラムの実行
     * @param {Number} address 実行開始するアドレス
     */
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

    /**
     * 外部で制御しながらプログラムを実行する
     * @param {Number} address エントリーポイントのアドレス
     */
    *web_run( address ) {
        this.change_ip( address );
        while(true) {
            this.changes = {};
            this.changes[ "register" ] = [];
            let [ ip_count, ip, opcode, flag, op1, op2, op3, ir1, ir2, ir3 ] = this.decode();
            yield { ip_count, ip, opcode, flag, op1, op2, op3, ir1, ir2, ir3 };
            this.update_ip( ip_count );
            try {
                this.exec( opcode, flag, op1, op2, op3 );
                yield this.changes;
            } catch( err ) {
                throw err;
            }

        }
    }

    /**
     * 命令をデコードする
     * @returns 配列内に以下の情報が入っている
     * ip_count 命令のワード数
     * ip 次に実行するアドレス
     * opcode 実行する命令
     * flag 現在のフラグ
     * op1 結果を代入するレジスタ（1word命令だと異なる場合アリ）
     * op2 値（レジスタ/アドレスが指定されていても値が返される）
     * op3 値（レジスタ/アドレスが指定されていても値が返される）
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

        // 1 word instruction POP(RET) / PUSH / RETI
        if( opcode == 0xc0 || opcode == 0xd0 || opcode == 0xe0 ) {
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
        return [ ip_count, ip, opcode, flag, op1, op2, op3, ir1, ir2, ir3 ];
    }

    /**
     * IPレジスタにcountを足す（更新する）
     * @param {Number} count 
     */
    update_ip( count ) {
        this.store_register( this.reg_ip, this.register[this.reg_ip] + count );
    }

    /**
     * IPレジスタにaddressを代入する
     * @param {Number} address 
     */
    change_ip( address ) {
        this.store_register( this.reg_ip, address );
    }

    /**
     * 実行条件をチェックして命令を実行する
     * @param {Number} opcode 実行する命令
     * @param {Number} flag 実行条件
     * @param {Number} op1 オペランド1（たいていはdestination）
     * @param {Number} op2 オペランド2
     * @param {Number} op3 オペランド3（存在しない場合はnull）
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
     * 命令内のフラグ領域が実行条件と合致するか調べる
     * @param {Number} flag 実行条件
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

    /**
     * レジスタに値を代入し，this.changesに反映させる
     * 代入できないレジスタの場合はErrorを投げる
     * @param {Number} register レジスタID
     * @param {Number} value 代入する値
     */
    store_register( register, value ) {
        let from = this.register[ register ];
        value &= 0xffff;
        switch( register ) {
            case this.reg_ir1:
            case this.reg_ir2:
            case this.reg_ir3:
                throw new IllegalRegisterError('IR1-3に書き込もうとしました');
                break;
            case this.reg_iv:
                this.changes[ "register" ].push( { id: register, from: from, to: value } );
                this.register[ this.reg_iv ] = value;
                break;
            case this.reg_4:
                throw new IllegalRegisterError('Flagに書き込もうとしました');
                break;
            case this.reg_a:
            case this.reg_b:
            case this.reg_c:
            case this.reg_d:
                this.changes[ "register" ].push( { id: register, from: from, to: value } );
                this.register[ register ] = value;
                break;
            case this.reg_e:
                console.log( "e: " + (value & 0xff ));
                this.changes[ "register" ].push( { id: register, from: from, to: value } );
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
                this.changes[ "register" ].push( { id: register, from: from, to: value } );
                this.register[ register ] = value;
                break;
            case this.reg_sp:
                this.changes[ "register" ].push( { id: register, from: from, to: value } );
                this.register[ register ] = value;
                break;
            case this.reg_zero:
                break;
            default:
                throw new IllegalRegisterError('レジスタ名が異常です\nregister_id: ' + register );
        }
    }

    /**
     * フラグを変更し，変更前の情報とともにthis.changesに反映させる
     * @param {Number} old 
     * @param {Number} value 
     */
    store_flag( old, value ) {
        console.log( {value})
        this.register[ this.reg_flag ] = value;
        this.changes[ "register" ].push( { id: this.reg_flag, from: old, to: value } );
        this.changes[ "flag" ] = { id: this.reg_flag, from: old, to: value };
    }

    /**
     * メモリの内容を変更し，変更前の情報とともにthis.changesに反映させる
     * @param {Number} address 
     * @param {Number} value 
     */
    store_memory( address, value ) {
        let from = this.address[ address ];
        this.address[ address ] = value;
        this.changes[ "memory" ] = { address: address, from: from, to: value };
    }
}

/**
 * 未定義命令エラー
 */
class UnasignedInstructionError extends Error {
    constructor(...params) {
        super(...params);
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, UnasignedInstructionError)
        }
        this.name = 'UnasignedInstructionError';
    }
}

/**
 * 未定義実行時フラグエラー
 */
class UnasignedFlagError extends Error {
    constructor(...params) {
        super(...params);
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, UnasignedFlagError)
        }
        this.name = 'UnasignedFlagError';
    }
}

/**
 * レジスタエラー
 */
class IllegalRegisterError extends Error {
    constructor(...params) {
        super(...params);
        if(Error.captureStackTrace) {
            Error.captureStackTrace(this, IllegalRegisterError)
        }
        this.name = 'IllegalRegisterError';
    }
}

