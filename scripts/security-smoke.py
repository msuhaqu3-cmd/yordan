# Black-box smoke test: python3 scripts/security-smoke.py (expects the app on localhost:8200). Checks unauthenticated access, CSRF/origin, file probes, CORS.
import requests,re,json,subprocess
B="http://localhost:8200"
def p(t,v):print(f"{t}: {v}")
# unauth access
for path in ["/admin","/admin/enquiries","/admin/users","/admin/media","/admin/settings","/admin/enquiries/1"]:
    r=requests.get(B+path,allow_redirects=False);p("unauth "+path,(r.status_code,r.headers.get("location")))
for path,m in [("/api/admin/media","GET"),("/api/enquiries","GET"),("/api/admin/media","POST")]:
    r=requests.request(m,B+path,allow_redirects=False);p(f"{m} {path}",r.status_code)
# CSRF/origin
r=requests.post(B+"/api/enquiries",json={"ref":"abcdefgh12","name":"x","phone":"0123456789"},headers={"Origin":"https://evil.example"});p("enq evil origin",r.status_code)
r=requests.post(B+"/api/enquiries",data="{}",headers={"Origin":B});p("enq empty",r.status_code)
r=requests.post(B+"/api/admin/media",files={"file":("a.webp",b"x")},data={"slot":"x"},headers={"Origin":"https://evil.example"});p("media evil origin",r.status_code)
# files / traversal / source maps
for path in ["/.env","/.env.local","/package.json","/_next/../.env.local","/media/../../etc/passwd","/media/%2e%2e%2f","/media/0000000000000000","/lib/db.ts","/scripts/gen-slots.mjs","/content/home.html","/.git/config","/api/admin","/admin/login/../users"]:
    r=requests.get(B+path,allow_redirects=False);p("probe "+path,r.status_code)
# error disclosure
r=requests.post(B+"/api/enquiries",data="{bad",headers={"Origin":B});p("bad json",(r.status_code,r.text[:80]))
# SQLi in enquiry & admin search (unauth) 
r=requests.post(B+"/api/enquiries",json={"ref":"sqli000001","name":"a'; drop table users;--","phone":"0123456789","details":"' or 1=1--","service":"x\x00y"},headers={"Origin":B});p("sqli enq",(r.status_code,r.text))
# headers
r=requests.get(B+"/");p("hdrs",{k:v for k,v in r.headers.items() if k.lower() in("content-security-policy","x-frame-options","strict-transport-security","x-powered-by","server","access-control-allow-origin")})
r=requests.get(B+"/admin/login");p("login hdrs",{k:v for k,v in r.headers.items() if k.lower() in("cache-control","x-frame-options","referrer-policy")})
r=requests.options(B+"/api/enquiries",headers={"Origin":"https://evil.example","Access-Control-Request-Method":"POST"});p("cors preflight",(r.status_code,r.headers.get("access-control-allow-origin")))
