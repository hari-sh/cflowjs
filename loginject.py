import re
import os
from fnmatch import fnmatch

defaulters = ['fun1', 'fun2']
root = r'/home/rana'
matchstr = re.compile('[\w+\s+]*' '\w+[\s\*]+' + '\s*\w+\s*' + '\([\w\s\*\,\[\]]*\)' + '\s*\{')
keywords = ['if', 'for', 'while', 'switch', 'PACK']
class FunParse:
    def __init__(self, name, mode):
        self.name = name
        self.mode = mode

def source_code(char):
    if char == '/':
        return comment_begin, ''
    elif char == ';' or char == '{' or char == '}':
        return None, char
    return source_code, char

def comment_begin(char):
    if char == '/':
        return inline_comment, ''
    if char == '*':
        return block_comment, ''
    return source_code, '/'+char

def inline_comment(char):
    if char == '\n':
        return source_code, char
    return inline_comment, ''

def block_comment(char):
    if char == '*':
        return end_block_comment, ''
    return block_comment, ''

def end_block_comment(char):
    if char == '/':
        return source_code, ''
    return block_comment, ''

def parseName(combl):
    x = re.search(matchstr, combl)
    if x:
        start, end = x.regs[0]
        funName = combl[start:end].split('(')[0].split()[-1]
        return funName

def matchedline(strr, lst, pattern):
    for ind, (a, b)in enumerate(zip(lst[:-1], lst[1:])):
        if (b-a != 0) and (re.search(pattern, strr[a:b])):
            return counter + ind
    return None

def endoffun(strr, lst):
    for ind, (a, b)in enumerate(zip(lst[:-1], lst[1:])):
        line = strr[a:b]
        global bracer
        bracer = bracer + len(re.findall('\{', line))
        bracer = bracer - len(re.findall('\}', line))
        if bracer == 0:
            bracer = 100000
            return counter + ind
    return None

def addparsedict(lno, name, mode):
    if lno in parfundict:
        parfundict[lno].append(FunParse(name, mode))
    else:
        parfundict[lno] = [FunParse(name, mode)]


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
        global bracer
        bracer = 1
        counter = 1
        funName = ""
        while True:
            lnos = [1]
            gotstr = gen_content(fname)
            cline = ''.join(gotstr)
            estimatedName = parseName(cline.replace('\n', ' '))
            lnos.append(len(cline))
            if estimatedName is not None and estimatedName not in keywords:
                bracer = 1
                funName = estimatedName
                lno = matchedline(cline, lnos, '\)*\{')
                if lno is not None:
                    lno = lno + 1
                    addparsedict(lno+1, funName, 'entry')
            else:
                lno = matchedline(cline, lnos, 'return[\s;\(])')
                if lno is not None:
                    addparsedict(lno, funName, 'exit')
                lno = endoffun(cline, lnos)
                if lno is not None:
                    addparsedict(lno, funName, 'endoffun')

            counter = counter + len(lnos) - 2
            if eof:
                break

def writefile(src, dest):
    with open(src, 'r') as fname, open(dest, 'w') as temp:
        for ind, line in enumerate(fname):
            if (ind + 1) in parfundict:
                lval = parfundict[ind + 1]
                effec = ''
                for val in lval and val.name not in defaulters:
                    effec = effec + f'printf("{val.name} : {val.mode}");' + '\n'
                line = effec + line
            temp.write(line)

def procfile(src):
    global eof, bracer, parfundict
    eof = False
    bracer = 100000
    parfundict = {}
    infile = src
    outfile = "temp.c"
    remove_comments(infile, outfile)
    print(infile)
    writefile(infile, outfile)
    os.replace(outfile, infile)

pattern = "*.c"

for path, subdirs, files in os.walk(root):
    for name in files:
        if fnmatch(name, pattern):
            procfile(os.path.join(path, name))
