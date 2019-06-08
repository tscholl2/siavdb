f = x^3 + 7*x^2 - 2*x + 1;
n = poldegree(f);
F = nfinit(Pol(Col(f),'a));
X = [eval(Str("x",i)) | i <- vector(n,i,i)];
etta = sum(i=2,n,X[i]*F.zk[i]);
Tr (g) =
{
    local(t,V,c,x);
    t = 0;
    V = vector(n-1,i,[0,2*n]);
    forvec(v=V,
        c = g;
        for(i=2,n,
            c = polcoef(c,v[i-1],X[i]);
        );
        c = nfelttrace(F,c);
        x = 1;
        for(i=2,n,
            x = x*X[i]^v[i-1];
        );
        t = t + x*c;
    );
    return(t);
}
A = matrix(n,n,i,j,Tr(etta^(i-1)*etta^(j-1)));
D = matdet(A);
D = D/F.disc;
idxform = vecprod([d[1]^(d[2]/2) | d <- factor(D)~]);
print("idxform = ",idxform);

tnf = thueinit(subst(idxform,'x2,1),1);
print(thue(tnf,1));
print(thue(tnf,-1));