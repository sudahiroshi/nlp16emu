.origin 0x0
mov a, 0x00
mov b, 0xffff
and c, a, b  # c = a & b  => c=0, {S,Z,V,C}={0,1,0,0}
inc a, a  # a = a + 1  => a=1, {S,Z,V,C}={0,0,0,0}
inc b, b  # b = b + 1  => b=0, {S,Z,V,C}={0,1,0,1}
or c, a, b  # c = a | b  => c=1, {S,Z,V,C}={0,0,0,0}
mov a, 0x7fff
inc a, a  # a = a + 1  => c=0x8000, {S,Z,V,C}={1,0,1,0}
add c, a, b  # c = a + b  => c=0x8000, {S,Z,V,C}={1,0,0,0}
.dw 0xffff
.dw 0xffff

