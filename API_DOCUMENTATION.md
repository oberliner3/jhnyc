# Cosmos API Documentation

This document provides detailed information about the Cosmos API, a RESTful service for accessing Shopify product data.

## 1. Base URL & Authentication

All API endpoints are prefixed with `/cosmos`. Access to secured endpoints requires a valid API key sent in the `X-API-KEY` HTTP header.

- **Base URL**: `/cosmos`
- **Authentication**: `X-API-KEY: YOUR_API_KEY`

Replace `YOUR_API_KEY` with the key provided in `config/app.php`.

---

## 2. Endpoints

### 2.1 Products

#### `GET /products`

Retrieves a paginated list of all products.

**Query Parameters:**

| Parameter | Type    | Default | Description                                      |
| :-------- | :------ | :------ | :----------------------------------------------- |
| `page`    | Integer | `1`     | The page number to retrieve.                     |
| `limit`   | Integer | `50`    | The number of products per page (max 100).       |
| `format`  | String  | `json`  | The response format (`json` or `msgpack`).       |

**Example Request:**

```bash
curl -H "X-API-KEY: YOUR_API_KEY" "/cosmos/products?page=2&limit=10"
```

**Example Response:**

```json
{
    "products": [
        // ... array of product objects ...
    ],
    "meta": {
        "total": 250,
        "page": 2,
        "limit": 10,
        "total_pages": 25
    }
}
```

#### `GET /products/search`

Performs a full-text search (FTS) across product names and descriptions.

**Query Parameters:**

| Parameter | Type   | Required | Description                                                                 |
| :-------- | :----- | :------- | :-------------------------------------------------------------------------- |
| `q`       | String | Yes      | The search query.                                                           |
| `fields`  | String | No       | A comma-separated list of fields to return (e.g., `id,name,price`).         |
| `format`  | String | No       | The response format (`json` or `msgpack`).                                  |

**Example Request:**

```bash
curl -H "X-API-KEY: YOUR_API_KEY" "/cosmos/products/search?q=running+shoes&fields=name,price"
```

**Example Response:**

```json
{
    "products": [
        {
            "id": 123,
            "name": "Ultimate Running Shoes",
            "price": "99.99"
        }
    ]
}
```

#### `GET /products/{key}`

Retrieves a single product by its unique `id` or `handle`.

**URL Parameters:**

| Parameter | Type          | Description                               |
| :-------- | :------------ | :---------------------------------------- |
| `key`     | Integer/String| The product `id` (numeric) or `handle` (string). |

**Example Requests:**

```bash
# By ID
curl -H "X-API-KEY: YOUR_API_KEY" "/cosmos/products/12345"

# By Handle
curl -H "X-API-KEY: YOUR_API_KEY" "/cosmos/products/ultimate-running-shoes"
```

**Example Response:**

```json
{
    "product": {
        "id": 12345,
        "name": "Ultimate Running Shoes",
        "handle": "ultimate-running-shoes",
        // ... other product fields ...
    }
}
```

### 2.2 Collections

#### `GET /collections/{handle}`

Retrieves a collection of products based on a predefined `handle`. All collection endpoints support the `fields`, `page`, and `limit` query parameters (unless otherwise specified).

**URL Parameters:**

| Parameter | Type   | Description                                      |
| :-------- | :----- | :----------------------------------------------- |
| `handle`  | String | The handle of the collection to retrieve.        |

**Available Handles:**

| Handle        | Description                                                                    |
| :------------ | :----------------------------------------------------------------------------- |
| `all`         | Returns all products, paginated.                                               |
| `featured`    | Returns a random, non-paginated list of 8 products tagged with `featured`.     |
| `sale`        | Returns paginated products where `compare_at_price` is greater than `price`.   |
| `new`         | Returns paginated products sorted by newest first (by ID).                     |
| `bestsellers` | Returns paginated products sorted by a calculated `bestseller_score`.          |
| `trending`    | Returns paginated products sorted by price (descending) as a trending heuristic. |

**Example Request (New Products):**

```bash
curl -H "X-API-KEY: YOUR_API_KEY" "/cosmos/collections/new?limit=5&fields=id,name"
```

**Example Response (New Products):**

```json
{
    "products": [
        {
            "id": 987,
            "name": "Latest Gadget"
        },
        {
            "id": 986,
            "name": "Another New Item"
        }
    ],
    "meta": {
        "total": 50,
        "page": 1,
        "limit": 5,
        "total_pages": 10
    }
}
```

### 2.3 Image Proxy

#### `GET /image-proxy`

This endpoint is not directly documented as it is intended for internal use by the application to proxy and cache images. It is called by the application with the appropriate parameters.

---

## 3. Allowed Fields for `&fields=` Parameter

The following fields can be requested using the `fields` query parameter on the `/products/search` and `/collections/{handle}` endpoints:

- `id`
- `name`
- `handle`
- `body_html`
- `price`
- `compare_at_price`
- `category`
- `in_stock`
- `rating`
- `review_count`
- `tags`
- `vendor`
- `bestseller_score`
- `raw_json`
