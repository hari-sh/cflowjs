def source_code(char):
    if char == '/':
        return comment_begin, ''
    elif char == ';':
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

def linesplit(strr, lst, counter):
    result = []
    for ind, (a, b)in enumerate(zip(lst[:-1], lst[1:])):
        if (b-a != 0):
            result.append(f'/*--{counter + ind}--*/' + strr[a:b])
    print(result)
    return result


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

def remove_comments():   
    with open('comments.c', 'r') as fname, open('temp.c', 'w') as temp:
        global cline
        global counter
        global lnos
        counter = 1
        while True:
            lnos = [1]
            gotstr = gen_content(fname)
            cline = ''.join(gotstr)
            lnos.append(len(cline))
            print(lnos)
            clinspt = ''.join(linesplit(cline, lnos, counter))
            counter = counter + len(lnos) - 2
            temp.write(clinspt)
            # temp.write('/*--'+cline+'---*/')
            # temp.write(cline)
            # temp.write('\n/*----*/')
            if eof == True:
                break

eof = False
remove_comments()
