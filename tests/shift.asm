    .origin 0x0
    # slr
    mov a, 0x8000
    slr a, a  # => a=0x4000
    slr a, a  # => a=0x2000
    slr a, a  # => a=0x1000
    mov a, 1
    slr a, a  # => a=0, z=1

    # sll
    mov a, 1
    sll a, a  # => a=2
    sll a, a  # => a=4
    mov a, 0x4000
    sll a, a  # => a=0x8000, s=1
    sll a, a  # => a=0

    # sar
    mov a, 0x8000
    slr a, a  # => a=0xc000, s=1
    slr a, a  # => a=0xe000, s=1
    slr a, a  # => a=0xf000, s=1
    mov a, 1
    slr a, a  # => a=0, z=1

    # sal
    mov a, 1
    sal a, a  # => a=2
    sal a, a  # => a=4
    mov a, 0x4000
    sal a, a  # => a=0x8000, s=1
    sal a, a  # => a=0  
    mov a, 0x8001
    sal a, a  # => a=0x8002
    sal a, a  # => a=0x8004

    # ror
    mov a, 0x8888
    ror a, a  # => a=0x4444
    ror a, a  # => a=0x2222
    ror a, a  # => a=0x1111
    ror a, a  # => a=0x8888

    # rol
    mov a, 0x8888
    rol a, a  # => a=0x1111
    rol a, a  # => a=0x2222
    rol a, a  # => a=0x4444
    rol a, a  # => a=0x8888

    .dw 0xffff
    .dw 0xffff
