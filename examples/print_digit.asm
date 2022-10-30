    .origin 0x0010
    mov sp, 0x100
    mov a, 0x11
    push a
    mov a, 3
    push a
    call @div
    #call @print_digit
    mov a, 0xffff  # ダミー
    mov a, 0xffff
    .dw 0xffff
    .dw 0xffff
# aレジスタに入っている値（0-65535）をASCIIコードに直して表示する
print_digit:
    push b
    push c
    mov c, 10000
    mov b, 60000

    ret
    .dw 0xffff
    .dw 0xffff

# (sp+2) / (sp+1) を計算し，aレジスタに商を，bレジスタに余りを返す
div:
    push c
    push d
    load c, sp + 4  # c,dレジスタをpushしているのでその分ずれている
    load d, sp + 3  # 同上
    mov a, 0
divloop:
    inc a, a
    cmp c, d
    jmp.z @just  # 割り切れた
    jmp.c @end  # 割り切れなかったが計算終了
    sub c, c, d
    jmp @divloop

end:
    dec a, a  # 足しすぎた回数(a)から1引く
    mov b, c  # 余りをbに入れる（最初からbレジスタを使えばよかった）
    pop d
    pop c
    ret

just:
    mov b, 0
    pop d
    pop c
    ret



