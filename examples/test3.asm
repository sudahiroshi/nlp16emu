.origin 0x0
mov a, 0x00
mov b, 0xffff
and c, a, b
inc a, a
inc b, b
or c, a, b
mov a, 0x7fff
inc a, a
add c, a, b
.dw 0xffff
.dw 0xffff

