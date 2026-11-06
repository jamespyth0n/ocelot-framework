
"""
kingdom_sorter_template.py — G3.15
═══════════════════════════════════
Ocelot Framework v2 — Kingdom Sorter (Generic Template)

Barcode:  8.03.001.v1
Gate:     G3.15
Campaign: Seed v2.1 — The Rubik's Solve

PURPOSE:
  Sort unsorted files from _triage/ (or any staging folder)
  into Dewey-classified Kingdom folders.

HOW IT WORKS:
  1. Scans the staging folder for .md and .json files
  2. Reads YAML frontmatter (if present) for target_folder
  3. Falls back to filename pattern matching (Spaghetti Cheat Sheet)
  4. Moves files to their classified Dewey folder
  5. Logs every action to sort_log.json
  6. Files it can't classify stay in _triage/

USAGE:
  python kingdom_sorter_template.py

  Prompts:
    - Path to Kingdom root (where 0_genesis/ through 9_campaigns/ live)
    - Path to staging folder (default: _triage/ inside Kingdom root)

NOTE:
  This is the GENERIC TEMPLATE for the public repo (P5-kingdom/).
  Your personal copy with real paths lives in P6-library/ (never pushed to git).
"""

import os
import re
import json
import shutil
from datetime import datetime, timezone


# ── SECTION 1: DEWEY PATTERN MAP ──────────────────────────────
# The Spaghetti Cheat Sheet — filename patterns → Dewey folders
# Customize this for your Kingdom. Order matters — first match wins.

PATTERN_MAP = [
    # 0_genesis
    (r"^README",                          "0_genesis/"),
    (r"^LICENSE",                         "0_genesis/"),
    (r"^ROADMAP",                         "0_genesis/"),
    (r"^PROJECT_CHARTER",                 "0_genesis/"),
    (r"^manifesto",                       "0_genesis/"),

    # 1_identity
    (r"personality",                      "1_identity/01_personality/"),
    (r"creed",                            "1_identity/02_creed/"),
    (r"voice|human_voice",               "1_identity/03_voices/"),
    (r"slang|vocab",                      "1_identity/04_language/"),
    (r"memoir",                           "1_identity/05_memoir/"),

    # 2_governance
    (r"commandment|six_commandments",     "2_governance/01_commandments/"),
    (r"red_line|redline",                 "2_governance/02_red_lines/"),
    (r"protocol|ceremony|ritual",         "2_governance/03_protocols/"),
    (r"policy|doc_control",               "2_governance/04_policies/"),
    (r"standard|quality",                 "2_governance/05_standards/"),

    # 3_history
    (r"conn_log|connection_log",          "3_history/01_conn_logs/"),
    (r"closing_conn",                     "3_history/02_closing_logs/"),
    (r"session_summary",                  "3_history/03_summaries/"),
    (r"milestone|timeline",              "3_history/04_milestones/"),

    # 4_philosophy
    (r"ocelot_thought",                   "4_philosophy/01_ocelot_thoughts/"),
    (r"cafe_diary|cafe_diaries",          "4_philosophy/02_cafe_diaries/"),
    (r"satori_retro",                     "4_philosophy/03_satori_retros/"),
    (r"tercero_memoir|sombra_memoir",     "4_philosophy/04_memoirs/"),
    (r"reflection|meditation",            "4_philosophy/05_reflections/"),

    # 5_engineering
    (r"_engine_.*\.ts",                   "5_engineering/01_engines/"),
    (r"_engine_.*\.ts\.md",               "5_engineering/01_engines/"),
    (r"flywheel|orchestrator",            "5_engineering/01_engines/"),
    (r"boot_sequence|boot_config",        "5_engineering/02_boot/"),
    (r"loader_manifest",                  "5_engineering/02_boot/"),
    (r"engine_registry",                  "5_engineering/03_registry/"),
    (r"kingdom_index",                    "5_engineering/04_index/"),
    (r"hook_registry|signal",             "5_engineering/05_hooks/"),
    (r"schema|barcode",                   "5_engineering/06_schemas/"),

    # 6_knowledge
    (r"concordance",                      "6_knowledge/01_concordance/"),
    (r"taxonomy|classification|dewey",    "6_knowledge/02_taxonomy/"),
    (r"shelf|SHELF",                      "6_knowledge/03_shelves/"),
    (r"quote|BoQ",                        "6_knowledge/04_quotes/"),
    (r"research|dossier",                 "6_knowledge/05_research/"),

    # 7_literature
    (r"thesis|chapter|ch\d+",             "7_literature/01_thesis/"),
    (r"book|episode|ep\d+",              "7_literature/02_books/"),
    (r"article|blog",                     "7_literature/03_articles/"),
    (r"QUICKSTART|EXPLAIN|README",        "7_literature/04_guides/"),
    (r"ARCHITECTURE|API_REFERENCE",       "7_literature/04_guides/"),

    # 8_tools
    (r"\.py$",                            "8_tools/01_scripts/"),
    (r"\.ps1$",                           "8_tools/01_scripts/"),
    (r"config\.json",                     "8_tools/02_configs/"),
    (r"template",                         "8_tools/03_templates/"),
    (r"SCADA|scada",                      "8_tools/04_scada/"),

    # 9_campaigns
    (r"CAMPAIGN_CHARTER|charter",         "9_campaigns/01_charters/"),
    (r"campaign_plan|AoW",               "9_campaigns/02_plans/"),
    (r"campaign_log|battle_log",          "9_campaigns/03_logs/"),
    (r"retro|retrospective",             "9_campaigns/04_retros/"),
]


