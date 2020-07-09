indexforms = load("indexforms.sobj")
@cached_function
def wg_find_T(F):
    """
    Given a totally real field F, this returns a set of representatives of
    { eta : O_F = Z[eta] } / (eta_1 ~ eta_2 <=> eta_1 - eta_2 in Z)
    """
    if F.degree() == 1:
        T = [F(0)]
    elif F.degree() == 2:
        T = ((F.disc() + sqrt(F.disc()))/2).minpoly().roots(ring=F,multiplicities=False)
    else:
        for F2,gens in indexforms:
            if F2.is_isomorphic(F):
                phi = F2.embeddings(F)[0]
                T1 = [phi(a) for a in gens]
                T = []
                while len(T1) > 0:
                    a = T1.pop()
                    if not any(b-a in ZZ for b in T):
                        T.append(a)
                break
        else:
            raise Exception("unimplemented: %s" % F)
    assert all(F.order([a]).is_maximal() for a in T)
    assert all(a-b not in ZZ for a,b in Subsets(T,k=2))
    return T

from sage.libs.pari.convert_sage import gen_to_sage
@cached_function
def wg_find_gamma(K):
    """
    Given a CM field K, returns gamma such that O_K = O_F[gamma].
    """
    assert K.is_CM()
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

def find_wg_in_field(K,M=10):
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
            for v in cartesian_product_iterator([-M..M](/-M..M/view)*(g-1))
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

@cached_function
def _cached_pts(c1,c2,r):
    A3.<x1,x2,y> = AffineSpace(3,QQ)
    return A3.subscheme([c1,c2,r]).rational_points()

@cached_function
def find_wg_in_product(K1,K2):
    """
    Given CM fields K1 and K2, return all Weil generators in K1xK2.
    """
    A3.<x1,x2,y> = AffineSpace(3,QQ)
    gamma1 = wg_find_gamma(K1)
    gamma2 = wg_find_gamma(K2)
    F1,iota1 = K1.maximal_totally_real_subfield()
    F2,iota2 = K2.maximal_totally_real_subfield()
    V1,V1_to_F1,F1_to_V1 = F1.vector_space()
    V2,V2_to_F2,F2_to_V2 = F2.vector_space()
    T1 = wg_find_T(F1)
    T2 = wg_find_T(F2)
    for eta1,eta2 in cartesian_product_iterator([T1,T2]):
        for P in _cached_pts(
            Matrix(
                sum(F1_to_V1(c)*m for c,m in zip(h.coefficients(),h.monomials()))
                for h in [((eta1+x1)^2 - 4*y) * V1_to_F1(b) for b in V1.basis()]
            ).det() - K1.discriminant()/F1.discriminant()^2,
            Matrix(
                sum(F2_to_V2(c)*m for c,m in zip(h.coefficients(),h.monomials()))
                for h in [((eta2+x2)^2 - 4*y) * V2_to_F2(b) for b in V2.basis()]
            ).det() - K2.discriminant()/F2.discriminant()^2,
            iota1(eta1).minpoly()(y-x1).resultant(iota2(eta2).minpoly()(y-x2),variable=y)^2 - 1,
        ):
            a1,a2,q = P
            U1 = (-((eta1 + a1)^2 - 4*q)/(gamma1 - gamma1.conjugate()).norm(iota1)).sqrt(all=True)
            U2 = (-((eta2 + a2)^2 - 4*q)/(gamma2 - gamma2.conjugate()).norm(iota2)).sqrt(all=True)
            for u1,u2 in cartesian_product([U1,U2]):
                alpha1 = (iota1(u1)*(gamma1 - gamma1.conjugate()) + iota1(eta1) + a1)/2
                alpha2 = (iota2(u2)*(gamma2 - gamma2.conjugate()) + iota2(eta2) + a2)/2
                if not all(alpha in K.ring_of_integers() for alpha,K in zip([alpha1,alpha2],[K1,K2])):
                    continue
                assert all(alpha*alpha.conjugate() == q for alpha,iota in zip([alpha1,alpha2],[iota1,iota2]))
                assert all(K.order([alpha,alpha.conjugate()]).is_maximal() for K,alpha in zip([K1,K2],[alpha1,alpha2]))
                assert (alpha1+alpha1.conjugate()).minpoly().resultant((alpha2+alpha2.conjugate()).minpoly())^2 == 1
                yield (alpha1,alpha2)