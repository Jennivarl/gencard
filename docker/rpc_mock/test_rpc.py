import http.client, json

conn = http.client.HTTPConnection('localhost', 8545)
conn.request('POST', '/', body=json.dumps({'jsonrpc':'2.0','id':1,'method':'gl_call','params':[{'to':'0x0','data':{'method':'verify_card','args':['Alice','molecule']}}]}), headers={'Content-Type':'application/json'})
res = conn.getresponse()
print(res.status, res.reason)
print(res.read().decode())
