from cm_fields import CM_FIELDS
from weil_generators import find_wg_in_field,find_wg_in_product
import json
from tqdm import tqdm
from tqdm.contrib.concurrent import process_map
load("siav.sage")

# load previously generated stuff
R.<x> = ZZ[]
DATA = []
with open("siav-list2.json") as f:
    for k,v in tqdm(json.load(f).items(),desc="loading"):
        DATA.append(SIAV(R(v["f"])))
seen = set(A.f for A in DATA)
# look for products
W = set()
def foo(args):
    return find_wg_in_product(args[0],args[1])
for w in (w for W in process_map(
    foo,
    list(Subsets(CM_FIELDS[2] + CM_FIELDS[4],2))[:1],
    chunksize=4,
    max_workers=4,
    desc="products",
) for w in W):
    f1,f2 = [f.minpoly() for f in w]
    q = ZZ(f1(0)^(2/f1.degree()))
    m1 = f1.monomial_coefficient(f1.parent().0^(f1.degree()/2))
    m2 = f2.monomial_coefficient(f2.parent().0^(f2.degree()/2))
    if q.is_prime_power() and ((gcd(q,m1)==1 and gcd(q,m2)==1) or q.is_prime()):
        W.add(frozenset([f1,f2]))
edges = [list(w) for w in W]
print(edges)
G = Graph(edges)
for c in [d for i,c in G.clique_complex().cells().items() for d in list(c) if i>=1]:
    f = prod(c)
    if f in seen:
        continue
    try:
        DATA.append(SIAV(f))
        seen.add(f)
    except AssertionError:
        continue
# look for simple stuff
def foo(args):
    return list(find_wg_in_field(args[0],M=args[1]))
M = {2:1000,4:100,6:10,8:1,10:1}
for alpha in (w for W in process_map(
    foo,
    [(K,M[g]) for g in [2,4,6,8,10] for K in CM_FIELDS[g]][:5],
    chunksize=4,
    max_workers=4,
    desc="simple",
) for w in W):
    f = alpha.minpoly()
    if f in seen:
        continue
    try:
        DATA.append(SIAV(f))
        seen.add(f)
    except AssertionError:
        continue

with open("siav-list2.json","w") as f:
    json.dump({A.id: A.to_jsonable() for A in DATA},f,indent=2)


print(f"""
Summary
-------------------
total = {len(DATA)}
-------------------
# simple = {len([A for A in DATA if A.is_simple])}
-------------------
# not simple = {len([A for A in DATA if not A.is_simple])}
""")










"""
try:
    from tqdm.contrib.concurrent import process_map
except:
    from multiprocessing import Pool
    def process_map(f,arr,chunksize=0,max_workers=4):
        pool = Pool(processes=max_workers)
        return pool.imap(f,arr,chunksize=chunksize)

def foo(arr):
    return find_wg_in_product(arr[0],arr[1])
Wijs = process_map(
    foo,
    list(Subsets(CM_FIELDS[2] + CM_FIELDS[4],2)),
    chunksize=5,
    max_workers=36,
)
W = set()
for Wij in Wijs:
    for w in Wij:
        f1,f2 = [f.minpoly() for f in w]
        q = ZZ(f1(0)^(2/f1.degree()))
        m1 = f1.monomial_coefficient(f1.parent().0^(f1.degree()/2))
        m2 = f2.monomial_coefficient(f2.parent().0^(f2.degree()/2))
        if q.is_prime_power() and ((gcd(q,m1)==1 and gcd(q,m2)==1) or q.is_prime()):
            W.add(frozenset([f1,f2]))

edges = [list(w) for w in W]
G = Graph(edges)
cells = sum([list(c) for i,c in G.clique_complex().cells().items() if i>0],[])
for c in cells:
    print(f"{list(c)},")
"""