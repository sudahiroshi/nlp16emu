class nlp16 {
    constructor() {
        this.memory = new Uint16Array(16*1024);
        this.register = new Uint16Array(16);
        
        this.instructions = new Array(256);
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
            let [ ip_count, opcode, flag, op1, op2, op3 ] = this.decode();
            this.update_ip( ip_count );
            this.exec( opcode, flag, op1, op2, op3 );
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
            return [ ip_count, opcode, flag, this.register[13], null, null ];
        }

        // 2 or 3 words instruction
        ip_count++;
        let op2 = (ir1 >> 12) & 15;
        let op3 = (ir1 >> 8 ) & 15;
        if( op2 == 1 ) op2 = ir1 & 255;
        else if( op2 == 2 ) {
            op2 = ir2;
            ip_count++;
        }
        if( op3 == 1 ) op3 = ir1 & 255;
        else if( op3 == 2 ) {
            op3 = ir2;
            ip_count++;
        }
        return [ ip_count, opcode, flag, op1, op2, op3 ];
    }

    update_ip( count ) {
        this.register[ 13 ] += count;
    }

    change_ip( address ) {
        this.register[ 13 ] = address;
    }

    /**
     * 
     * @param {number} opcode 実行する命令
     * @param {number} flag 実行条件
     * @param {number} op1 オペランド1（たいていはdestination）
     * @param {number} op2 オペランド2
     * @param {number} op3 オペランド3（存在しない場合はnull）
     */
    exec( opcode, flag, op1, op2, op3 ) {
        if( this.check_flag(flag)) {
            this.instructions[opcode](flag, op1,op2, op3);
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
        if( flag == 1 ) return true;
        if( flag == 0 ) return false;
    }

    mov( flag, op1, op2, op3 ) {
        console.log( "mov命令" );
    }
}