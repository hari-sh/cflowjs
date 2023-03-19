import os


def updatetracker(name, incdec):
    if name in trackcount:
        trackcount[name] += incdec
    else:
        trackcount[name] = incdec
    


trackcount = {}

with open("src/obtlog.txt", 'r') as infile,  open("temp.txt", 'w') as outfile:
    inden = 0
    for line in infile:
        splt = line.split()
        if len(splt) == 2:
            name = splt[0]
            mode = splt[1]
            if mode == 'entry':
                updatetracker(name, 1)
                outfile.write(name.rjust(inden) + os.linesep)
                inden = inden + 4
            elif mode == 'exit':
                updatetracker(name, -1)
                inden = inden - 4

for key in trackcount:
    val = trackcount[key]
    if val != 0:
        print(key +" : " + str(val))
