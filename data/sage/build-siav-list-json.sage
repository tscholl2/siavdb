import hashlib
import json

try:
    with open("../siav-list.json") as F:
        previous_json = json.load(F)
except IOError:
    previous_json = []

def siav_info(f):
    R.<x> = ZZ[]
    S.<y> = ZZ[]
    g = ZZ(f.degree()/2)
    p,_ = ZZ(f(0)).perfect_power()
    a = ZZ(log(f(0),p)/g)
    q = p^a

    K0.<pi0> = NumberField(f)
    
    try:
        prev = next(d for d in previous_json if d["f"] == str(f))
        K.<Pii> = NumberField(R(str(prev["Kf"])))
        to_K = K0.embeddings(K)[0]
        assert K.is_isomorphic(K0)
    except:
        K, _, to_K = K0.optimized_representation()

    pi = to_K(pi0)
    B = K.ring_of_integers().basis()
    M = Matrix([b.vector() for b in B]).transpose().inverse()
    F,iota = K.maximal_totally_real_subfield()

    return {
        # Meta stuff
        "id": hashlib.sha256(",".join(map(str,f.coefficients(sparse=False)))).hexdigest(),
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
        "AP": [QQ(a) for a in pari.newtonpoly(f,p)].count("0"),
        "OR": [QQ(a) for a in pari.newtonpoly(f,p)].count(0) == g,
        "F": [[str(a) for a in r] for r in Matrix([M*(pi*b).vector() for b in B]).transpose()],
        "V": [[str(a) for a in r] for r in Matrix([M*(pi.conjugate()*b).vector() for b in B]).transpose()],
        "PP": not ((pi-pi.conjugate()).norm() == 1 and f[g]%(4 if q == 2 else q) == (3 if q == 2 else q-1)),
        # CM Field stuff
        "Kf": str(K.polynomial()),
        "K+f": "y - 1" if F.degree() == 1 else str(F.polynomial()(y)),
        "Kdisc": str(K.disc()),
        "K+disc": str(1 if F.degree() == 1 else F.disc()),
        "Kdeg": str(K.degree()),
        "K+deg": str(F.degree()),
    }

# TODO: read siav-list.json
#       and skip things done before

R.<x> = ZZ[]
arr = [R(f) for f in open("siav-list.txt").readlines()]
from tqdm import tqdm
brr = []
for f in tqdm(arr):
    brr.append(siav_info(f))
with open("siav-list.json","w") as F:
    json.dump(brr,F)
