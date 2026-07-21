import type { Handler } from '@netlify/functions';
import ImageKit from '@imagekit/nodejs';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
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
