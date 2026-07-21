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
  const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT || process.env.IMAGEKIT_URL_ENDPOINT;

  if (!privateKey) {
    console.error('IMAGEKIT_PRIVATE_KEY environment variable is not set');
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
    fileId = body.fileId;
    imageUrl = body.imageUrl;

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

  try {
    const imagekit = new ImageKit({ privateKey });

    // Si no tenemos fileId pero sí la URL, buscar el archivo por nombre en ImageKit
    if (!fileId && imageUrl) {
      console.log(`[imagekit-delete] No fileId provided, searching by URL: ${imageUrl}`);

      // Extraer el path/nombre del archivo de la URL de ImageKit
      // URL format: https://ik.imagekit.io/ACCOUNT/folder/filename.ext
      let searchName: string | undefined;
      try {
        const urlObj = new URL(imageUrl);
        // El path es algo como /tu-cuenta/posts/filename.jpg
        const parts = urlObj.pathname.split('/');
        searchName = parts[parts.length - 1]; // último segmento = nombre del archivo
        // También intentar sin extensión para búsqueda más flexible
        searchName = decodeURIComponent(searchName);
      } catch {
        console.warn('[imagekit-delete] Could not parse imageUrl:', imageUrl);
      }

      if (searchName) {
        try {
          // Buscar archivos con ese nombre en ImageKit
          const files = await imagekit.listFiles({ name: searchName, limit: 5 });
          if (files && files.length > 0) {
            // Encontrar el que tiene la URL más parecida
            const match = files.find(f => imageUrl && f.url === imageUrl) || files[0];
            fileId = match.fileId;
            console.log(`[imagekit-delete] Found fileId by URL: ${fileId}`);
          } else {
            console.warn(`[imagekit-delete] No files found with name: ${searchName}`);
            return {
              statusCode: 404,
              headers: corsHeaders,
              body: JSON.stringify({ error: 'File not found in ImageKit', searchName }),
            };
          }
        } catch (searchErr) {
          console.error('[imagekit-delete] Error searching file by name:', searchErr);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Failed to search file', message: String(searchErr) }),
          };
        }
      }
    }

    if (!fileId) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Could not resolve fileId' }),
      };
    }

    console.log(`[imagekit-delete] Deleting fileId: ${fileId}`);
    await imagekit.files.delete(fileId);
    console.log(`[imagekit-delete] Deleted successfully: ${fileId}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, fileId }),
    };
  } catch (error) {
    console.error('ImageKit delete error:', error);
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
