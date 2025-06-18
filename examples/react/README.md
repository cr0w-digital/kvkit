# kvkit React Demo

This demo showcases the capabilities of kvkit's React hooks for state synchronization with URLs and localStorage.

## What's Demonstrated

### 🔍 Search Form (URL Search Params + Flat Codec)
- Uses `useSearchParams` with `flatCodec`
- Each form field becomes a separate URL parameter
- Perfect for search/filter forms where parameters should be easily readable
- Example URL: `?query=laptop&category=electronics&minPrice=100&maxPrice=2000&inStock=true`

### 👤 User Form (URL Search Params + JSON Codec)
- Uses `useSearchParams` with `jsonCodec`
- Entire form data stored in one URL parameter as JSON
- Good for complex forms with nested data
- Example URL: `?user={"name":"John","email":"john@example.com","age":30,"role":"user"}`

### 📑 Tab Navigation (Hash Params + Flat Codec)
- Uses `useHashParams` with `flatCodec`
- UI state synced with URL hash parameters
- Perfect for tab/modal state that shouldn't trigger page navigation
- Example URL: `#activeTab=user&sidebarOpen=true`

### ⚙️ User Preferences (localStorage + Flat Codec)
- Uses `useLocalStorageCodec` with `flatCodec`
- Preferences persist across browser sessions
- Data stored in localStorage with codec serialization

### 🏷️ Prefix Codec Demo (Namespaced Parameters)
- Uses `prefixCodec` to avoid parameter conflicts
- Multiple forms can coexist with namespaced parameters
- Example URL: `?user.name=Alice&user.email=alice@example.com&search.query=reports&search.page=2`

## Key Features Shown

- **Type Safety**: All forms use Zod schemas for validation and TypeScript types
- **URL Synchronization**: State automatically syncs with URL for shareability
- **Persistent Storage**: localStorage integration for user preferences
- **Conflict Avoidance**: Prefix codecs prevent parameter name conflicts
- **Multiple Strategies**: Different codec strategies for different use cases

## Running the Demo

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Try It Out

1. Fill out the forms and see the URL update in real-time
2. Copy the URL and paste it in a new tab - state is restored!
3. Refresh the page - localStorage preferences persist
4. Use browser back/forward buttons - URL state is maintained
5. Notice how different codec strategies affect URL structure

## Codec Strategy Comparison

| Strategy | URL Structure | Best For |
|----------|---------------|----------|
| **Flat Codec** | `?name=John&age=30&active=true` | Simple forms, filters, search |
| **JSON Codec** | `?data={"name":"John","age":30}` | Complex objects, nested data |
| **Prefix Codec** | `?user.name=John&search.query=test` | Multiple forms, avoiding conflicts |

## Learn More

- [kvkit Documentation](../../README.md)
- [@kvkit/codecs](../../packages/codecs/README.md)
- [@kvkit/react](../../packages/react/README.md)
