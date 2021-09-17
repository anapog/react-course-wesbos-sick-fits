import { PAGINATION_QUERY } from '../components/Pagination';

export default function paginationField() {
  return {
    keyArgs: false, // Tells Apollo that the cache will be managed differently
    read(existing = [], { args, cache }) {
      const { skip, first } = args;
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      const items = existing.slice(skip, skip + first).filter((item) => item);

      // Return items if we are on the last page with as many as there are
      if (items.length && items.length !== first && page === pages) {
        return items;
      }

      if (items.length !== first) {
        return false; // No items stored in cache, request them
      }

      if (items.length) {
        return items; // Returning items from cache since they exist
      }

      return false; // Fallback
    },
    merge(existing, incoming, { args }) {
      const { skip, first } = args;
      const merged = existing ? existing.slice(0) : [];
      for (let i = skip; i < skip + incoming.length; ++i) {
        merged[i] = incoming[i - skip];
      }

      return merged;
    },
  };
}
