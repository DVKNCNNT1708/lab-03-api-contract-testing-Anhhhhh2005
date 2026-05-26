const http = require('http');

const PORT = Number(process.env.PORT || 8000);
const VALID_TOKEN = process.env.AUTH_TOKEN || 'local-dev-token';

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json',
    ...headers
  });
  res.end(JSON.stringify(body));
}

function problem(status, title, detail, instance, correlationId = null) {
  return {
    type: `https://api.smart-campus.local/problems/${title.toLowerCase().replaceAll(' ', '-')}`,
    title,
    status,
    detail,
    instance,
    correlationId
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(Object.assign(error, { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function correlationId(req) {
  return req.headers['x-correlation-id'] || 'corr-20260518-vision-local';
}

function isAuthorized(req) {
  return req.headers.authorization === `Bearer ${VALID_TOKEN}`;
}

function validateDetectionRequest(body) {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object.';
  for (const field of ['cameraId', 'campusId', 'capturedAt', 'motionEventId', 'source']) {
    if (!body[field]) return `${field} is required.`;
  }
  if (!body.source || typeof body.source !== 'object') return 'source is required.';

  if (body.source.sourceType === 'IMAGE_URL') {
    try {
      new URL(body.source.imageUrl);
    } catch {
      return 'source.imageUrl must be a valid URL.';
    }
    if (!/^[a-f0-9]{64}$/.test(body.source.checksumSha256 || '')) {
      return 'source.checksumSha256 must be a 64-character lowercase sha256 hash.';
    }
    return null;
  }

  if (body.source.sourceType === 'FRAME_METADATA') {
    for (const field of ['streamId', 'frameNumber', 'storageBucket', 'objectKey']) {
      if (body.source[field] === undefined || body.source[field] === null) {
        return `source.${field} is required.`;
      }
    }
    if (!Number.isInteger(body.source.frameNumber) || body.source.frameNumber < 0) {
      return 'source.frameNumber must be a non-negative integer.';
    }
    return null;
  }

  return 'source.sourceType must be IMAGE_URL or FRAME_METADATA.';
}

function detectionResult(corr = 'corr-20260518-vision-local') {
  return {
    detectionId: 'det_01HY6AIVISION0000000001',
    cameraId: 'CAM-A2-001',
    motionEventId: 'motion-20260518-0001',
    status: 'COMPLETED',
    modelVersion: 'vision-campus-v1.4',
    objects: [
      {
        objectType: 'PERSON',
        confidence: 0.97,
        boundingBox: { x: 0.31, y: 0.22, width: 0.18, height: 0.44 },
        trackId: 'track-7781'
      }
    ],
    overallConfidence: 0.97,
    riskLevel: 'MEDIUM',
    riskReason: 'Person detected after class hours.',
    createdAt: '2026-05-18T06:10:16Z',
    completedAt: '2026-05-18T06:10:17Z',
    correlationId: corr
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  const corr = correlationId(req);

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, {
      status: 'ok',
      service: 'ai-vision',
      checkedAt: new Date().toISOString()
    });
  }

  if (!isAuthorized(req)) {
    return send(res, 401, problem(401, 'Unauthorized', 'Missing or invalid bearer token.', url.pathname, corr));
  }

  if (req.method === 'GET' && url.pathname === '/vision/models/info') {
    return send(res, 200, {
      modelVersion: 'vision-campus-v1.4',
      status: 'ACTIVE',
      supportedSourceTypes: ['IMAGE_URL', 'FRAME_METADATA'],
      supportedObjectTypes: ['PERSON', 'VEHICLE', 'UNKNOWN_BAG', 'SMOKE', 'FIRE'],
      maxImageBytes: 5242880,
      maxProcessingMs: 800,
      updatedAt: '2026-05-15T09:00:00Z'
    });
  }

  if (req.method === 'GET' && url.pathname === '/vision/detections/recent') {
    const limit = Number(url.searchParams.get('limit') || 20);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return send(res, 422, problem(422, 'Unprocessable Entity', 'limit must be between 1 and 100.', url.pathname, corr));
    }
    return send(res, 200, {
      items: [detectionResult(corr)].slice(0, limit),
      nextCursor: null,
      hasMore: false
    });
  }

  const detectionMatch = url.pathname.match(/^\/vision\/detections\/([^/]+)$/);
  if (req.method === 'GET' && detectionMatch) {
    if (!/^det_[A-Za-z0-9]+$/.test(detectionMatch[1])) {
      return send(res, 404, problem(404, 'Not Found', 'Detection does not exist.', url.pathname, corr));
    }
    return send(res, 200, detectionResult(corr));
  }

  if (req.method === 'POST' && url.pathname === '/vision/detect') {
    let body;
    try {
      body = await readBody(req);
    } catch (error) {
      const status = error.status || 400;
      return send(res, status, problem(status, status === 413 ? 'Payload Too Large' : 'Bad Request', error.message, url.pathname, corr));
    }

    const prefer = req.headers.prefer || '';
    if (prefer.includes('code=413')) {
      return send(res, 413, problem(413, 'Payload Too Large', 'Image or referenced frame exceeds the negotiated size limit.', url.pathname, corr));
    }

    const validationError = validateDetectionRequest(body);
    if (validationError) {
      return send(res, 422, problem(422, 'Unprocessable Entity', validationError, url.pathname, corr));
    }

    if (prefer.includes('code=202')) {
      return send(res, 202, {
        detectionId: 'det_01HY6AIVISION0000000002',
        status: 'PENDING',
        pollUrl: `http://localhost:${PORT}/vision/detections/det_01HY6AIVISION0000000002`,
        acceptedAt: new Date().toISOString(),
        correlationId: corr
      }, { Location: `http://localhost:${PORT}/vision/detections/det_01HY6AIVISION0000000002` });
    }

    return send(res, 200, detectionResult(corr));
  }

  return send(res, 404, problem(404, 'Not Found', 'Route not found.', url.pathname, corr));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`AI Vision local service listening on http://localhost:${PORT}`);
});
