#!/usr/bin/env python3
"""
Build the official project Purpose Statements + evaluation-form links.

For each Pathways project it downloads the official Toastmasters evaluation form
(publicly mirrored), reads the "Purpose Statement" and "Speech Length", and writes:

    data/pathways-objectives.json   { objectives: { project: {objective, timing} } }
    data/eval-forms.json            { project: {url, length} }

The PDFs themselves are NOT stored in the repo (they're copyrighted) — the sheet
links to the public URL. Only the short factual purpose text is embedded.

    python scripts/eval-forms.py            # fetch all + regenerate both JSONs
    python scripts/eval-forms.py <dir>      # also read any *.pdf you dropped in <dir>

Re-run whenever a member picks a project that isn't covered yet, or drop that
project's evaluation-form PDF into a folder and pass it as <dir>.
"""
import sys, os, re, json, glob, tempfile, urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "data")

# Official evaluation forms (public mirror). project title -> pdf url.
FORMS = {
 "Active Listening": "Active-Listening",
 "Building a Social Media Presence": "Building-a-Social-Media-Presence",
 "Communicate Change": "Communicate-Change",
 "Connect with Storytelling": "Connect-with-Storytelling",
 "Connect with Your Audience": "Connect-with-your-Audience",
 "Create a Podcast": "Create-a-Podcast",
 "Creating Effective Visual Aids": "Creating-Effective-Visual-Aids",
 "Cross-Cultural Understanding": "Cross-Cultural-Understanding",
 "Deliver Social Speeches": "Deliver-Social-Speeches",
 "Deliver Your Message with Humor": "Deliver-Your-Message-with-Humor",
 "Develop a Communication Plan": "Develop-a-Communications-Plan",
 "Develop Your Vision": "Develop-Your-Vision",
 "Effective Body Language": "Effective-Body-Language",
 "Engage Your Audience with Humor": "Engage-Your-Audience-with-Humor",
 "Ethical Leadership": "Ethical-Leadership",
 "Evaluation and Feedback": "Evaluation-and-Feedback-First-Speech",
 "Focus on the Positive": "Focus-on-the-Positive",
 "High Performance Leadership": "High-Performance-Leadership",
 "Ice Breaker": "Ice-Breaker",
 "Improvement Through Positive Coaching": "Improvement-Through-Positive-Coaching",
 "Inspire Your Audience": "Inspire-Your-Audience",
 "Introduction to Toastmasters Mentoring": "Introduction-to-Toastmasters-Mentoring",
 "Introduction to Vocal Variety and Body Language": "2022/04/Introduction-to-Vocal-Variety-and-Body-Language-1",
 "Know Your Sense of Humor": "Know-Your-Sense-of-Humor-1",
 "Lead in Any Situation": "Lead-in-Any-Situation",
 "Leading in Difficult Situations": "Leading-in-Difficult-Situations",
 "Leading in Your Volunteer Organization": "Leading-in-Your-Volunteer-Organization",
 "Leading Your Team": "Leading-Your-Team",
 "Lessons Learned": "Lessons-Learned",
 "Make Connections Through Networking": "Making-Connections-Through-Networking",
 "Manage Change": "Manage-Change",
 "Managing a Difficult Audience": "Manage-a-Difficult-Audience",
 "Manage Online Meetings": "Manage-Online-Meetings",
 "Manage Projects Successfully": "Manage-Projects-Successfully",
 "Manage Successful Events": "Manage-Successful-Events",
 "Managing Time": "Managing-Time",
 "Moderate a Panel Discussion": "Moderate-a-Panel-Discussion",
 "Motivate Others": "Motivate-Others",
 "Negotiate the Best Outcome": "Negotiate-the-Best-Outcome",
 "Persuasive Speaking": "Persuasive-Speaking",
 "Planning and Implementing": "Planning-and-Implementing",
 "Prepare for an Interview": "Prepare-for-an-Interview",
 "Prepare to Speak Professionally": "Prepare-to-Speak-Professionally",
 "Present a Proposal": "Present-a-Proposal",
 "Public Relations Strategies": "Public-Relations-Strategies",
 "Question-and-Answer Session": "Question-and-Answer-Session",
 "Reaching Consensus": "Reaching-Consensus-Assignment-Option-1-2",
 "Researching and Presenting": "Researching-and-Presenting",
 "Successful Collaboration": "Successful-Collaboration",
 "Team Building": "Team-Building",
 "The Power of Humor in an Impromptu Speech": "The-Power-of-Humor-In-an-Impromptu-Speech",
 "Understanding Conflict Resolution": "Understanding-Conflict-Resolution",
 "Understanding Emotional Intelligence": "Understanding-Emotional-Intelligence",
 "Understanding Vocal Variety": "Understanding-Vocal-Variety",
 "Understanding Your Communication Style": "Understanding-Your-Communication-Style",
 "Understanding Your Leadership Style": "Understanding-Your-Leadership-Style",
 "Using Descriptive Language": "Using-Descriptive-Language",
 "Using Presentation Software": "Using-Presentation-Software",
 "Write a Compelling Blog": "Write-a-Compelling-Blog",
 "Writing a Speech with Purpose": "2022/04/Writing-a-Speech-With-Purpose",
}
SITE = "https://westpinestoastmasters.toastmost.org/wp-content/uploads/sites/292/2021/04/"


def url_for(slug):
    return SITE + slug + ".pdf" if not slug.startswith("2022/") else \
        "https://westpinestoastmasters.toastmost.org/wp-content/uploads/sites/292/" + slug + ".pdf"


