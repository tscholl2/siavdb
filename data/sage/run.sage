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
M = {2:10,4:0,6:0,8:0,10:0}#{2:1000,4:100,6:10,8:5,10:1}
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
# known products
with open("weil_generators/products.txt") as f:
    R.<x> = ZZ[]
    arr = sage_eval(s,locals={"x":x})
    for fi in arr:
        for f in fi + [prod(fi)]:
            if f not in seen:
                DATA.append(SIAV(f))
                seen.add(f)
# search for other products
simple = [A for A in DATA if A.is_simple]
def foo(Ai):
    A1,A2 = [A.components[0] for A in Ai]
    if (len(components) == 1 or all(k==1 for _,k in components)) and A1.q == A2.q and A1.beta.minpoly().resultant(A2.beta.minpoly())^2 == 1:
        try:
            SIAV(prod(A.f for A in Ai))
            return frozenset([A1.f,A2.f])
        except AssertionError:
            return None
edges = set()
for res in process_map(
    foo,
    ((A,B) for i,A in enumerate(simple) for j,B in enumerate(simple[i:])),
    chunksize=1000,
    max_workers=MAX_WORKERS,
    desc="wg products 2",
    total=int(len(simple)*(len(simple)-1)/2),
):
    if res is not None:
        edges.add(res)
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
