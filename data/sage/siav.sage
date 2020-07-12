import hashlib
from cm_fields import CM_FIELDS

def id(f: Polynomial):
    return hashlib.sha256(
        ",".join(str(f[i]) for i in [0..f.degree()]).encode("utf8")
    ).hexdigest()

class SimpleSIAV:
    def __init__(self,f: Polynomial):
        self.f = f
        self.id = id(f)
        K0.<pi0> = NumberField(f)
        assert K0.is_CM() # check for "ideal"ness pt 1 (no real roots)
        K = next(K for K in CM_FIELDS[K0.degree()] if K.is_isomorphic(K0))
        pi = f.any_root(ring=K)
        assert pi*pi.conjugate() in ZZ
        assert ZZ(pi*pi.conjugate()).is_pseudoprime_power()
        assert K.order([pi,pi.conjugate()]).is_maximal()
        B = K.ring_of_integers().basis()
        M = Matrix([b.vector() for b in B]).transpose().inverse()
        F,iota = K.maximal_totally_real_subfield()
        self.g = f.degree()/2
        self.q = ZZ(f(0)^(1/self.g))
        self.p,self.a = self.q.perfect_power()
        self.croots = f.roots(ring=CC)
        self.newton_polygon = [QQ(a) for a in pari.newtonpoly(f,self.p)]
        self.is_ordinary = not self.p.divides(f[self.g]) # see Def.~3.1 Howe 1995
        assert self.is_ordinary or self.a == 1 # check for "ideal"ness pt 2 (ordinary or q prime)
        self.frobenius_matrix = Matrix([M*(pi*b).vector() for b in B]).transpose()
        self.verschiebung_matrix = self.q*self.frobenius_matrix.inverse()
        if self.is_ordinary:
            self.is_principally_polarized = (pi-self.q/pi).norm() != 1 or f[self.g]+1 % (4 if self.q == 2 else self.q) != 0
        else:
            self.is_principally_polarized = None
        self.K = K
        self.pi = pi
        self.beta = pi+pi.conjugate()
        self.F = F

class SIAV:
    def __init__(self,f: Polynomial):
        assert ZZ(f(0)).is_pseudoprime_power()
        self.f = f
        self.id = id(f)
        self.components = [(SimpleSIAV(h),k) for h,k in f.factor()]
        assert len(self.components) == 1 or all(k==1 for _,k in self.components)
        assert all(
            A1.q == A2.q
            and
            A1.beta.minpoly().resultant(A2.beta.minpoly())^2 == 1
            for [A1,_],[A2,_] in Subsets(self.components,2)
        )
        self.is_simple = len(self.components) == 1 and self.components[0][1] == 1

    def to_jsonable(self):
        A = self
        return {
            "id": A.id,
            "f": str(A.f),
            "h": str(prod(B.beta.minpoly()^k for B,k in A.components)),
            "q": str(A.components[0][0].q),
            "a": str(A.components[0][0].a),
            "p": str(A.components[0][0].p),
            "g": str(sum(B.g for B,_ in A.components)),
            "simple": A.is_simple,
            "is_principally_polarized": all(B.is_principally_polarized for B,_ in A.components),
            "DeltaK": str(prod(B.K.discriminant() for B,_ in A.components)),
            "DeltaK+": str(prod(B.F.discriminant() for B,_ in A.components)),
            "components": [
                {
                    "exponent": str(k),
                    "id": B.id,
                    "f": str(B.pi.minpoly()),
                    "h": str(B.beta.minpoly()),
                    "g": str(B.g),
                    "a": str(B.a),
                    "p": str(B.p),
                    "q": str(B.q),
                    "croots": [str(z) for z in B.croots],
                    "newton_polygon": [str(a) for a in B.newton_polygon],
                    "is_ordinary": B.is_ordinary,
                    "frobenius_matrix": [[str(a) for a in r] for r in B.frobenius_matrix],
                    "verschiebung_matrix": [[str(a) for a in r] for r in B.verschiebung_matrix],
                    "is_principally_polarized": B.is_principally_polarized,
                    "K": str(B.K.polynomial()),
                    "K+": "y - 1" if B.F.degree() == 1 else str(B.F.polynomial()).replace("x","y"),
                    "DeltaK": str(B.K.discriminant()),
                    "DeltaK+": str(B.F.discriminant()),
                }
                for B,k in A.components
            ],
        }