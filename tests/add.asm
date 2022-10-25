    .origin 0x0
    add a, 0, 0
    inc a, a
    mov b, 0x7ffe
    mov c, 0xffff
    add b, a, b  # => b=0x7fff
    add b, a, b  # => b=0x8000, v=1, s=1
    add b, a, b  # => b=0x8001, v=0, s=1
    add d, a, c  # => d=0, c=1, z=1

    .dw 0xffff
    .dw 0xffff
