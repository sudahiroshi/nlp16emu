.origin 0x0
mov a, 1
add a, a, 2
add b, a, 32767
add c, a, 0xffff
mov a, 0xfffe
add d, a, 0xffff
add c, a, 0xf000
add c, a, 2
add c, a, a
inc a, d
inc a, a
incc a, a
incc a, a
.dw 0xffff
