    .origin 0x0
    mov d, 0x30
    mov a, 0x09
loop1:
    add e, d, a
    dec a, a
    jmp.nz, @loop1


    .dw 0xffff
    .dw 0xffff
