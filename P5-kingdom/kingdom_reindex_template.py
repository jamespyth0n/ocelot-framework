
"""
kingdom_reindex_template.py — G3.16
════════════════════════════════════
Ocelot Framework v2 — Kingdom Reindexer (Generic Template)

Barcode:  8.03.002.v1
Gate:     G3.16
Campaign: Seed v2.1 — The Rubik's Solve

PURPOSE:
  Regenerate kingdom_index.json from the organized folder structure.
  Walks all Dewey folders, computes metadata for each file,
  compares against existing index, adds new entries, preserves old ones.

HOW IT WORKS:
  1. Loads existing kingdom_index.json (if present)
  2. Walks all Dewey folders (0_genesis/ through 9_campaigns/)
  3. For each file: UUID, SHA256, Dewey class from path, size, timestamps
  4. Compares against existing index by filename + SHA256
  5. New files → added. Changed files → updated. Deleted files → marked.
  6. Writes updated kingdom_index.json
  7. Reports: added, updated, unchanged, orphaned

USAGE:
  python kingdom_reindex_template.py

  Prompts:
    - Path to Kingdom root (where 0_genesis/ through 9_campaigns/ live)

NOTE:
  This is the GENERIC TEMPLATE for the public repo (P5-kingdom/).
  Your personal copy with real paths lives in P6-library/ (never pushed to git).
"""

import os
import json
import hashlib
import uuid
from datetime import datetime, timezone


# ── SECTION 1: DEWEY CLASS MAP ────────────────────────────────
# Maps folder prefixes to class numbers and names.

DEWEY_CLASS_MAP = {
    "0_genesis":     {"class": 0, "class_name": "genesis"},
    "1_identity":    {"class": 1, "class_name": "identity"},
    "2_governance":  {"class": 2, "class_name": "governance"},
    "3_history":     {"class": 3, "class_name": "history"},
    "4_philosophy":  {"class": 4, "class_name": "philosophy"},
    "5_engineering": {"class": 5, "class_name": "engineering"},
    "6_knowledge":   {"class": 6, "class_name": "knowledge"},
    "7_literature":  {"class": 7, "class_name": "literature"},
    "8_tools":       {"class": 8, "class_name": "tools"},
    "9_campaigns":   {"class": 9, "class_name": "campaigns"},
}

# Folders to skip during walk
SKIP_FOLDERS = {"_triage", ".git", "__pycache__", "node_modules", ".vscode", "csv", "dups"}

# File extensions to index
INDEX_EXTENSIONS = {".md", ".json", ".ts.md", ".ts", ".py", ".ps1", ".html", ".txt"}


# ── SECTION 2: SHA256 HASHER ──────────────────────────────────

def compute_sha256(filepath):
    """Compute SHA256 hash of a file."""
    sha = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha.update(chunk)
        return sha.hexdigest()
    except Exception:
        return "error"


# ── SECTION 3: DEWEY RESOLVER ─────────────────────────────────

def resolve_dewey(rel_path, kingdom_root):
    """
    Resolve Dewey class, section, and target_folder from relative path.
    Returns dict with class, class_name, section, target_folder.
    """
    parts = rel_path.replace("\\", "/").split("/")

    result = {
        "class": -1,
        "class_name": "unknown",
        "section": "00",
        "section_name": "",
        "target_folder": ""
    }

    if not parts:
        return result

    # Match top-level folder to Dewey class
    top_folder = parts[0]
    for prefix, info in DEWEY_CLASS_MAP.items():
        if top_folder.startswith(prefix) or top_folder == prefix:
            result["class"] = info["class"]
            result["class_name"] = info["class_name"]
            break

    # Extract section from second-level folder (e.g., 01_conn_logs)
    if len(parts) >= 2:
        section_folder = parts[1]
        section_match = section_folder.split("_")[0] if "_" in section_folder else "00"
        if section_match.isdigit():
            result["section"] = section_match.zfill(2)
            result["section_name"] = "_".join(section_folder.split("_")[1:])

    # Build target_folder
    if len(parts) >= 2:
        result["target_folder"] = "/".join(parts[:2]) + "/"
    elif len(parts) == 1:
        result["target_folder"] = parts[0] + "/"

    return result


