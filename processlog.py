class Node:
    def __init__(self, text, level, bro) -> None:
        self.children : list = []
        self.text = text
        self.level = level
        self.repeat = False
        self.bro = bro

def as_dict(node):
    if len(node.children) >= 1:
        return {node.text + "->" + node.bro : [as_dict(kid) for kid in node.children]}
    else:
        return node.text + "->" + node.bro
    
def as_txtmap(node, fname):
    # fname.write(" "*node.level + node.text + '->' + str(node.bro) + '\n')
    fname.write(" "*node.level + node.text + '\n')
    for kid in node.children:
        as_txtmap(kid, fname)

def getNextItem(lines : str):
    try:
        indline = next(lines)
        level = len(indline) - len(indline.lstrip())
        text = indline.strip()
        while(text == ''):
            text, level = getNextItem(lines)

    except:
        text, level = (None, None)
    
    return (text, level)

def skipDescendants(lines, plevel):
    text, level = getNextItem(lines)
    while(text):
        if((level is not None) and plevel >= level):
            break
        plevel = level
        text, level = getNextItem(lines)
    return (text, level)
    

def makedict(lines, pnode, bro):
    text, level = getNextItem(lines)
    while(text):
        if(pnode.level < level):
            if (text == bro):
                text, level = skipDescendants(lines, level)
            else:
                node = Node(text, level, bro)
                pnode.children.append(node)
                text, level, tbro = makedict(lines, node, None)
            bro = tbro if tbro is not None else bro    
        elif(pnode.level == level):
            return (text, level, pnode.text)
        else:
            return (text, level, None)
    else:
        return (None, None, None)
    
with open("tester/logsample.txt") as ip:
    root = Node('root', -1, None)
    makedict(ip, root, None)

with open('result.txt', 'w') as txtmap:
    as_txtmap(root, txtmap)

# with open('result.json', 'w') as fp:
#     json.dump(as_dict(root), fp, indent=4)
