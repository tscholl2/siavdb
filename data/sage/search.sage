R.<x> = ZZ[]
CM_FIELDS = {}
for d in [2,4,..,20]:
    load("cm-fields-%d.sage"%d)
    CM_FIELDS[d] = [NumberField(R(f),'a') for f in data]

indexforms = load("indexforms.sobj")
@cached_function
def wg_find_T(F):
    """
    Given a totally real field F, this returns a set of representatives of
    { eta : O_F = Z[eta] } / (eta_1 ~ eta_2 <=> eta_1 - eta_2 in Z)
    """
    if F.degree() == 1:
        return [F(0)]
    if F.degree() == 2:
        return ((F.disc() + sqrt(F.disc()))/2).minpoly().roots(ring=F,multiplicities=False)
    for F2,gens in indexforms:
        if F2.is_isomorphic(F):
            phi = F2.embeddings(F)[0]
            return [phi(a) for a in gens]
    raise Exception("unimplemented: %s" % F)


from sage.libs.pari.convert_sage import gen_to_sage
@cached_function
def wg_find_gamma(K):
    """
    Given a CM field K, returns gamma such that O_K = O_F[gamma].
    """
    F,iota = K.maximal_totally_real_subfield()
    if F == QQ:
        R.<x> = ZZ[]
        F = NumberField(x-1,"a0")
        iota = F.embeddings(K)[0]
    L.<b> = K.relativize(iota)
    pari_to_F = lambda polmod: gen_to_sage(polmod,locals={"y":F.gen()})
    F_zk = [pari_to_F(b) for b in F.pari_zk()]
    B = pari.rnfbasis(F.pari_bnf(),L.defining_polynomial())
    B = [[pari_to_F(pari.centerlift(pari.nfbasistoalg(F.pari_nf(),b))) for b in Bi] for Bi in B]
    B = [K(b[0] + b[1]*L.0) for b in B]
    assert B[0] == 1
    gamma = B[1]
    # double check
    B = flatten([[iota(bi),gamma*iota(bi)] for bi in F.ring_of_integers().basis()])
    assert all(bi in K.ring_of_integers() for bi in B)
    assert K.discriminant() == Matrix([[K(bi*bj).trace() for bi in B] for bj in B]).det()
    return gamma

def wg_search(K,M=10):
    """
    Given a CM field K and bound M, this searches for all Weil generators in K
    up to a some bound that is dependent on M.
    """
    if K.degree() == 2:
        omega = ((K.disc() + sqrt(K.disc()))/2).minpoly().any_root(ring=K)
        for a in [-M..M]:
            yield a + omega
            yield a - omega
        return
    F,iota = K.maximal_totally_real_subfield()
    g = F.degree()
    T = [iota(eta) for eta in wg_find_T(F)]
    gamma = wg_find_gamma(K)
    U = (
        iota(z*u)
        for z in [-1,1]
        for u in (
            prod(u^e for u,e in zip(F.units(),v))
            for v in cartesian_product_iterator([[-M..M]]*(g-1))
        )
    )
    V,K_from_V,K_to_V = K.vector_space()
    # A[eta] is the matrix which takes a vector in V which lies in the image of F
    # and writes it with respect to the basis 1,eta,eta^2
    A = {
        eta: Matrix([K_to_V(eta^i)
        for i in range(g)]).transpose().pseudoinverse() for eta in T
    }
    for u,eta in cartesian_product_iterator([U,T]):
        Omega = (u*(gamma-gamma.conjugate()) + eta)/2
        a = A[eta]*K_to_V(Omega*Omega.conjugate())
        alpha = -a[1] + Omega
        if not (all(i == 0 for i in a[2:]) and alpha in K.ring_of_integers()):
            continue
        assert K.order([alpha,alpha.conjugate()]).is_maximal() == 1
        assert alpha*alpha.conjugate() in ZZ
        yield alpha

def wg_search_by_height(K):
    """
    Given a CM field K and bound M, this searches for all Weil generators in K.
    It tries to search by height.
    Not proven, but should be close.
    """
    if K.degree() == 2:
        omega = wg_find_gamma(K)
        for a in NN: # NN = NonNegativeIntegers()
            for b in [a+omega,a+omega.conjugate(),-a+omega,-a+omega.conjugate()]:
                yield b
    F,iota = K.maximal_totally_real_subfield()
    g = F.degree()
    T = [iota(eta) for eta in wg_find_T(F)]
    gamma = wg_find_gamma(K)
    U = (
        z*u
        for u in (
            prod(u^e for u,e in zip(F.units(),[i/2 if i%2==0 else -(i+1)/2 for i in v]))
            for n in NN
            for v in IntegerVectors(n,g-1)
        )
        for z in [-1,1] # = F.roots_of_units() because F totally real
    )
    V,K_from_V,K_to_V = K.vector_space()
    # A[eta] is the matrix which takes a vector in V which lies in the image of F
    # and writes it with respect to the basis 1,eta,eta^2
    A = {eta: Matrix([K_to_V(eta^i) for i in range(g)]).transpose().pseudoinverse() for eta in T}
    for u,eta in cartesian_product_iterator([U,T]):
        Omega = (iota(u)*(gamma-gamma.conjugate()) + eta)/2
        a = A[eta]*K_to_V(Omega*Omega.conjugate())
        alpha = -a[1] + Omega
        if not (all(i == 0 for i in a[2:]) and alpha in K.ring_of_integers()):
            continue
        assert K.order([alpha,alpha.conjugate()]).is_maximal() == 1
        assert alpha*alpha.conjugate() in ZZ
        yield alpha