# ── SECTION 4: FRONTMATTER READER ─────────────────────────────

def read_frontmatter_barcode(filepath):
    """
    Read barcode_a and doc_id from YAML frontmatter (for .md files).
    Returns dict with barcode_a and doc_id, or empty dict.
    """
    result = {}
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            first_line = f.readline().strip()
            if first_line != "---":
                return result
            for line in f:
                line = line.strip()
                if line == "---":
                    break
                if line.startswith("barcode_a:"):
                    result["barcode_a"] = line.split(":", 1)[1].strip().strip('"').strip("'")
                elif line.startswith("doc_id:"):
                    result["doc_id"] = line.split(":", 1)[1].strip().strip('"').strip("'")
    except Exception:
        pass
    return result


def read_json_meta_barcode(filepath):
    """
    Read barcode_a and doc_id from JSON _meta block.
    Returns dict with barcode_a and doc_id, or empty dict.
    """
    result = {}
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            data = json.load(f)
            if isinstance(data, dict) and "_meta" in data:
                meta = data["_meta"]
                if "barcode_a" in meta:
                    result["barcode_a"] = meta["barcode_a"]
                if "doc_id" in meta:
                    result["doc_id"] = meta["doc_id"]
    except Exception:
        pass
    return result


# ── SECTION 5: SEQUENCE COUNTER ────────────────────────────────

class SequenceCounter:
    """
    Tracks per-section sequence numbers for barcode generation.
    Reads existing index to find the highest sequence per section.
    """
    def __init__(self, existing_entries):
        self.counters = {}
        for entry in existing_entries:
            bc = entry.get("barcode_a", "")
            if bc and "." in bc:
                parts = bc.split(".")
                if len(parts) >= 3:
                    key = f"{parts[0]}.{parts[1]}"
                    try:
                        seq = int(parts[2])
                        self.counters[key] = max(self.counters.get(key, 0), seq)
                    except ValueError:
                        pass

    def next_seq(self, dewey_class, section):
        key = f"{dewey_class}.{section}"
        current = self.counters.get(key, 0)
        self.counters[key] = current + 1
        return self.counters[key]


# ── SECTION 6: INDEX BUILDER ──────────────────────────────────

def build_index(kingdom_root, existing_index):
    """
    Walk the Kingdom folder tree and build the index.
    Returns list of index entries.
    """
    existing_by_path = {}
    for entry in existing_index:
        key = entry.get("rel_path", entry.get("file", ""))
        if key:
            existing_by_path[key] = entry

    seq_counter = SequenceCounter(existing_index)
    new_index = []
    stats = {"added": 0, "updated": 0, "unchanged": 0}
    timestamp = datetime.now(timezone.utc).isoformat()

    for dirpath, dirnames, filenames in os.walk(kingdom_root):
        # Skip excluded folders
        dirnames[:] = [d for d in dirnames if d not in SKIP_FOLDERS]

        for fn in sorted(filenames):
            filepath = os.path.join(dirpath, fn)
            ext = os.path.splitext(fn)[1].lower()

            # Handle .ts.md double extension
            if fn.endswith(".ts.md"):
                ext = ".ts.md"

            if ext not in INDEX_EXTENSIONS:
                continue

            rel_path = os.path.relpath(filepath, kingdom_root).replace("\\", "/")
            sha256 = compute_sha256(filepath)
            size_bytes = os.path.getsize(filepath)
            dewey = resolve_dewey(rel_path, kingdom_root)

            # Check if file exists in current index
            existing = existing_by_path.get(rel_path)

            if existing and existing.get("sha256") == sha256:
                # Unchanged — preserve existing entry
                new_index.append(existing)
                stats["unchanged"] += 1
                continue

            # Read barcode from frontmatter/meta if available
            embedded = {}
            if ext == ".md" or ext == ".ts.md":
                embedded = read_frontmatter_barcode(filepath)
            elif ext == ".json":
                embedded = read_json_meta_barcode(filepath)

            # Generate barcode if not embedded
            barcode_a = embedded.get("barcode_a", "")
            if not barcode_a:
                seq = seq_counter.next_seq(dewey["class"], dewey["section"])
                barcode_a = f"{dewey['class']}.{dewey['section']}.{str(seq).zfill(3)}.v1"

            doc_id = embedded.get("doc_id", "")

            entry = {
                "id": existing.get("id", str(uuid.uuid4())) if existing else str(uuid.uuid4()),
                "file": fn,
                "rel_path": rel_path,
                "ext": ext,
                "size_bytes": size_bytes,
                "sha256": sha256,
                "barcode_a": barcode_a,
                "doc_id": doc_id,
                "class": dewey["class"],
                "class_name": dewey["class_name"],
                "section": dewey["section"],
                "section_name": dewey["section_name"],
                "target_folder": dewey["target_folder"],
                "indexed_at": existing.get("indexed_at", timestamp) if existing else timestamp,
                "updated_at": timestamp if existing else "",
                "status": "active",
                "readable": ext in {".md", ".json", ".ts.md", ".txt"}
            }

            new_index.append(entry)

            if existing:
                stats["updated"] += 1
                print(f"  [UPDATED] {rel_path}")
            else:
                stats["added"] += 1
                print(f"  [NEW]     {rel_path}")

    # Detect orphans (files in old index but not on disk)
    new_paths = {e["rel_path"] for e in new_index}
    orphans = []
    for entry in existing_index:
        rp = entry.get("rel_path", "")
        if rp and rp not in new_paths:
            entry["status"] = "orphaned"
            entry["orphaned_at"] = timestamp
            orphans.append(entry)
            print(f"  [ORPHAN]  {rp}")

    return new_index, orphans, stats


