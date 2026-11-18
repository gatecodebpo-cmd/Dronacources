// Dot-path helpers shared by the admin form (client) and API (server). "seo.title", "options.0".
export function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split(".");
  let o = obj;
  keys.slice(0, -1).forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== "object") o[k] = /^\d+$/.test(keys[i + 1]!) ? [] : {};
    o = o[k];
  });
  o[keys[keys.length - 1]!] = value;
  return obj;
}
