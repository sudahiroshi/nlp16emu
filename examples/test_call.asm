    .origin 0x0
    mov sp, 0x100
    mov a, 0x09
loop1:
    call @print
    dec a, a
    jmp.nz, @loop1
    .dw 0xffff
    .dw 0xffff
# aレジスタに入っている値（0-9）をASCIIコードに直して表示する
print:
    add e, a, 0x30
    ret
    .dw 0xffff
    .dw 0xffff


