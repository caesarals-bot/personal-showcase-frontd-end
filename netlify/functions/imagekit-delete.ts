import type { Handler } from '@netlify/functions';
import ImageKit from '@imagekit/nodejs';
import { requireAdmin, AdminAuthError } from './_shared/admin-auth';
import { checkIpRateLimit } from './_shared/rate-limit';

// Orígenes autorizados (same-origin del sitio). Cualquier otro origen recibe 403.
const ALLOWED_ORIGINS = [
  'https://xn--cesarlondoo-beb.dev',
  'https://cesarlondoño.dev',
  'https://cesarlondono.dev',
  'https://vocal-baklava-c94c36.netlify.app',
];

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // requests sin Origin (curl, server-side) se procesan igual
  return ALLOWED_ORIGINS.includes(origin);
}

function corsHeadersFor(event: { headers?: Record<string, string | undefined> }): Record<string, string> {
  const origin = event.headers?.origin;
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

export const handler: Handler = async (event) => {
  const corsHeaders = corsHeadersFor(event);

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Solo el admin autenticado puede borrar imágenes (requiere Bearer token).
  try {
    await requireAdmin(event);
  } catch (err) {
    if (err instanceof AdminAuthError) {
      const status = err.status;
      const body = { error: status === 403 ? 'No tienes permisos de administrador' : 'Se requiere autenticación de administrador' };
      return { statusCode: status, headers: corsHeaders, body: JSON.stringify(body) };
    }
    throw err;
  }

  // Rate limit por IP: máx 30 borrados por hora (anti-spam/abuso).
  const ipRate = await checkIpRateLimit(event, 60 * 60 * 1000, 30);
  if (!ipRate.ok) {
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        ...(ipRate.retryAfterSec ? { 'Retry-After': String(ipRate.retryAfterSec) } : {}),
      },
      body: JSON.stringify({
        error: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
        retryAfterSec: ipRate.retryAfterSec,
      }),
    };
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[imagekit-delete] IMAGEKIT_PRIVATE_KEY not set');
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server misconfiguration: missing ImageKit credentials' }),
    };
  }

  let fileId: string | undefined;
  let imageUrl: string | undefined;

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    fileId = body.fileId || undefined;
    imageUrl = body.imageUrl || undefined;

    if (!fileId && !imageUrl) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'fileId or imageUrl is required' }),
      };
    }
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  // Si no tenemos fileId pero sí URL, buscar el fileId via REST API de ImageKit
  if (!fileId && imageUrl) {
    console.log(`[imagekit-delete] No fileId, searching by URL: ${imageUrl}`);

    try {
      // Extraer el nombre del archivo de la URL
      const urlPath = new URL(imageUrl).pathname; // e.g. /account/folder/file.jpg
      const filename = decodeURIComponent(urlPath.split('/').pop() || '');

      if (!filename) {
        console.warn('[imagekit-delete] Could not extract filename from URL:', imageUrl);
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Could not extract filename from imageUrl' }),
        };
      }

      console.log(`[imagekit-delete] Searching for filename: ${filename}`);

      // Usar la REST API de ImageKit con Basic auth (private_key como usuario, vacío como password)
      const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;
      const searchRes = await fetch(
        `https://api.imagekit.io/v1/files?name=${encodeURIComponent(filename)}&limit=10`,
        { headers: { Authorization: authHeader } }
      );

      if (!searchRes.ok) {
        const errText = await searchRes.text();
        console.error('[imagekit-delete] Search API error:', searchRes.status, errText);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'ImageKit search failed', detail: errText }),
        };
      }

      const files: Array<{ fileId: string; url: string; name: string }> = await searchRes.json();
      console.log(`[imagekit-delete] Found ${files.length} file(s) with name: ${filename}`);

      if (!files || files.length === 0) {
        console.warn('[imagekit-delete] No files found for:', filename);
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'File not found in ImageKit', filename }),
        };
      }

      // Priorizar el que tiene la URL exacta; si no, usar el primero
      const match = files.find(f => f.url === imageUrl) || files[0];
      fileId = match.fileId;
      console.log(`[imagekit-delete] Resolved fileId: ${fileId} (from URL search)`);
    } catch (searchErr) {
      console.error('[imagekit-delete] Error resolving fileId from URL:', searchErr);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Failed to resolve fileId', message: String(searchErr) }),
      };
    }
  }

  if (!fileId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Could not resolve fileId' }),
    };
  }

  // Borrar el archivo en ImageKit
  try {
    const imagekit = new ImageKit({ privateKey });
    console.log(`[imagekit-delete] Deleting fileId: ${fileId}`);
    await imagekit.files.delete(fileId);
    console.log(`[imagekit-delete] ✅ Deleted successfully: ${fileId}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, fileId }),
    };
  } catch (error) {
    console.error('[imagekit-delete] Delete error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
