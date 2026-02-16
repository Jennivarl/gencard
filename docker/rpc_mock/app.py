from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/', methods=['POST'])
def rpc():
    data = request.get_json(silent=True) or {}
    # default mocked result
    result = { 'verified': True, 'verdict': 'VERIFIED', 'reason': 'mocked by local RPC' }

    # If request appears to target verify_card, return mocked result
    method = data.get('method')
    params = data.get('params')

    # support both 'gl_call' style and direct payloads
    try:
        if method and method.lower().startswith('gl'):
            # attempt to inspect params for args
            # return same mocked result
            pass
        elif isinstance(params, list) and len(params) > 0:
            # might be direct call shape
            pass
    except Exception:
        pass

    resp = {
        'jsonrpc': data.get('jsonrpc', '2.0'),
        'id': data.get('id', 1),
        'result': result
    }
    return jsonify(resp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8545)
