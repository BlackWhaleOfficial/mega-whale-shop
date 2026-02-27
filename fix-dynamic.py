import os
import glob
from pathlib import Path

base_dir = "/Users/Khoa/.gemini/antigravity/scratch/Mega Whale Shop/src/app/api"
for path in Path(base_dir).rglob("route.ts"):
    with open(path, "r") as f:
        content = f.read()
    
    if "export const dynamic" in content:
        continue
        
    if "export " in content:
        lines = content.splitlines()
        for i, line in enumerate(lines):
            if line.strip().startswith("export "):
                lines.insert(i, "export const dynamic = 'force-dynamic';")
                break
        with open(path, "w") as f:
            f.write("\n".join(lines) + "\n")
        print(f"Fixed {path}")

