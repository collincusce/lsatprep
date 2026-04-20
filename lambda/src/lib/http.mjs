// Small HTTP helpers for the Lambda streaming handler.

const SECRET_HEADER = 'x-lsatprep-token';

function headerLookup(headers, name) {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

export function verifySharedSecret(event) {
  const expected = process.env.SHARED_SECRET || '';
  if (!expected) return false;
  const got = headerLookup(event?.headers, SECRET_HEADER);
  return got === expected;
}

export function corsHeaders() {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-lsatprep-token',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin'
  };
}

// In AWS Lambda (streamifyResponse), the response stream has no writeHead —
// you set status/headers via awslambda.HttpResponseStream.from(stream, metadata)
// BEFORE the first write. Locally (in tests), we keep the writeHead contract.
function attachStatus(stream, status, headers) {
  // Tests: mock stream with writeHead.
  if (typeof stream.writeHead === 'function') {
    stream.writeHead(status, headers);
    return stream;
  }
  // Lambda runtime: wrap with HttpResponseStream if available.
  if (typeof awslambda !== 'undefined' && awslambda?.HttpResponseStream?.from) {
    return awslambda.HttpResponseStream.from(stream, { statusCode: status, headers });
  }
  // Fallback: no-op; body still streams, status defaults to 200.
  return stream;
}

export function respond(stream, status, body, extraHeaders = {}) {
  const headers = {
    'content-type': typeof body === 'string' ? 'text/plain' : 'application/json',
    ...corsHeaders(),
    ...extraHeaders
  };
  const out = attachStatus(stream, status, headers);
  if (body !== undefined && body !== '') {
    const payload = typeof body === 'string' ? body : JSON.stringify(body);
    out.write(payload);
  }
  out.end();
  return out;
}

export function writeSseHeaders(stream, extraHeaders = {}) {
  return attachStatus(stream, 200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache, no-transform',
    'connection': 'keep-alive',
    ...corsHeaders(),
    ...extraHeaders
  });
}

export function writeSseEvent(stream, data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  stream.write(`data: ${payload}\n\n`);
}

export async function readJsonBody(event) {
  if (!event || event.body == null) return {};
  let raw = event.body;
  if (event.isBase64Encoded) raw = Buffer.from(raw, 'base64').toString('utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new HttpError(400, 'invalid JSON body');
  }
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
