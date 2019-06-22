f = x^4 - 29*x^3 + 331*x^2 - 1769*x + 3721;

g = poldegree(f)/2;
p = divisors(polcoef(f,0))[2];
a = logint(polcoef(f,0),p)/g;
q = p^a;
K = nfinit(f);
pi = Mod(x,f);
pibar = Mod(q/x,f);

print_que = List();

\\ Weil stuff

    listput(print_que,["f",Strprintf("\"%s\"",f)]);
    listput(print_que,["p",Strprintf("\"%s\"",p)]);
    listput(print_que,["a",Strprintf("\"%s\"",a)]);
    listput(print_que,["q",Strprintf("\"%s\"",q)]);
croots = polroots(f);
    listput(print_que,["croots",[Str(z) | z <- croots]]);
proots = polrootspadic(f,p,3);
    listput(print_que,["proots",[Str(z) | z <- proots]]);

\\ AV stuff

    listput(print_que,["g",Strprintf("\"%s\"",g)]);
N = subst(f,x,1);
    listput(print_que,["N",Strprintf("\"%s\"",N)]);
NP = newtonpoly(f,p);
    listput(print_que,["NP",NP]);
Ap = sum(i=1,length(NP),if(NP[i] == 0,1,0));
    listput(print_que,["AP",Ap]);
OR = Ap == g;
    listput(print_que,["OR",OR]);
F = Mat(vector(2*g,i,nfalgtobasis(K,K.zk[i]*pi)));
    listput(print_que,["F",[F[i,1..2*g] | i <- [1..2*g]]]);
V = Mat(vector(2*g,i,nfalgtobasis(K,K.zk[i]*pibar)));
    listput(print_que,["V",[V[i,1..2*g] | i <- [1..2*g]]]);
\\ TODO: check this
PP = !(g%2 == 0 && nfeltnorm(K,pi-pibar) == 1 && polcoef(f,g)%if(q==2,4,q) == if(q==2,3,q-1));
    listput(print_que,["PP",PP]);

\\ K stuff

Kf = polredbest(K);
Kh = polredbest(subst(factor(charpoly(Mod(x+q/x,f)))[1,1],x,y))
F = nfinit(Kh);
    listput(print_que,["Kf",Strprintf("\"%s\"",Kf)]);
    listput(print_que,["K+f",Strprintf("\"%s\"",Kh)]);
    listput(print_que,["Kdisc",K.disc]);
    listput(print_que,["K+disc",F.disc]);
    listput(print_que,["Kdeg",2*g]);
    listput(print_que,["K+deg",g]);


print("{");
[print("\"",kv[1],"\": ",kv[2],",") | kv <- print_que];
print("}");