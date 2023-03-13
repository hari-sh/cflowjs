def remove_comments(fname):
    block_comment = False
    line_comment = False
    probably_a_comment = False
    result = []
    while True:
        character = fname.read(1)
        if not character:
            print("End of file")
            break
        
        if not line_comment and not block_comment and character == '/':
            probably_a_comment = True
            continue

        if block_comment and character == '*':
            probably_a_comment = True
            continue

        if line_comment and character == '\n':
            line_comment = False
            result.append('\n')
        elif block_comment and probably_a_comment and character == '/':
            block_comment = False
        elif not line_comment and not block_comment:
            if probably_a_comment:
                if character == '/':
                    line_comment = True
                elif character == '*':
                    block_comment = True
                else:
                    result.append('/')  # Append the / we skipped when flagging that it was probably a comment starting
                    result.append(character)
            else:
                result.append(character)
        probably_a_comment = False

    return ''.join(result)

with open('comments.c') as f, open('temp.c', 'w') as temp:
    temp.writelines(remove_comments(f))
