load("search.sage")

try:
    siavlist = load("siavlist.sobj")
except IOError:
    siavlist = []

print "Testing current data"
for f in siavlist:
    K.<pi> = NumberField(f)
    assert ZZ(pi*pi.conjugate()).is_pseudoprime_power()
    assert K.order([pi,pi.conjugate()]).is_maximal()
    assert K.class_number() == 1
print "Current data OK"

print "Collecting new data"
from tqdm import tqdm
for g in tqdm([1,2,3,4],desc="Dimension")):
    load("cm-fields-%d.sage" % (2*g))
    for f in tqdm(data,desc="Field"):
        K.<a> = NumberField(f)
        if g == 1:
            M = 10000
        if g == 2:
            M = 5000
        if g == 3:
            M = 500
        if g == 4:
            M = 10
        for pi in wg_search(f,M=M):
            h = pi.minpoly()
            if h not in siavlist:
                siavlist.append(h)
                save(siavlist,"siavlist.sobj")
print "Done"


