import re, json, subprocess, html, sys, time

repos = ["claudioemmanuel/squeez","yoeld-wix/quiet-bash","fajarhide/omni","edouard-claude/snip","zdk/lowfat","mpecan/tokf","colbymchenry/codegraph","oraios/serena","manojmallick/sigmap","DeusData/codebase-memory-mcp","mksglu/context-mode","atlassian-labs/mcp-compressor"]

for repo in repos:
    url = f"https://github.com/{repo}/issues"
    for attempt in range(3):
        r = subprocess.run(["curl","-sL",url,"-o","/tmp/iss.html"], capture_output=True)
        h = open('/tmp/iss.html', errors='ignore').read()
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
    try:
        edges = d['payload']['preloadedQueries'][0]['result']['data']['repository']['search']['edges']
        icount = d['payload']['preloadedQueries'][0]['result']['data']['repository']['search'].get('issueCount')
        print("issueCount:", icount)
        for e in edges:
            n = e['node']
            if n.get('__typename') != 'Issue': continue
            t = re.sub('<[^>]+>','',n['titleHtml'])
            labels = [l['node'].get('name') for l in n['labels']['edges']]
            print(f"#{n['number']} | {t} | created {n['createdAt'][:10]} | updated {n['updatedAt'][:10]} | labels {labels} | author {n['author']['login'] if n['author'] else '?'}")
    except Exception as e:
        print("EXTRACT FAIL", e)
