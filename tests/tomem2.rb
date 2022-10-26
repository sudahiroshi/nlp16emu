#!/usr/bin/ruby

ARGF.each do | line |
    printf "0x%s,\n", line.chop
end
