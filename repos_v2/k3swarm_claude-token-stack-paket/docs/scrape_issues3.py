import re, json, subprocess, html, time, random

repos = ["DeusData/codebase-memory-mcp","mksglu/context-mode","atlassian-labs/mcp-compressor"]

for repo in repos:
    owner, name = repo.split('/')
    print(f"===== {repo} =====")
    done = False
    for attempt in range(6):
        cache_bust = f"https://github.com/{repo}/issues?q=is%3Aissue%20is%3Aopen%20sort%3Acreated-desc&cb={random.randint(1000,999999)}"
        subprocess.run(["curl","-sL","-H","Cache-Control: no-cache",cache_bust,"-o","/tmp/iss3.html"], capture_output=True)
        h = open('/tmp/iss3.html', errors='ignore').read()
        m = re.search(r'<script type="application/json"[^>]*data-target="react-app.embeddedData">(.*?)</script>', h, re.S)
        if not m:
            time.sleep(2); continue
        try:
            d = json.loads(html.unescape(m.group(1)))
        except Exception:
            time.sleep(2); continue
        for cand in d['payload'].get('preloadedQueries', []):
            v = cand.get('variables', {})
            if v.get('name') == name and v.get('owner') == owner:
                s = cand['result']['data']['repository']['search']
                print("issueCount:", s.get('issueCount'))
                for e in s['edges']:
                    n = e['node']
                    if n.get('__typename') != 'Issue': continue
                    t = re.sub('<[^>]+>','',n['titleHtml'])
                    labels = [l['node'].get('name') for l in n['labels']['edges']]
                    print(f"#{n['number']} | {t} | created {n['createdAt'][:10]} | updated {n['updatedAt'][:10]} | labels {labels} | author {n['author']['login'] if n['author'] else '?'}")
                done = True
                break
        if done: break
        time.sleep(2)
    if not done:
        print("FAILED after retries")
