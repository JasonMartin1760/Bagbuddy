import type {ServiceZip} from '~/data/serviceAreas';

/**
 * The 180-zip service list is only needed once someone checks a zip, so it's
 * loaded on first use (focusing the zip field, or the first check) instead
 * of with every page. Pages that need it during the first render (the
 * pickup flow with a ?zip= link) import it directly and hand it over with
 * provideZipLookup so the first render matches the server.
 */
export type ZipLookup = (zip: string) => ServiceZip | undefined;

let lookup: ZipLookup | null = null;
let loading: Promise<ZipLookup> | null = null;

/** The zip lookup if it's already loaded, otherwise null. */
export function getZipLookup(): ZipLookup | null {
  return lookup;
}

/** Loads the zip list (once) and resolves with the lookup. */
export function loadZipLookup(): Promise<ZipLookup> {
  if (lookup) return Promise.resolve(lookup);
  loading ??= import('~/data/serviceAreas').then((module) => {
    lookup = module.findServiceZip;
    return lookup;
  });
  return loading;
}

/** Registers a lookup the page already has, so checks run synchronously. */
export function provideZipLookup(fn: ZipLookup) {
  lookup = fn;
}
