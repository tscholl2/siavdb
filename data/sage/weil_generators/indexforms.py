from pathlib import Path
from sage.misc.persist import load

path = Path(__file__).parent
indexforms = load(path / "indexforms.sobj")
