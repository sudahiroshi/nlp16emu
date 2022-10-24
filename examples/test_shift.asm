.origin 0x0
mov a, 0x01
sll a, 2  # => a=4
or a, a, 0x01  # => a=5
sll a, 2  # => a=
or a, a, 0x01
sll a, 2
or a, a, 0x01
sll a, 2
or a, a, 0x01  # => a=0x9249
mov b, a
mov c, a
mov d, a
slr a, 1  # => a=0x4924
slr b, 2  # =>
slr c, 3  # =>

mov a, d
mov b, d
mov c, d
sar a, 1
sar b, 2
sar c, 3

mov a, d
mov b, d
mov c, d
sal a, 1
sal b, 2
sal c, 3

mov a, d
mov b, d
mov c, d
ror a, 1
ror b, 2
ror c, 3

mov a, d
mov b, d
mov c, d
rol a, 1
rol b, 2
rol c, 3

.dw 0xffff
.dw 0xffff

