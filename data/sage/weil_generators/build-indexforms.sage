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

import signal
from contextlib import contextmanager

class TimeoutException(Exception): pass

@contextmanager
def time_limit(seconds):
    def signal_handler(signum, frame):
        raise TimeoutException("Timed out!")
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)

try:
    indexforms = load("indexforms.sobj")
except IOError:
    indexforms = []

from tqdm import tqdm
#for F,gens in tqdm(indexforms,desc="Testing..."):
#    assert all(F.order([a]).is_maximal() for a in gens), F

for K in tqdm(CM_FIELDS[8]):
    F,_ = K.maximal_totally_real_subfield()
    if any(F2.is_isomorphic(F) for F2,_ in indexforms):
        continue
    if F.polynomial() == x^4 - 19*x^3 + 106*x^2 - 148*x + 9:
        continue
    if F.polynomial() == x^4 - 29*x^3 + 184*x^2 - 312*x + 36:
        continue
    if F.polynomial() == x^4 - 17*x^3 + 94*x^2 - 183*x + 99:
        continue
    if F.polynomial() == x^4 - 25*x^3 + 168*x^2 - 165*x + 41:
        continue
    if F.polynomial() == x^4 - 36*x^3 + 303*x^2 - 812*x + 441:
        continue
    if F.polynomial() == x^4 - 29*x^3 + 238*x^2 - 513*x + 319:
        continue
    if F.polynomial() == x^4 - 14*x^3 + 64*x^2 - 104*x + 50:
        continue
    if F.polynomial() == x^4 - 16*x^3 + 78*x^2 - 119*x + 45:
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
        with time_limit(5):
            gens = run(F)
        print("success!")
    except TimeoutException:
        print("timed out")
        continue
    indexforms.append([F,gens])
    save(indexforms,"indexforms.sobj")
