#!/usr/bin/ruby

ARGF.each do | line |
    printf "mem[%3d] = 0x%s;\n", ($. - 1), line.chop
end