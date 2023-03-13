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

def gen_content(fname):
    parser = source_code
    charnum = -1
    while True:
        character = fname.read(1)
        if not character:
            return None
        if character == '\n':
            global counter 
            line_dict[counter] = charnum
            counter = counter + 1
        parser, text = parser(character)
        charnum = charnum + len(text)
        yield text
        if parser is None:
            break

def remove_comments():   
    with open('comments.c', 'r') as fname, open('temp.c', 'w') as temp:
        global cline
        if True:
            gotstr = gen_content(fname)
            if gotstr is None:
                print(gotstr)
                # break
            cline = ''.join(gotstr)
            temp.write(cline)

line_dict = {}
counter = 1
remove_comments()
