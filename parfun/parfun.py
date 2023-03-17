import re
import os

# matchstr = re.compile('(\w+\s+)*' + '\w+\s*\*?' + '\s*\w+' + '\([\w\s\*\,]*\)' + '\s*\{')
# matchstr = re.compile('(\w+\s+)*\w+' + '\s*\*?\s*' + '\w+\s*' + '\([\w\s\*\,]*\)' + '\s*\{')
matchstr = re.compile('[\w\s\*]+\w+\s*' + '\([\w\s\*\,]*\)' + '\s*\{')
combl = ""
srcfile = "parfun/src/memmgr.c"
funName = ""
with open(srcfile, 'r') as src, open("parfun/temp.c", 'w') as temp:
    for idx, line in enumerate(src):
        if(re.search(';', line)):
            combl = combl + line
            parseName(combl);
            combl = ""
        else:
            combl = combl + line.rstrip()


def parseName(combl):
    x = re.search(matchstr, combl)
    if x:
        start, end = x.regs[0]
        funName = combl[start:end].split('(')[0].split()[-1]
        return funName
    