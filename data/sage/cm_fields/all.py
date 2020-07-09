from pathlib import Path
from os import listdir
from os.path import isfile

from sage.rings.integer_ring import ZZ
from sage.rings.number_field.number_field import NumberField
from sage.misc.sage_eval import sage_eval

R = ZZ['x']
x = R.gen()
path = Path(__file__).parent

CM_FIELDS = {}

for fn in [fn for fn in listdir(path) if isfile(path / fn) and fn.startswith("cm_fields_")]:
    with open(path / fn) as f:
        s = "\n".join(l for l in f.read().splitlines() if not l.startswith("#"))
        for g in sage_eval(s,locals={"x":x}):
            d = g.degree()
            if d not in CM_FIELDS:
                CM_FIELDS[d] = []
            CM_FIELDS[d].append(NumberField(g,f"a_{d}_{len(CM_FIELDS[d])+1}"))

assert len(CM_FIELDS[2]) == 9
assert len(CM_FIELDS[4]) == 91
assert len(CM_FIELDS[6]) == 403
#for d,arr in CM_FIELDS.items():
#    assert all(K.is_CM() and K.class_number() == 1 for K in arr)
#    assert all(not L1.is_isomorphic(L2) for L1,L2 in Subsets(arr,2))
