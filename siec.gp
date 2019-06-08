nextsiec(M) =
{
  local(DISCS,a,b,d,q,t);
  DISCS = [3, 4, 7, 8, 11, 19, 43, 67, 163];
  if(M < 1681,error("M must be at least 1681"));
  a = ceil(sqrt(4*M - 163));
  b = 2*a; \\ should be far enough
  for(t=a,b,for(i=1,length(DISCS),
    d = DISCS[i];
    q = t^2 + d;
    if(q%4 != 0,next);
    q = q/4;
    if(ispseudoprime(q),return([[q,t,1],[q,-t,1]]));
  ););
  error("SIEC not found, increase search space.");
}

M = 20000000000000000000000;
print(Polrev(nextsiec(M)[1],'x));
