from cm_fields import CM_FIELDS
from weil_generators import find_wg_in_field,find_wg_in_product
import json
from tqdm import tqdm
from tqdm.contrib.concurrent import process_map
load("siav.sage")

MAX_WORKERS = 2

# load previously generated stuff
R.<x> = ZZ[]
try:
    with open("siav-list2.json") as f:
        DATA = process_map(
                SIAV,
                [R(v["f"]) for v in json.load(f).values()],
                chunksize=16,
                max_workers=MAX_WORKERS,
                desc="loading",
            )
except FileNotFoundError:
    DATA = []

seen = set(A.f for A in DATA)
# look for simple stuff
def foo(args):
    try:
        return list(find_wg_in_field(args[0],M=args[1]))
    except ValueError:
        return []
M = {2:100,4:0,6:0,8:0,10:0}#{2:1000,4:100,6:10,8:5,10:1}
for alpha in tqdm([
    w for W in process_map(
        foo,
        [(K,M[g]) for g in [2] for K in CM_FIELDS[g]],
        chunksize=16,
        max_workers=MAX_WORKERS,
        desc="wg simple",
    ) for w in W
],desc="siav simple"):
    f = alpha.minpoly()
    if f in seen:
        continue
    try:
        DATA.append(SIAV(f))
        seen.add(f)
    except AssertionError:
        continue
# look for products
def foo(args):
    return find_wg_in_product(*args)
edges = set()
for w in [
    w for W in process_map(
        foo,
        [(QuadraticField(-1),QuadraticField(-3))],#list(Subsets(CM_FIELDS[2] + CM_FIELDS[4],2)),
        chunksize=8,
        max_workers=MAX_WORKERS,
        desc="wg products",
    ) for w in W
]:
    f1,f2 = [f.minpoly() for f in w]
    q = ZZ(f1(0)^(2/f1.degree()))
    m1 = f1.monomial_coefficient(f1.parent().0^(f1.degree()/2))
    m2 = f2.monomial_coefficient(f2.parent().0^(f2.degree()/2))
    if q.is_prime_power() and ((gcd(q,m1)==1 and gcd(q,m2)==1) or q.is_prime()):
        edges.add(frozenset([f1,f2]))
G = Graph([list(e) for e in edges])
for c in tqdm([d for i,c in G.clique_complex().cells().items() for d in list(c) if i>=1],"siav products"):
    f = prod(c)
    if f in seen:
        continue
    try:
        DATA.append(SIAV(f))
        seen.add(f)
    except AssertionError:
        continue
# other products
from multiprocessing import Queue
def foo(Ai):
    components = [A.components[0] for A in Ai]
    if (len(components) == 1 or all(k==1 for _,k in components)) and all(
        A1.q == A2.q
        and
        A1.beta.minpoly().resultant(A2.beta.minpoly())^2 == 1
        for [A1,_],[A2,_] in Subsets(components,2)
    ):
        try:
            return SIAV(prod(A.f for A in Ai))
        except AssertionError:
            return None
for A in process_map(
    foo,
    ((A,B) for i,A in enumerate(DATA) for j,B in enumerate(DATA[i:])),
    chunksize=1000,
    max_workers=MAX_WORKERS,
    desc="wg products 2",
    total=int(len(DATA)*(len(DATA)-1)/2),
):
    if A.f not in seen:
        DATA.append(A)
        seen.add(A.f)



# save
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