# ── SECTION 7: MAIN ───────────────────────────────────────────

def main():
    print("=" * 60)
    print("  KINGDOM REINDEXER — Ocelot Framework v2")
    print("=" * 60)

    # Get Kingdom root
    kingdom_root = input("\nPath to Kingdom root: ").strip().strip('"')
    if not os.path.isdir(kingdom_root):
        print(f"[ERROR] Not a valid directory: {kingdom_root}")
        return

    # Load existing index
    index_path = os.path.join(kingdom_root, "kingdom_index.json")
    existing_index = []

    if os.path.exists(index_path):
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and "entries" in data:
                    existing_index = data["entries"]
                elif isinstance(data, list):
                    existing_index = data
            print(f"\n[INFO] Loaded existing index: {len(existing_index)} entries")
        except Exception as e:
            print(f"\n[WARN] Could not read existing index: {e}")
            print("       Starting fresh.\n")
    else:
        print("\n[INFO] No existing index found. Building from scratch.\n")

    # Walk and build
    print("\n[STEP 1] Walking Kingdom folders...\n")

    new_index, orphans, stats = build_index(kingdom_root, existing_index)

    # Build output
    output = {
        "_meta": {
            "spec": "kingdom_index",
            "version": "2.0.0",
            "framework": "ocelot-framework",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "kingdom_root": kingdom_root,
            "total_entries": len(new_index),
            "total_orphans": len(orphans)
        },
        "entries": new_index,
        "orphans": orphans
    }

    # Write index
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Per-class summary
    class_counts = {}
    for entry in new_index:
        cn = entry.get("class_name", "unknown")
        class_counts[cn] = class_counts.get(cn, 0) + 1

    # Report
    print(f"\n{'=' * 60}")
    print(f"  KINGDOM REINDEXER — COMPLETE")
    print(f"{'=' * 60}")
    print(f"  Total indexed   : {len(new_index)}")
    print(f"  New entries      : {stats['added']}")
    print(f"  Updated entries  : {stats['updated']}")
    print(f"  Unchanged        : {stats['unchanged']}")
    print(f"  Orphaned         : {len(orphans)}")
    print(f"  Index written to : {index_path}")
    print(f"\n  Per-class breakdown:")
    for cn in sorted(class_counts.keys()):
        print(f"    {cn:20s} : {class_counts[cn]}")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()

