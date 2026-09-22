#!/usr/bin/env python3
"""
Sync Google Drive "Meeting Appointment Holders" sheet into data/appointments-sheet.csv
File ID: 18lylRf1_-ttqsf5SkivKhvk5yzI72lnc
Tab: Meeting Appointment Holders
"""
import os
import sys
import zipfile
import xml.etree.ElementTree as ET
import csv
import subprocess

FILE_ID = '18lylRf1_-ttqsf5SkivKhvk5yzI72lnc'
XLSX_TMP = '/tmp/program_plan.xlsx'
OUTPUT_CSV = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'appointments-sheet.csv')

# Meeting dates mapping for columns B..Q
COLS = ['B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q']
DATES = [
    '2025-07-11','2025-08-08','2025-09-12','2025-10-10','2025-11-14','2025-12-12',
    '2026-01-09','2026-02-13','2026-03-13','2026-04-10','2026-05-08','2026-06-12',
    '2026-07-10','2026-08-14','2026-09-11','2026-10-09'
]

def sync():
    if not os.path.exists(XLSX_TMP):
        print(f"Attempting to download latest spreadsheet {FILE_ID}...")
        try:
            url = f"https://drive.google.com/uc?export=download&id={FILE_ID}"
            cmd = ['curl', '-sL', url, '-o', XLSX_TMP]
            subprocess.run(cmd, check=True)
        except Exception as e:
            print(f"Download error: {e}")

    if not os.path.exists(XLSX_TMP):
        print(f"Cannot find {XLSX_TMP}")
        sys.exit(1)

    with zipfile.ZipFile(XLSX_TMP) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            with z.open('xl/sharedStrings.xml') as f:
                stree = ET.parse(f)
                for si in stree.getroot().iter():
                    if si.tag.endswith('si'):
                        text = ''.join([t.text or '' for t in si.iter() if t.tag.endswith('t')])
                        strings.append(text)

        rows = {}
        with z.open('xl/worksheets/sheet2.xml') as f:
            tree = ET.parse(f)
            for row in tree.getroot().iter():
                if row.tag.endswith('row'):
                    r_num = int(row.attrib.get('r'))
                    row_vals = {}
                    for c in row:
                        ref = c.attrib.get('r')
                        col = ''.join([ch for ch in ref if ch.isalpha()])
                        t = c.attrib.get('t')
                        v = ''
                        for child in c:
                            if child.tag.endswith('v'):
                                v = child.text
                        if t == 's' and v and int(v) < len(strings):
                            val = strings[int(v)]
                        else:
                            val = v
                        row_vals[col] = val
                    rows[r_num] = row_vals

    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Meeting Dates'] + DATES)
        for r in range(2, max(rows.keys()) + 1):
            if r not in rows:
                continue
            role_label = rows[r].get('A', '').strip()
            cell_vals = [rows[r].get(c, '').strip() for c in COLS]
            if role_label or any(cell_vals):
                writer.writerow([role_label] + cell_vals)

    print(f"Successfully generated {OUTPUT_CSV}")

if __name__ == '__main__':
    sync()
