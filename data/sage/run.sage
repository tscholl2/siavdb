load("./cm_fields.sage")
load("./weil-generators.sage")

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
