# Developer Guide

## HTTP query params: arrays with axios and FastAPI

Context: Our frontend uses axios to call a FastAPI backend. We support multi-select filters (e.g., filtering contacts by multiple `estado` values). Axios and FastAPI use different defaults for array query parameter encoding.

### The problem

- Axios default encodes arrays using bracketed keys (jQuery-style):
  - `filter_estado[]=prospecto&filter_estado[]=calificado`
- FastAPI expects repeated keys to parse lists by default:
  - `filter_estado=prospecto&filter_estado=calificado`
- With brackets, FastAPI sees a different parameter name (`filter_estado[]`) and won’t bind it to the `List[...]` parameter unless we change the alias or parse manually.

### Our solution

We configured our dedicated API axios instance to serialize array params as repeat keys. This keeps frontend and backend in sync without special-casing endpoints.

Code (in `frontend/src/providers/dataProvider.ts`):

```ts
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  paramsSerializer: {
    // Encode arrays as repeat-keys `foo=a&foo=b` instead of bracketed `foo[]=a&foo[]=b`
    serialize: (params: Record<string, any>) => {
      const parts: string[] = [];
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (Array.isArray(value)) {
          value.forEach((v) => {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
          });
        } else if (value !== null && value !== undefined) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
      return parts.join('&');
    },
  },
});
```

### Scope and trade-offs

- Scope: This serializer is applied only to our API axios instance. Other axios instances are unaffected.
- Interop: If integrating with a third-party API that expects bracketed arrays (`foo[]`), either:
  - Override `paramsSerializer` just for that request, or
  - Use a separate axios instance configured with `arrayFormat: 'brackets'` (via `qs`) for that service.
- Future complexity: If we need nested object query params, prefer using `qs` and set an explicit `arrayFormat` (e.g., `repeat`) and `allowDots` as needed.

### Backend expectations

- FastAPI endpoint parameters that expect lists should use `List[T]` and (optionally) `alias` for consistent names, e.g.:

```py
from typing import List, Optional
from fastapi import Query

estados: Optional[List[ContactStatus]] = Query(None, alias="filter_estado")
```

- SQLAlchemy filtering should use `IN` when applying list filters, e.g. `Contact.estado.in_(estados)`.

### Testing

- Confirmed via direct API test: sending `filter_estado=prospecto&filter_estado=calificado` returns only those estados.
- Frontend table displays the filtered results correctly when selecting multiple estados in the UI.

### TL;DR

- We intentionally use repeat-key encoding for arrays to match FastAPI’s defaults.
- Keep this in mind if you introduce new services or complex query param structures; choose/override the serializer appropriately.
