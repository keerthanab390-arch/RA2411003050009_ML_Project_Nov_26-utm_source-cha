import json
import re

with open('src/data/framesData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for frame objects
frame_blocks = re.findall(r"\{\s*id:\s*['\"]([^'\"]+)['\"].*?name:\s*['\"]([^'\"]+)['\"].*?style:\s*['\"]([^'\"]+)['\"].*?shape:\s*['\"]([^'\"]+)['\"].*?color:\s*['\"]([^'\"]+)['\"].*?size:\s*['\"]([^'\"]+)['\"].*?price:\s*(\d+)", content, re.DOTALL)

frames = []
for block in frame_blocks:
    frames.append({
        'id': block[0],
        'name': block[1],
        'style': block[2],
        'shape': block[3],
        'color': block[4],
        'size': block[5],
        'price': int(block[6])
    })

print(f"Extracted {len(frames)} frames.")
with open('ml/data/catalogue_reference.json', 'w', encoding='utf-8') as f:
    json.dump(frames, f, indent=2)
print("Saved to ml/data/catalogue_reference.json")
