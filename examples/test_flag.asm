.origin 0x0
mov a, 1
add a, a, 2  # a = a + 2  => a=3, {S,Z,V,C}={0,0,0,0}
add b, a, 32767  # b = a + 0x7fff  => b=0x8002, {S,Z,V,C}={1,0,1,0}
add c, a, 0xffff  # c = a + 0xffff  => c=2, {S,Z,V,C}={0,0,0,1}
mov a, 0xfffe
add d, a, 0xffff  # d = a + 0xffff  => d=0xfffd, {S,Z,V,C}={1,0,0,1}
add c, a, 0xf000  # c = a + 0xf000  => c=0xeffe, {S,Z,V,C}={1,0,0,1}
add c, a, 2  # c = a + 2  => c=0, {S,Z,V,C}={0,1,0,1}
add c, a, a  # c = a + a  => c=0xfffc, {S,Z,V,C}={1,0,0,1}
inc a, d  # a = d + 1  => a=0xfffe, {S,Z,V,C}={1,0,0,0}
inc a, a  # a = a + 1  => a=0xffff, {S,Z,V,C}={1,0,0,0}
incc a, a  # a = a + 1 + cf  => a=0, {S,Z,V,C}={0,1,0,1}
incc a, a  # a = a + 1 + cf  => a=2, {S,Z,V,C}={0,0,0,0}
.dw 0xffff
