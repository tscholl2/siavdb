def siav_info(f):
    R.<x> = ZZ[]
    S.<y> = ZZ[]
    g = ZZ(f.degree()/2)
    p,_ = ZZ(f(0)).perfect_power()
    a = ZZ(log(f(0),p)/g)
    q = p^a

    K.<pi> = NumberField(f)
    B = K.ring_of_integers().basis()
    M = Matrix([b.vector() for b in B]).transpose().inverse()
    F,iota = K.maximal_totally_real_subfield()

    return {
        # Weil number stuff
        "f": str(f),
        "p": str(p),
        "a": str(a),
        "q": str(q),
        "croots": [str(z) for z,_ in f.roots(ring=CC)],
        # AV stuff
        "g": str(g),
        "N": str(ZZ(f(1))),
        "NP": [str(QQ(a)) for a in pari.newtonpoly(f,p)],
        "AP": [str(QQ(a)) for a in pari.newtonpoly(f,p)].count(0),
        "OR": [QQ(a) for a in pari.newtonpoly(f,p)].count(0) == g,
        "F": [[str(a) for a in r] for r in Matrix([M*(pi*b).vector() for b in B]).transpose()],
        "V": [[str(a) for a in r] for r in Matrix([M*(pi.conjugate()*b).vector() for b in B]).transpose()],
        "PP": not ((pi-pi.conjugate()).norm() == 1 and f[g]%(4 if q == 2 else q) == (3 if q == 2 else q-1)),
        # CM Field stuff
        "Kf": str(K.optimized_representation()[0].polynomial()),
        "K+f": "y - 1" if F.degree() == 1 else str(F.optimized_representation()[0].polynomial()(y)),
        "Kdisc": str(K.disc()),
        "K+disc": str(1 if F.degree() == 1 else F.disc()),
        "Kdeg": str(K.degree()),
        "K+deg": str(F.degree()),
    }

# TODO: read siav-list.json
#       and skip things done before

arr = load("siav-list.sobj")
from tqdm import tqdm
brr = []
for f in tqdm(arr):
    brr.append(siav_info(f))
import json
s = json.dumps(brr)
with open("siav-list.json","w") as f:
    f.write(s)
