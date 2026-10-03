import json
import pathlib
import sys
from pypdf import PdfReader

root = pathlib.Path(sys.argv[1])
result = {}
for file in root.rglob('*.pdf'):
    key = file.relative_to(root).as_posix()
    try:
        reader = PdfReader(str(file), strict=False)
        page_total = len(reader.pages)
        sample_count = min(3, page_total)
        text = ' '.join((reader.pages[index].extract_text() or '') for index in range(sample_count))
        result[key] = {'page_count': page_total, 'sample_chars_per_page': len(' '.join(text.split())) / max(1, sample_count)}
    except Exception:
        result[key] = {'page_count': None, 'sample_chars_per_page': None}
print(json.dumps(result))
