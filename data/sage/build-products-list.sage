R.<x> = ZZ[]
with open("siav-list.txt") as F:
    siavlist = set([R(line) for line in F.readlines()])
    
from tqdm import tqdm

simple = {}
for f in tqdm(siavlist,desc="Finding simple SIAVs"):
    if not f.is_irreducible():
        continue
    q = ZZ(f(0)^(2/f.degree()))
    if q not in simple:
        simple[q] = []
    simple[q].append(f)
    
def pairs(arr):
    return ((a,b) for i,a in enumerate(arr) for b in arr[i+1:])

def get_g(f):
    K.<pi> = NumberField(f)
    q = ZZ(f(0)^(2/f.degree()))
    return (pi+q/pi).minpoly()

def orth(f1,f2):
    return abs(get_g(f1).resultant(get_g(f2))) == 1

arr = []
for q in tqdm(sorted(simple.keys()),desc="Finding Products"):
    if len(simple[q]) <= 1:
        continue
    G = Graph([p for p in pairs(simple[q]) if orth(p[0],p[1])]).to_simple().to_undirected()
    for C in [c for c in G.cliques_maximal() if len(c) > 1]:
        for f in (prod(S) for S in Subsets(C) if len(S) > 1):
            if f not in arr and f not in siavlist:
                arr.append(f)

with open("siav-list.txt","a") as F:
    F.write("\n" + "\n".join([str(f) for f in arr]))
