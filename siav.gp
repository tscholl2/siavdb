f = x^6 + x^5 + x^4 + x^3 + x^2 + x + 1;

\\ ’x; ’y; ’z; ’t; ’a;
'aa;'bb;

/*
Given a polynomial f defining a CM field,
this returns a polynomial defining the maximal
totally real subfield.
*/
cmrealsubfield(f) = {
    local(n,g,K,arr);
    n = poldegree(f);
    if(n%2 != 0,error("expected CM field"));
    g = n/2;
    K = nfinit(f);
    if(K.r1 != 0,error("expected CM field"));
    arr = [F[1] | F <- nfsubfields(K,g), nfinit(F[1]).r1 == g];
    if(length(arr) != 1,error("expected CM field"));
    return(polredbest(arr[1]));
}

/*
Given a polynomial defining a numberfield, returns the index norm
equation for that field.
*/
nfindexnormeq(f) = {
    local(F,n,B,eta);
    n = poldegree(f);
    F = nfinit(Pol(Col(polredbest(f)),'a));
    B = F.zk;
    \\ genmat(u,v) = matrix(u,v,i,j, );
    eta = sum(n,k,eval(Str("x",k))*B[k]);
    matrix(n,n,i,j,eta^(i+j-2));
}

/*
Given a number field F, this returns
a set T of elements ets such that O_F = Z[eta].
The set T is complete up to integer translation.
*/
monogenicgens(F) = {
    local();
    if(poldegree(F.pol) == 1,
        return([1])
    );
    if(poldegree(F.pol) == 2,
        return(nfroots(F,'x^2 - F.disc*'x + F.disc*(F.disc - 1)/4));
    );
    if(poldegree(F.pol) == 3,
        if(F.zk[1] != 1,error("expected 1 as first element in basis"));
        
    );
    error("Unimplemented for degree > 3");
        return ((F.disc() + sqrt(F.disc()))/2).minpoly().roots(ring=F,multiplicities=False)
}

\\ Generates maximal real subfield F
f1 = Pol(Col(cmrealsubfield(f)),'bb);
\\ Generated relative extension K/F
f2 = Pol(Col(nffactor(f1,f)[1,1]),'aa);
\\ Construct field extensions
F = bnfinit(f1);
K = rnfinit(F,f2);
\\ Find gamma such that O_K = O_F[gamma]
if(rnfalgtobasis(K,1) != [1,0]~,error("expected 1 as first element in basis"));
\\ Variable name "gamma" doesn't work
gama = rnfbasistoalg(K,[0,1]~);
print(gama);