# ── SECTION 2: FRONTMATTER READER ─────────────────────────────

def read_frontmatter(filepath):
    """
    Read YAML-style frontmatter from a .md file.
    Returns dict of frontmatter fields, or empty dict if none found.
    Frontmatter is delimited by --- on first line and next ---.
    """
    frontmatter = {}
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            first_line = f.readline().strip()
            if first_line != "---":
                return frontmatter

            for line in f:
                line = line.strip()
                if line == "---":
                    break
                if ":" in line:
                    key, _, value = line.partition(":")
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if value:
                        frontmatter[key] = value
    except Exception:
        pass

    return frontmatter


def read_json_meta(filepath):
    """
    Read _meta block from a .json file.
    Returns dict of _meta fields, or empty dict if none found.
    """
    meta = {}
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            data = json.load(f)
            if isinstance(data, dict) and "_meta" in data:
                meta = data["_meta"]
    except Exception:
        pass

    return meta


# ── SECTION 3: PATTERN MATCHER ─────────────────────────────────

def classify_by_pattern(filename):
    """
    Match filename against PATTERN_MAP.
    Returns target_folder string or None if no match.
    """
    for pattern, folder in PATTERN_MAP:
        if re.search(pattern, filename, re.IGNORECASE):
            return folder
    return None


# ── SECTION 4: CLASSIFIER ─────────────────────────────────────

def classify_file(filepath, filename):
    """
    Classify a file using this priority:
      1. YAML frontmatter target_folder (for .md files)
      2. JSON _meta target_folder (for .json files)
      3. Filename pattern matching (Spaghetti Cheat Sheet)
      4. None → stays in _triage/
    Returns (target_folder, method) tuple.
    """
    ext = os.path.splitext(filename)[1].lower()

    # Priority 1: Frontmatter (for .md files)
    if ext == ".md":
        fm = read_frontmatter(filepath)
        if fm.get("target_folder"):
            return fm["target_folder"], "frontmatter"

    # Priority 2: JSON _meta (for .json files)
    if ext == ".json":
        meta = read_json_meta(filepath)
        if meta.get("target_folder"):
            return meta["target_folder"], "json_meta"

    # Priority 3: Filename pattern
    folder = classify_by_pattern(filename)
    if folder:
        return folder, "pattern"

    # Priority 4: Unclassified
    return None, "unclassified"


# ── SECTION 5: MOVER ──────────────────────────────────────────

