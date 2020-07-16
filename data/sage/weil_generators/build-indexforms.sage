from cm_fields import CM_FIELDS

def run(F):
    """
    Given a totally real field F, this returns a set of representatives of
    { eta : O_F = Z[eta] } / (eta_1 ~ eta_2 <=> eta_1 - eta_2 in Z)
    """
    if F.degree() == 1:
        return [F(0)]
    if F.degree() == 2:
        return ((F.disc() + sqrt(F.disc()))/2).minpoly().roots(ring=F,multiplicities=False)
    print(F)
    s = magma.eval("""
        SetMemoryLimit(4000000000);
        R<x> := PolynomialRing(RationalField());
        f := %s;
        O := MaximalOrder(f);
        arr := IndexFormEquation(O, 1);
        print([MinimalPolynomial(a) : a in arr]);
    """ % F.polynomial())
    R.<x> = ZZ[]
    try:
        arr = eval(preparse(s.replace("$.1","x")))
    except Exception as e:
        print("ERROR: ", s.replace("$.1","x"))
        print(s)
        raise e
    arr = set(flatten([g.roots(ring=F,multiplicities=False) for g in arr]))
    arr = set(flatten([[a,-a] for a in arr]))
    return list(arr)

def run_timed(F):
    alarm(5)
    try:
        return run(F)
    except KeyboardInterrupt:
        raise ValueError
    alarm(0)

try:
    indexforms = load("indexforms.sobj")
except IOError:
    indexforms = []

from tqdm import tqdm
#for F,gens in tqdm(indexforms,desc="Testing..."):
#    assert all(F.order([a]).is_maximal() for a in gens), F

for K in tqdm(CM_FIELDS[6]):
    F,_ = K.maximal_totally_real_subfield()
    if any(F2.is_isomorphic(F) for F2,_ in indexforms):
        continue
    if F.polynomial() == x^4 - 14*x^3 + 64*x^2 - 104*x + 50:
        continue
    if F.polynomial() == x^4 - 16*x^3 + 85*x^2 - 174*x + 116:
        continue
    if F.polynomial() == x^4 - 16*x^3 + 83*x^2 - 154*x + 75:
        continue
    if F.polynomial() == x^4 - 14*x^3 + 62*x^2 - 90*x + 17:
        continue
    if F.polynomial() == x^4 - 17*x^3 + 98*x^2 - 224*x + 172:
        continue
    if F.polynomial() == x^4 - 13*x^3 + 48*x^2 - 39*x + 7:
        continue
    try:
        gens = run(F)
    except ValueError:
        continue
    indexforms.append([F,gens])
    save(indexforms,"indexforms.sobj")
