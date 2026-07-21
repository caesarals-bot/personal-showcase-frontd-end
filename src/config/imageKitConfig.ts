const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string | undefined;
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string | undefined;
const IMAGEKIT_AUTH_ENDPOINT = import.meta.env.VITE_IMAGEKIT_AUTHENTICATION_ENDPOINT as string | undefined;
const IMAGEKIT_DELETE_ENDPOINT = import.meta.env.VITE_IMAGEKIT_DELETE_ENDPOINT as string | undefined;

if (!IMAGEKIT_URL_ENDPOINT || !IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_AUTH_ENDPOINT || !IMAGEKIT_DELETE_ENDPOINT) {
  console.warn(
    '[ImageKit] Variables de entorno no configuradas. ' +
    'Configure VITE_IMAGEKIT_URL_ENDPOINT, VITE_IMAGEKIT_PUBLIC_KEY, ' +
    'VITE_IMAGEKIT_AUTHENTICATION_ENDPOINT y VITE_IMAGEKIT_DELETE_ENDPOINT en .env.local'
  );
}

export const imageKitConfig = {
  urlEndpoint: IMAGEKIT_URL_ENDPOINT || '',
  publicKey: IMAGEKIT_PUBLIC_KEY || '',
  authenticationEndpoint: IMAGEKIT_AUTH_ENDPOINT || '',
  deleteEndpoint: IMAGEKIT_DELETE_ENDPOINT || '',
};
