import json
import re

with open('src/data/framesData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract frame objects
styles = set(re.findall(r"style:\s*['\"]([^'\"]+)['\"]", content))
colors = set(re.findall(r"color:\s*['\"]([^'\"]+)['\"]", content))
shapes = set(re.findall(r"shape:\s*['\"]([^'\"]+)['\"]", content))
prices = [int(p) for p in re.findall(r"price:\s*(\d+)", content)]
ids = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", content)

print("Total frames found:", len(ids))
print("Frame IDs:", ids[:5], "...", ids[-5:])
print("Styles:", sorted(styles))
print("Colors:", sorted(colors))
print("Shapes:", sorted(shapes))
print(f"Price range: min={min(prices)}, max={max(prices)}, avg={sum(prices)/len(prices):.1f}")
