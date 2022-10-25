    .origin 0x0
    mov a, 1
    dec a, a # => a=0, z=1
    dec a, a # => a=0xffff, c=1, s=1
    mov b, 0x7ffe
    mov c, 0xffff
    sub b, b, a  # => b=0x7fff
    sub b, b, a  # => b=0x8000, v=1, s=1
    sub b, b, a  # => b=0x8001, v=0, s=1
    sub d, a, c  # => d=0xfffe

    .dw 0xffff
    .dw 0xffff
