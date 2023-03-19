import os

with open("src/obtlog.txt", 'r') as infile,  open("temp.txt", 'w') as outfile:
    inden = 0
    for line in infile:
        splt = line.split()
        if len(splt) == 2:
            name = splt[0]
            mode = splt[1]
            if mode == 'entry':
                outfile.write(name.rjust(inden) + os.linesep)
                inden = inden + 4
            elif mode == 'exit':
                inden = inden - 4
