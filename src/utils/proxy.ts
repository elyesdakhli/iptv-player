const corsProxy = import.meta.env.VITE_CORS_PROXY;

export const proxyPrefix = (url: string) => {
  return corsProxy ? (corsProxy + url) : url;
};