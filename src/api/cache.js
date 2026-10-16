const cache = new Map();
const pending = new Map();
let revision = 0;
export async function cached(key, load, ttl = 60000) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) {
    console.info('[Cache hit]', key);
    return hit.value;
  }
  if (pending.has(key)) return pending.get(key);
  console.info('[Cache miss]', key);
  const version = revision;
  const request = Promise.resolve().then(load).then(value => {
    if (!key.startsWith('availability:') || version === revision) cache.set(key, {
      value,
      at: Date.now()
    });
    return value;
  }).finally(() => {
    if (pending.get(key) === request) pending.delete(key);
  });
  pending.set(key, request);
  return request;
}
export function invalidateAvailability() {
  revision++;
  for (const map of [cache, pending]) for (const key of map.keys()) if (key.startsWith('availability:')) map.delete(key);
}