def move_file(src, dst_dir, filename, dry_run=False):
    """
    Move a file from src to dst_dir.
    Creates dst_dir if it doesn't exist.
    Returns True if moved, False if skipped.
    """
    dst = os.path.join(dst_dir, filename)

    if os.path.exists(dst):
        return False  # already there

    if not dry_run:
        os.makedirs(dst_dir, exist_ok=True)
        shutil.move(src, dst)

    return True


# ── SECTION 6: SORT LOG ───────────────────────────────────────

def write_sort_log(log_entries, kingdom_root):
    """
    Write sort_log.json to kingdom root.
    Appends to existing log if present.
    """
    log_path = os.path.join(kingdom_root, "sort_log.json")

    existing = []
    if os.path.exists(log_path):
        try:
            with open(log_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = []

    existing.extend(log_entries)

    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)


# ── SECTION 7: MAIN ───────────────────────────────────────────

def main():
    print("=" * 60)
    print("  KINGDOM SORTER — Ocelot Framework v2")
    print("=" * 60)

    # Get paths
    kingdom_root = input("\nPath to Kingdom root: ").strip().strip('"')
    if not os.path.isdir(kingdom_root):
        print(f"[ERROR] Not a valid directory: {kingdom_root}")
        return

    default_stage = os.path.join(kingdom_root, "_triage")
    stage_input = input(f"Path to staging folder [{default_stage}]: ").strip().strip('"')
    stage_dir = stage_input if stage_input else default_stage

    if not os.path.isdir(stage_dir):
        print(f"[ERROR] Staging folder not found: {stage_dir}")
        return

    dry_run_input = input("Dry run? (y/n) [n]: ").strip().lower()
    dry_run = dry_run_input == "y"

    if dry_run:
        print("\n[DRY RUN] No files will be moved.\n")

    # Scan staging folder
    print(f"\n[STEP 1] Scanning: {stage_dir}\n")

    files = []
    for fn in os.listdir(stage_dir):
        fp = os.path.join(stage_dir, fn)
        if os.path.isfile(fp):
            ext = os.path.splitext(fn)[1].lower()
            if ext in (".md", ".json"):
                files.append((fn, fp))

    print(f"  Found {len(files)} .md/.json files\n")

    if not files:
        print("[DONE] Nothing to sort.")
        return

    # Classify and move
    print("[STEP 2] Classifying and sorting...\n")

    moved = 0
    skipped = 0
    triage = 0
    log_entries = []
    timestamp = datetime.now(timezone.utc).isoformat()

    for fn, fp in files:
        target, method = classify_file(fp, fn)

        if target is None:
            triage += 1
            print(f"  [TRIAGE]  {fn}")
            log_entries.append({
                "file": fn,
                "action": "triage",
                "method": "unclassified",
                "timestamp": timestamp
            })
            continue

        dst_dir = os.path.join(kingdom_root, target)
        success = move_file(fp, dst_dir, fn, dry_run=dry_run)

        if success:
            moved += 1
            tag = "DRY" if dry_run else "MOVED"
            print(f"  [{tag}]    {fn} → {target}")
            log_entries.append({
                "file": fn,
                "action": "moved",
                "target": target,
                "method": method,
                "timestamp": timestamp
            })
        else:
            skipped += 1
            print(f"  [EXISTS]  {fn} → {target}")
            log_entries.append({
                "file": fn,
                "action": "skipped_exists",
                "target": target,
                "method": method,
                "timestamp": timestamp
            })

    # Write sort log
    if not dry_run:
        write_sort_log(log_entries, kingdom_root)

    # Report
    print(f"\n{'=' * 60}")
    print(f"  KINGDOM SORTER — {'DRY RUN ' if dry_run else ''}COMPLETE")
    print(f"{'=' * 60}")
    print(f"  Total scanned  : {len(files)}")
    print(f"  Moved          : {moved}")
    print(f"  Already existed : {skipped}")
    print(f"  Triage (manual) : {triage}")
    if not dry_run:
        print(f"  Sort log       : {os.path.join(kingdom_root, 'sort_log.json')}")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()

