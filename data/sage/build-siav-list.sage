load("search.sage")

try:
    R.<x> = ZZ[]
    with open("siav-list.txt") as F:
        siavlist = set([R(line) for line in F.readlines()])
except IOError:
    siavlist = set([])

from tqdm import tqdm

for f in tqdm(siavlist,desc="Testing..."):
    continue
    K.<pi> = NumberField(f)
    assert ZZ(pi*pi.conjugate()).is_pseudoprime_power()
    assert K.order([pi,pi.conjugate()]).is_maximal()
    assert K.class_number() == 1

print "Collecting new data"
# 4 min for g=1
# A few hours for g=2
g = 4
load("cm-fields-%d.sage" % (2*g))
for f in tqdm(data,desc="CM Fields"):
    K.<a> = NumberField(f)
    if g == 1:
        M = 1000
    if g == 2:
        M = 100
    if g == 3:
        M = 20
    if g == 4:
        M = 5
    T = wg_find_T(K.maximal_totally_real_subfield()[0])
    for pi in tqdm(wg_search(K,M=M),total=int(4*M) if g == 1 else int(2*(2*M)^(g-1)*len(T)),desc="Polynomials"):
        if pi not in siavlist and ZZ(pi*pi.conjugate()).is_pseudoprime_power():
            siavlist.add(pi.minpoly())
            with open("siav-list.txt","a") as F:
                F.write("\n"+str(pi.minpoly()))
print "Done"
