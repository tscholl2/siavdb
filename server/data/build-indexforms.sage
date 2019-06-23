def run(F):
    """
    Given a totally real field F, this returns a set of representatives of
    { eta : O_F = Z[eta] } / (eta_1 ~ eta_2 <=> eta_1 - eta_2 in Z)
    """
    if F.degree() == 1:
        return [1]
    if F.degree() == 2:
        return ((F.disc() + sqrt(F.disc()))/2).minpoly().roots(ring=F,multiplicities=False)

    s = magma.eval("""
    R<x> := PolynomialRing(RationalField());
    O := MaximalOrder(%s);
    print([MinimalPolynomial(a) : a in IndexFormEquation(O, 1)]);
    """ % F.polynomial())
    R.<x> = ZZ[]
    arr = eval(preparse(s.replace("$.1","x")))
    arr = set(flatten([g.roots(ring=F,multiplicities=False) for g in arr]))
    arr = set(flatten([[a,-a] for a in arr]))
    return list(arr)

try:
    indexforms = load("indexforms.sobj")
except IOError:
    indexforms = []

load("cm-fields-8.sage")

from tqdm import tqdm
for f in tqdm(data):
    K.<a> = NumberField(f)
    F,_ = K.maximal_totally_real_subfield()
    if any(F2.is_isomorphic(F) for F2,_ in indexforms):
        continue
    gens = run(F)
    indexforms.append([F,gens])
    save(indexforms,"indexforms.sobj")
