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
        R.<x> = QQ[]
        F,iota = K.maximal_totally_real_subfield()
        self.g = f.degree()/2
        self.q = ZZ(f(0)^(1/self.g))
        self.p,self.a = self.q.perfect_power()
        self.N = ZZ(self.f(1))
        self.croots = f.roots(ring=CC)
        self.newton_polygon = [QQ(a) for a in pari.newtonpoly(f,self.p)]
        self.is_ordinary = not self.p.divides(f[self.g]) # see Def.~3.1 Howe 1995
        assert self.is_ordinary or self.a == 1 # check for "ideal"ness pt 2 (ordinary or q prime)
        self.frobenius = pi
        self.verschiebung = pi.conjugate()
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
        self.id = id(self.f)
        self.components = [(SimpleSIAV(h),k) for h,k in self.f.factor()]
        self.g = ZZ(self.f.degree()/2)
        self.is_simple = len(self.components) == 1 and self.components[0][1] == 1
        self.is_ordinary = all(B.is_ordinary for B,_ in self.components)
        self.is_principally_polarized = all(B.is_principally_polarized for B,_ in self.components)
        self.q = self.components[0][0].q
        self.a = self.components[0][0].a
        self.p = self.components[0][0].p
        self.N = ZZ(self.f(1))
        assert len(self.components) == 1 or all(k==1 for _,k in self.components)
        assert all(
            A1.q == A2.q
            and
            A1.beta.minpoly().resultant(A2.beta.minpoly())^2 == 1
            for [A1,_],[A2,_] in Subsets(self.components,2)
        )

    def to_jsonable(self):
        A = self
        return {
            "id": A.id,
            "f": str(A.f),
            "h": str(prod(B.beta.minpoly()^k for B,k in A.components)),
            "q": str(A.q),
            "a": str(A.a),
            "p": str(A.p),
            "n": str(A.N),
            "g": str(A.g),
            "is_simple": A.is_simple,
            "is_ordinary": A.is_ordinary,
            "is_principally_polarized": A.is_principally_polarized,
            "deltaK": str(prod(B.K.discriminant() for B,_ in A.components)),
            "deltaK+": str(prod(B.F.discriminant() for B,_ in A.components)),
            "components": [
                {
                    "exponent": str(k),
                    "id": B.id,
                    "f": str(B.pi.minpoly()),
                    "h": str(B.beta.minpoly()),
                    "g": str(B.g),
                    "n": str(B.N),
                    "croots": [str(z) for z in B.croots],
                    "newton_polygon": [str(a) for a in B.newton_polygon],
                    "is_ordinary": B.is_ordinary,
                    "is_principally_polarized": B.is_principally_polarized,
                    "K": str(B.K.polynomial()),
                    "K+": "x - 1" if B.F.degree() == 1 else str(B.F.polynomial()),
                    "deltaK": str(B.K.discriminant()),
                    "deltaK+": str(B.F.discriminant()),
                }
                for B,k in A.components
            ],
        }
