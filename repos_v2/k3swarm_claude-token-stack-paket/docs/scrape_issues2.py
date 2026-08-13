import re, json, subprocess, html, sys, time

repos = ["oraios/serena","manojmallick/sigmap","DeusData/codebase-memory-mcp","mksglu/context-mode","atlassian-labs/mcp-compressor"]

for repo in repos:
    owner, name = repo.split('/')
    url = f"https://github.com/{repo}/issues"
    m = None
    for attempt in range(3):
        subprocess.run(["curl","-sL",url,"-o","/tmp/iss2.html"], capture_output=True)
        h = open('/tmp/iss2.html', errors='ignore').read()
        m = re.search(r'<script type="application/json"[^>]*data-target="react-app.embeddedData">(.*?)</script>', h, re.S)
        if m: break
        time.sleep(2)
    print(f"===== {repo} =====")
    if not m:
        print("NO DATA"); continue
    try:
        d = json.loads(html.unescape(m.group(1)))
    except Exception as e:
        print("PARSE FAIL", e); continue
    q = None
    for cand in d['payload'].get('preloadedQueries', []):
        v = cand.get('variables', {})
        if v.get('name') == name and v.get('owner') == owner:
            q = cand; break
    if not q:
        print("NO MATCHING QUERY; queries:", [(c.get('variables',{}).get('owner'), c.get('variables',{}).get('name')) for c in d['payload'].get('preloadedQueries',[])]); continue
    s = q['result']['data']['repository']['search']
    print("issueCount:", s.get('issueCount'))
    for e in s['edges']:
        n = e['node']
        if n.get('__typename') != 'Issue': continue
        t = re.sub('<[^>]+>','',n['titleHtml'])
        labels = [l['node'].get('name') for l in n['labels']['edges']]
        print(f"#{n['number']} | {t} | created {n['createdAt'][:10]} | updated {n['updatedAt'][:10]} | labels {labels} | author {n['author']['login'] if n['author'] else '?'}")
