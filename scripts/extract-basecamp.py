#!/usr/bin/env python3
"""
Build the member -> current Pathway database from a Base Camp Manager
Dashboard export (the "Paths Currently in Progress" table is the reliable part).

    python scripts/extract-basecamp.py "Base Camp Manager Dashboard all members.md" [members.json]

Writes data/member-pathways.json (git-ignored — contains member names):
    [{name, credential, pathsInProgress:[{path, levels, done, total}], currentPath}]

`currentPath` = the in-progress path with the most completed projects (a good
proxy for "the path this member is actively working on now").
Re-run whenever members advance so the roster's Pathway info stays current.
"""
import sys, os, re, json, difflib

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "data")


def main(md_path, members_path=None):
    raw = open(md_path, encoding='utf-8').read().replace('\\--', '').strip()
    _, _, prog = raw.partition('Paths Currently in Progress')
    lines = [l.strip() for l in prog.split('\n')]

    members = {}
    i = 0
    while i < len(lines):
        m = re.match(r'^\[(.+?)\]\(', lines[i])
        if not m:
            i += 1; continue
        name = m.group(1).strip()
        j = i + 1
        while j < len(lines) and not lines[j]:
            j += 1
        path_name = lines[j] if j < len(lines) else ''
        levels, done, total, k, seen = [], 0, 0, j + 1, 0
        while k < len(lines) and seen < 6:
            if re.match(r'^\[', lines[k]):
                break
            mm = re.match(r'^(\d+) of (\d+)$', lines[k])
            if mm:
                levels.append(lines[k]); done += int(mm.group(1)); total += int(mm.group(2)); seen += 1
            k += 1
        members.setdefault(name, {'name': name, 'credential': '', 'pathsInProgress': []})
        members[name]['pathsInProgress'].append({'path': path_name, 'levels': levels, 'done': done, 'total': total})
        i = j

    # merge credentials from the roster (members.json) by fuzzy name match
    roster = []
    mp = members_path or os.path.join(OUT, 'members.json')
    if os.path.exists(mp):
        roster = json.load(open(mp, encoding='utf-8'))

    def cred_for(name):
        names = [r['name'] for r in roster]
        hit = difflib.get_close_matches(name, names, n=1, cutoff=0.6)
        if hit:
            return next(x['credentials'] for x in roster if x['name'] == hit[0])
        # token overlap fallback
        nt = set(name.lower().split())
        best, bestc = None, 0
        for x in roster:
            c = len(nt & set(x['name'].lower().split()))
            if c > bestc:
                bestc, best = c, x
        return best['credentials'] if best and bestc >= 1 else ''

    out = []
    for r in members.values():
        r['credential'] = cred_for(r['name'])
        # currentPath = in-progress path with the most completed projects
        active = sorted(r['pathsInProgress'], key=lambda p: p['done'], reverse=True)
        r['currentPath'] = active[0]['path'] if active and active[0]['done'] else (active[0]['path'] if active else '')
        out.append(r)
    out.sort(key=lambda x: x['name'])

    os.makedirs(OUT, exist_ok=True)
    json.dump(out, open(os.path.join(OUT, 'member-pathways.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    # This file has no emails, so a public copy is committed & deployed (GitHub Pages).
    json.dump(out, open(os.path.join(OUT, 'member-pathways.public.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f"  data/member-pathways.json + .public.json ({len(out)} members)")
    for r in out:
        print(f"   {r['name']:20} {r['credential'] or '-':10} {r['currentPath']}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit("Usage: python scripts/extract-basecamp.py <dashboard.md> [members.json]")
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
