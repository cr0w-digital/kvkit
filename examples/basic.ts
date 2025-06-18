import { 
  stringCodec, 
  numberCodec, 
  jsonCodec, 
  flatCodec, 
  prefixCodec,
  type Codec 
} from '@kvkit/codecs';
import { encodeToQuery, decodeFromQuery } from '@kvkit/query';

// ===== Basic Codec Examples =====

// Example: User preferences with JSON codec
type UserPrefs = {
  theme: string;
  fontSize: number;
  language: string;
};

const userPrefsCodec = jsonCodec<UserPrefs>();

const preferences: UserPrefs = {
  theme: 'dark',
  fontSize: 16,
  language: 'en'
};

console.log('=== JSON Codec Example ===');
const searchParams = encodeToQuery(userPrefsCodec, preferences);
console.log('Encoded URL:', searchParams.toString());
// Output: data=%7B%22theme%22%3A%22dark%22%2C%22fontSize%22%3A16%2C%22language%22%3A%22en%22%7D

const decoded = decodeFromQuery(userPrefsCodec, searchParams);
console.log('Decoded:', decoded);
// Output: { theme: 'dark', fontSize: 16, language: 'en' }

// ===== New Codec Strategies =====

// Example: Flat codec for form-like data
type SearchFilters = {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
};

console.log('\n=== Flat Codec Example ===');
const searchCodec = flatCodec<SearchFilters>();
const filters: SearchFilters = {
  query: 'laptop',
  category: 'electronics',
  minPrice: 100,
  maxPrice: 2000,
  inStock: true
};

const flatParams = encodeToQuery(searchCodec, filters);
console.log('Flat encoded URL:', flatParams.toString());
// Output: query=laptop&category=electronics&minPrice=100&maxPrice=2000&inStock=true

const flatDecoded = decodeFromQuery(searchCodec, flatParams);
console.log('Flat decoded:', flatDecoded);

// Example: Blob codec for complex nested data
type AppState = {
  user: {
    id: string;
    profile: {
      name: string;
      avatar: string;
    };
  };
  settings: {
    notifications: boolean;
    privacy: string[];
  };
};

console.log('\n=== JSON Codec Example (Complex Data) ===');
const appStateCodec = jsonCodec<AppState>('appState');
const appState: AppState = {
  user: {
    id: 'user123',
    profile: {
      name: 'Alice Johnson',
      avatar: 'avatar.jpg'
    }
  },
  settings: {
    notifications: true,
    privacy: ['friends', 'public']
  }
};

const blobParams = encodeToQuery(appStateCodec, appState);
console.log('JSON encoded URL:', blobParams.toString());
// Compact single parameter with JSON

const blobDecoded = decodeFromQuery(appStateCodec, blobParams);
console.log('JSON decoded:', blobDecoded);

// Example: Prefix codec for namespaced components
type UserData = {
  name: string;
  email: string;
  role: string;
};

type SearchData = {
  query: string;
  filters: string[];
};

console.log('\n=== Prefix Codec Example ===');
const userCodec = prefixCodec<UserData>('user');
const searchDataCodec = prefixCodec<SearchData>('search');

const userData: UserData = {
  name: 'Bob Smith',
  email: 'bob@example.com',
  role: 'admin'
};

const searchData: SearchData = {
  query: 'reports',
  filters: ['recent', 'important']
};

// Encode both with different namespaces
const userParams = encodeToQuery(userCodec, userData);
const searchParams2 = encodeToQuery(searchDataCodec, searchData);

// Combine parameters (would work in real URL)
const combinedParams = new URLSearchParams();
userParams.forEach((value, key) => combinedParams.set(key, value));
searchParams2.forEach((value, key) => combinedParams.set(key, value));

console.log('Combined namespaced URL:', combinedParams.toString());
// Output: user.name=Bob%20Smith&user.email=bob%40example.com&user.role=admin&search.query=reports&search.filters=%5B%22recent%22%2C%22important%22%5D

// Decode each namespace separately
const userDecoded = decodeFromQuery(userCodec, combinedParams);
const searchDecoded = decodeFromQuery(searchDataCodec, combinedParams);
console.log('User decoded:', userDecoded);
console.log('Search decoded:', searchDecoded);

// ===== Custom Codec Example =====

console.log('\n=== Custom Codec Example ===');

// Custom codec for a specific data format
type Coordinate = {
  lat: number;
  lng: number;
  zoom: number;
};

const coordinateCodec: Codec<Coordinate> = {
  encode: (coord) => ({
    location: `${coord.lat},${coord.lng},${coord.zoom}`
  }),
  decode: (data) => {
    const parts = (data.location || '0,0,10').split(',');
    return {
      lat: parseFloat(parts[0]) || 0,
      lng: parseFloat(parts[1]) || 0,
      zoom: parseInt(parts[2]) || 10
    };
  }
};

const coordinate: Coordinate = { lat: 37.7749, lng: -122.4194, zoom: 12 };
const coordParams = encodeToQuery(coordinateCodec, coordinate);
console.log('Custom codec URL:', coordParams.toString());
// Output: location=37.7749%2C-122.4194%2C12

const coordDecoded = decodeFromQuery(coordinateCodec, coordParams);
console.log('Custom decoded:', coordDecoded);

// ===== Codec Strategy Comparison =====

console.log('\n=== Codec Strategy Comparison ===');

type FormData = {
  name: string;
  age: number;
  active: boolean;
};

const formData: FormData = { name: 'Charlie', age: 25, active: true };

// JSON codec (default key)
const jsonFormCodecDefault = jsonCodec<FormData>();
const jsonResultDefault = encodeToQuery(jsonFormCodecDefault, formData);
console.log('JSON strategy (default):', jsonResultDefault.toString());

// Flat codec (individual parameters)
const flatFormCodec = flatCodec<FormData>();
const flatResult = encodeToQuery(flatFormCodec, formData);
console.log('Flat strategy:', flatResult.toString());

// JSON codec (custom key)
const jsonFormCodecCustom = jsonCodec<FormData>('form');
const jsonResultCustom = encodeToQuery(jsonFormCodecCustom, formData);
console.log('JSON strategy (custom key):', jsonResultCustom.toString());

// Prefix codec (namespaced)
const prefixFormCodec = prefixCodec<FormData>('form');
const prefixResult = encodeToQuery(prefixFormCodec, formData);
console.log('Prefix strategy:', prefixResult.toString());
