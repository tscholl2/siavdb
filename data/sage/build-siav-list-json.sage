import hashlib
import json

try:
    with open("../siav-list.json") as F:
        previous_json = json.load(F)
except IOError:
    previous_json = []

def siav_info_simple(f):
    R.<x> = ZZ[]
    S.<y> = ZZ[]
    g = ZZ(f.degree()/2)
    q = ZZ(f(0)^(1/g))
    p,a = q.perfect_power()

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
        "S": True,
        "g": str(g),
        "N": str(ZZ(f(1))),
        "NP": [str(QQ(a)) for a in pari.newtonpoly(f,p)],
        "AP": str([QQ(a) for a in pari.newtonpoly(f,p)].count(0)),
        "OR": [QQ(a) for a in pari.newtonpoly(f,p)].count(0) == g,
        "F": [[str(a) for a in r] for r in Matrix([M*(pi*b).vector() for b in B]).transpose()],
        "V": [[str(a) for a in r] for r in Matrix([M*(q/pi*b).vector() for b in B]).transpose()],
        "PP": not ((pi-q/pi).norm() == 1 and f[g]%(4 if q == 2 else q) == (3 if q == 2 else q-1)),
        # CM Field stuff
        "Kf": str(K.polynomial()),
        "K+f": "y - 1" if F.degree() == 1 else str(F.polynomial()(y)),
        "Kdisc": str(K.disc()),
        "K+disc": str(1 if F.degree() == 1 else F.disc()),
        "Kdeg": str(K.degree()),
        "K+deg": str(F.degree()),
    }

def siav_info_not_simple(f,simple_info):
    components = [next(D for D in simple_info if D["f"] == str(fi)) for fi,_ in f.factor()]
    assert max(k for _,k in f.factor())==1, "Not squarefree: %s"%f
    D0 = components[0]
    p,a,q = D0["p"],D0["a"],D0["q"]
    R.<x> = QQ[]
    S.<y> = QQ[]
    return {
        # Meta stuff
        "id": hashlib.sha256(",".join(map(str,f.coefficients(sparse=False)))).hexdigest(),
        # Weil number stuff
        "f": str(f.factor()),
        "p": D0["p"],
        "a": D0["a"],
        "q": D0["q"],
        "croots": [str(z) for z in flatten([[z for z,_ in fi.roots(ring=CC)] for fi,_ in f.factor()])],
        # AV stuff
        "S": False,
        "g": str(sum(fi.degree()*k for fi,k in f.factor())),
        "N": str(ZZ(f(1))),
        "NP": [str(QQ(a)) for a in pari.newtonpoly(f,p)],
        "AP": str([QQ(a) for a in pari.newtonpoly(f,p)].count(0)),
        "OR": all(D["OR"] for D in components),
        "F": [[str(a) for a in r] for r in reduce(lambda p,n: p.block_sum(n),[
                Matrix([[ZZ(a) for a in row] for row in D["F"]])
                for D in components
        ])],
        "V": [[str(a) for a in r] for r in reduce(lambda p,n: p.block_sum(n),[
                Matrix([[ZZ(a) for a in row] for row in D["V"]])
                for D in components
        ])],
        "PP": all(D["PP"] for D in components), # TODO: This only works for squarefree prob
        # CM Field stuff
        "Kf": str(prod(R(D["Kf"]) for D in components)),
        "K+f": str(prod(S(D["K+f"]) for D in components)),
        "Kdisc": str(prod(ZZ(D["Kdisc"]) for D in components)),
        "K+disc": str(prod(ZZ(D["K+disc"]) for D in components)),
        "Kdeg": str(sum(ZZ(D["Kdeg"]) for D in components)),
        "K+deg": str(sum(ZZ(D["K+deg"]) for D in components)),
    }


R.<x> = ZZ[]
arr = [R(f) for f in open("siav-list.txt").readlines()]
from tqdm import tqdm
brr = []
for f in tqdm(arr,"Simple"):
    if f.is_irreducible():
        brr.append(siav_info_simple(f))
for f in tqdm(arr,"Not simple"):
    if not f.is_irreducible():
        brr.append(siav_info_not_simple(f,brr))
with open("siav-list.json","w") as F:
    json.dump(brr,F)
