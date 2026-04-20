// Lambda entry. Streamified response handler with internal routing.

import { explain } from './handlers/explain.mjs';
import { writingSample } from './handlers/writing-sample.mjs';
import { diagnostic } from './handlers/diagnostic.mjs';
import { coach } from './handlers/coach.mjs';
import { verifySharedSecret, respond, corsHeaders } from './lib/http.mjs';

// awslambda.streamifyResponse is injected by the Lambda runtime. For local
// tests this global is undefined and we export the raw `route` function.

async function route(event, stream) {
  const method = event?.requestContext?.http?.method || event?.httpMethod || 'POST';
  const path = event?.rawPath || event?.requestContext?.http?.path || '/';

  if (method === 'OPTIONS') {
    respond(stream, 204, '', corsHeaders());
    return;
  }
  if (!verifySharedSecret(event)) {
    respond(stream, 401, { error: 'unauthorized' });
    return;
  }
  try {
    switch (`${method} ${path}`) {
      case 'POST /writing-sample': return await writingSample(event, stream);
      case 'POST /explain': return await explain(event, stream);
      case 'POST /coach': return await coach(event, stream);
      case 'POST /diagnostic': return await diagnostic(event, stream);
      default: return respond(stream, 404, { error: 'not found', path, method });
    }
  } catch (err) {
    console.error('router error', err);
    respond(stream, 500, { error: 'internal' });
  }
}

export { route };

export const handler = (typeof awslambda !== 'undefined' && awslambda?.streamifyResponse)
  ? awslambda.streamifyResponse(route)
  : route;
