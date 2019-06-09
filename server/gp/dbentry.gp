f = x^4 - 29*x^3 + 331*x^2 - 1769*x + 3721;

g = poldegree(f)/2;
D = nfdisc(f);
p = divisors(polcoef(f,0))[2];
a = logint(polcoef(f,0),p)/g;
q = p^a;
N = subst(f,x,1);
h = subst(factor(charpoly(Mod(x+q/x,f)))[1,1],x,y);
NP = newtonpoly(f,p);
Ap = sum(i=1,length(NP),if(NP[i] == 0,1,0));
OR = Ap == gl;
nf = nfinit(f);
pi = Mod(x,f);
pibar = Mod(q/x,f)
F = Mat(vector(2*g,i,nfalgtobasis(nf,nf.zk[i]*pi)));
V = Mat(vector(2*g,i,nfalgtobasis(nf,nf.zk[i]*pibar)));
PP = !(g%2 == 0 && nfeltnorm(nf,pi-pibar) == 1 && polcoef(f,g)%if(q==2,4,q) == if(q==2,3,q-1));
print("{")
print("\"f\":\"",f,"\",");
print("\"zz\":\"",zz,"\",");
print("\"D\":\"",D,"\",");
print("\"p\":\"",p,"\",");
print("\"a\":\"",a,"\",");
print("\"q\":\"",q,"\",");
print("\"N\":\"",N,"\",");
print("\"h\":\"",h,"\",");
print("\"NP\":\"",NP,"\",");
print("\"Ap\":\"",Ap,"\",");
print("\"OR\":\"",OR,"\",");
print("\"F\":\"",[F[i,1..2*g] | i <- [1..2*g]],"\",");
print("\"V\":\"",[V[i,1..2*g] | i <- [1..2*g]],"\",");
print("\"PP\":\"",PP,"\"");
print("}");