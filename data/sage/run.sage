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
                chunksize=32,
                max_workers=MAX_WORKERS,
                desc="loading",
            )
except FileNotFoundError:
    DATA = []
seen = set(A.f for A in DATA)
with open("products.txt") as f:
    R.<x> = ZZ[]
    arr = sage_eval(f.read(),locals={"x":x})
    for fi in tqdm(arr,desc="reading products list"):
        for f in fi + [prod(fi)]:
            if f not in seen:
                DATA.append(SIAV(f))
                seen.add(f)

# look for simple stuff
def foo(K):
    M = {2:1000,4:100,6:20,8:10}
    try:
        return list(find_wg_in_field(K,M=0))#M[K.degree()]))
    except ValueError:
        return []
for alpha in tqdm([
    w for W in process_map(
        foo,
        [K for g in [2,4,6,8] for K in CM_FIELDS[g]],
        chunksize=4,
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

# search for other products
simple = [A.components[0][0] for A in DATA if A.is_simple][:1]
edges = set()
for A,B in tqdm(
    ((A,B) for i,A in enumerate(simple) for B in simple[i+1:]),
    total=int(len(simple)*(len(simple)-1)/2),
    desc="building edges",
):
    if A.q == B.q and A.beta.minpoly().resultant(B.beta.minpoly())^2 == 1:
        edges.add(frozenset([A.f,B.f]))
G = Graph([list(e) for e in edges])
cells = G.clique_complex().cells()
products = [prod(d) for i,c in cells.items() for d in list(c) if i>=1]
def foo(f):
    try:
        return SIAV(f)
    except AssertionError:
        return None
for A in process_map(
    foo,
    products,
    chunksize=32,
    max_workers=MAX_WORKERS,
    desc="product siavs",
):
    if A.f not in seen:
        DATA.append(A)
        seen.add(f)


print(f"""
Summary
-------------------
total = {len(DATA)}
-------------------
# simple = {len([A for A in DATA if A.is_simple])}
-------------------
# not simple = {len([A for A in DATA if not A.is_simple])}
""")

# save
with open("siav-list2.json","w") as f:
    json.dump({A.id: A.to_jsonable() for A in DATA},f,indent=2)
