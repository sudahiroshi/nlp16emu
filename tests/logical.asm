    .origin 0x0
    # or
    mov a, 0
    or a, a, 0x0000  # => 0x0000, z=1
    or a, a, 0x1111  # => 0x1111
    or a, a, 0x2222  # => 0x3333
    or a, a, 0x4444  # => 0x7777
    or a, a, 0x8888  # => 0xffff, s=1

    # not
    mov a, 0
    not a, a  # => 0xffff, s=1
    not a, a  # => 0x0000, z=1
    mov a, 0xaaaa
    not a, a  # => 0x5555
    not a, a  # => 0xaaaa, s=1

    # xor
    mov a, 0xaaaa
    xor a, a, 0x5555  # => 0xffff, s=1
    xor a, a, 0xaaaa  # => 0x5555

    # and
    mov a, 0xffff
    and a, a, 0xffff  # => 0xffff, s=1
    and a, a, 0xeeee  # => 0xeeee, s=1
    and a, a, 0xcccc  # => 0xcccc, s=1
    and a, a, 0x8888  # => 0x8888, s=1
    and a, a, 0x0000  # => 0x0000, z=1

    .dw 0xffff
    .dw 0xffff
