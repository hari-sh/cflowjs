from comments import source_code
import re

matchstr = re.compile('[\w\s\*]+\w+\s*' + '\([\w\s\*\,]*\)' + '\s*\{')

def parseName(combl):
    x = re.search(matchstr, combl)
    if x:
        start, end = x.regs[0]
        funName = combl[start:end].split('(')[0].split()[-1]
        return funName
    


def gen_content(fname):
    parser = source_code
    charnum = 1
    yield '\n'
    while True:
        character = fname.read(1)
        if not character:
            global eof
            eof = True
            return
        if character == '\n':
            lnos.append(charnum + 1)
        parser, text = parser(character)
        charnum = charnum + len(text)
        yield text
        if parser is None:
            break

def remove_comments(src, dest):   
    with open(src, 'r') as fname, open(dest, 'w') as temp:
        global cline
        global counter
        global lnos
        counter = 1
        while True:
            lnos = [1]
            gotstr = gen_content(fname)
            cline = ''.join(gotstr)
            print(parseName(cline))
            lnos.append(len(cline))
            clinspt = ''.join(linesplit(cline, lnos, counter))
            counter = counter + len(lnos) - 2
            # temp.write(clinspt)
            if eof == True:
                break

eof = False
remove_comments('parfun/src/memmgr.c', 'temp.c')