LEADINS = [
    "the purpose of this project is for the member to ",
    "the purpose of the speech is for the member to ",
    "the purpose of this assignment is for the member to ",
    "the purpose of this project is to ",
    "the purpose of the speech is to ",
    "the purpose of this project is for the member to be able to ",
]
PRONOUNS = [("himself or herself", "yourself"), ("him or herself", "yourself"),
            ("his or her", "your")]   # leave subject pronouns ("he or she") intact for verb agreement


def clean_purpose(block):
    # bullets -> separators, join wrapped lines so full sentences survive
    block = re.sub(r'[■•]+', ' | ', block)
    block = re.sub(r'[ \t]*\n[ \t]*', ' ', block)
    block = re.sub(r'\s+', ' ', block).strip()
    stmts = [s.strip(' .|') for s in block.split('|')]
    stmts = [s for s in stmts if len(s) > 12]
    if not stmts:
        return ""
    stmt = next((s for s in stmts if "this project" in s.lower()), stmts[0])
    # drop any "Project Purpose" / "Purpose Statement(s)" label
    stmt = re.sub(r'^(project\s+)?purpose statements?\s*', '', stmt, flags=re.I)
    stmt = re.sub(r'^project purpose\s*', '', stmt, flags=re.I)
    # cut the boilerplate lead-in wherever it appears
    m = re.search(r'purpose of (?:this project|the speech|this assignment)\s+is\s+(?:for the member\s+)?to\s+', stmt, re.I)
    if m:
        stmt = stmt[m.end():]
    for a, b in PRONOUNS:
        stmt = re.sub(a, b, stmt, flags=re.I)
    stmt = re.sub(r'\s+', ' ', stmt).strip().rstrip('.')
    return (stmt[:1].upper() + stmt[1:] + '.') if stmt else ""

def parse_pdf(path):
    import fitz
    t = fitz.open(path)[0].get_text()
    title = ""
    m = re.search(r'(?i)evaluation form\s*\n+\s*(.+)', t)
    if m:
        title = m.group(1).strip()
    m = re.search(r'(?i)purpose statements?\s*(.*?)\s*notes?\s+(?:for|to)\s+the\s+evaluator', t, re.S)
    purpose = clean_purpose(m.group(1)) if m else ""
    m = re.search(r'(?i)speech length[:\s]*([0-9]+)\s*[–-]\s*([0-9]+)\s*min', t)
    timing = f"{m.group(1)}–{m.group(2)} min" if m else ""
    return title, purpose, timing


CACHE = os.environ.get("EVAL_CACHE", "/tmp/toastflow-eval-cache")


def fetch_one(item, tmp):
    import time
    name, slug = item[0].strip(), item[1]
    url = url_for(slug)
    dst = os.path.join(tmp, slug.replace("/", "_") + ".pdf")
    if os.path.exists(dst) and os.path.getsize(dst) > 10000:   # cached
        try:
            _, purpose, timing = parse_pdf(dst)
            return (name, url, purpose, timing, None)
        except Exception:
            pass
    last = ""
    for attempt in range(4):
        try:
            urllib.request.urlretrieve(url, dst)
            _, purpose, timing = parse_pdf(dst)
            return (name, url, purpose, timing, None)
        except Exception as e:
            last = str(e)
            if "404" in last:
                break
            time.sleep(1.5 * (attempt + 1))
    return (name, url, "", "", last)


def main(extra_dir=None):
    import socket; socket.setdefaulttimeout(40)
    from concurrent.futures import ThreadPoolExecutor
    objs = json.load(open(os.path.join(OUT, "pathways-objectives.json")))["objectives"]
    forms = json.load(open(os.path.join(OUT, "eval-forms.json")))["forms"] if os.path.exists(os.path.join(OUT, "eval-forms.json")) else {}
    tmp = CACHE; os.makedirs(tmp, exist_ok=True)
    misses = []
    done = 0
    with ThreadPoolExecutor(max_workers=5) as ex:
        results = list(ex.map(lambda it: fetch_one(it, tmp), FORMS.items()))
    for name, url, purpose, timing, err in results:
        done += 1
        if err:
            misses.append(f"{name}: {err}"); print(f"[{done}] {name}: FAIL {err}", flush=True); continue
        print(f"[{done}] {name}: {timing or '?'} — {purpose[:55]}", flush=True)
        if purpose:
            objs[name] = {"objective": purpose, "timing": timing or objs.get(name, {}).get("timing", "")}
        forms[name] = {"url": url, "length": timing}
        if not purpose:
            misses.append(f"{name}: no purpose parsed")

    # also read any locally-provided PDFs (e.g. Communication Series forms)
    for pdf in glob.glob(os.path.join(extra_dir or "", "*.pdf")) if extra_dir else []:
        title, purpose, timing = parse_pdf(pdf)
        if title and purpose:
            objs[title] = {"objective": purpose, "timing": timing}
            print("  local:", title)

    json.dump({"_source": "Official Toastmasters Pathways evaluation forms (purpose statements)",
               "objectives": objs},
              open(os.path.join(OUT, "pathways-objectives.json"), "w"),
              ensure_ascii=False, indent=1)
    json.dump({"_source": "Toastmasters Pathways evaluation forms (public mirror)", "forms": forms},
              open(os.path.join(OUT, "eval-forms.json"), "w"),
              ensure_ascii=False, indent=1)
    print(f"objectives: {len(objs)}  ·  eval-forms: {len(forms)}")
    if misses:
        print("MISSES:")
        for m in misses:
            print("  -", m)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
