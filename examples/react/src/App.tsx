import React, { useState } from 'react';
import { z } from 'zod';
import { 
  useSearchParams, 
  useHashParams, 
  useLocalStorageCodec 
} from '@kvkit/react';
import { 
  flatCodec, 
  jsonCodec, 
  prefixCodec,
} from '@kvkit/codecs';

// Define Zod schemas for validation
const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  age: z.number().min(0).max(150),
  role: z.enum(['admin', 'user', 'guest']),
  bio: z.string().max(500, 'Bio must be under 500 characters'),
  isActive: z.boolean(),
});

const searchFormSchema = z.object({
  query: z.string(),
  category: z.string(),
  minPrice: z.number().min(0),
  maxPrice: z.number().min(0),
  inStock: z.boolean(),
});

const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark']),
  fontSize: z.number().min(10).max(24),
  language: z.enum(['en', 'es', 'fr', 'de']),
  notifications: z.boolean(),
});

const tabSchema = z.object({
  activeTab: z.enum(['search', 'user', 'preferences']),
  sidebarOpen: z.boolean(),
});

// Infer TypeScript types from Zod schemas
type UserForm = z.infer<typeof userFormSchema>;
type SearchForm = z.infer<typeof searchFormSchema>;
type Preferences = z.infer<typeof preferencesSchema>;
type TabState = z.infer<typeof tabSchema>;

// Default values
const defaultUser: UserForm = {
  name: '',
  email: '',
  age: 25,
  role: 'user',
  bio: '',
  isActive: true,
};

const defaultSearch: SearchForm = {
  query: '',
  category: 'all',
  minPrice: 0,
  maxPrice: 1000,
  inStock: true,
};

const defaultPreferences: Preferences = {
  theme: 'light',
  fontSize: 16,
  language: 'en',
  notifications: true,
};

const defaultTabs: TabState = {
  activeTab: 'search',
  sidebarOpen: false,
};

function SearchDemo() {
  // Use flat codec for search parameters - each field becomes a separate URL param
  const searchCodec = flatCodec<SearchForm>();
  const [search, setSearch] = useSearchParams(searchCodec, defaultSearch);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (field: keyof SearchForm, value: any) => {
    setSearch({ ...search, [field]: value });
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = searchFormSchema.safeParse(search);
    if (result.success) {
      console.log('Search submitted:', result.data);
      setValidationError(null);
    } else {
      setValidationError(result.error.errors[0]?.message || 'Validation error');
    }
  };

  return (
    <div className="demo-section">
      <h2>🔍 Search Form (URL Search Params + Flat Codec)</h2>
      <p>This form syncs with URL search parameters using a flat codec. Each field becomes a separate parameter.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="query">Search Query</label>
          <input
            id="query"
            type="text"
            value={search.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            placeholder="Enter search terms"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={search.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="books">Books</option>
            <option value="clothing">Clothing</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="minPrice">Min Price</label>
          <input
            id="minPrice"
            type="number"
            value={search.minPrice}
            onChange={(e) => handleInputChange('minPrice', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxPrice">Max Price</label>
          <input
            id="maxPrice"
            type="number"
            value={search.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              id="inStock"
              type="checkbox"
              checked={search.inStock}
              onChange={(e) => handleInputChange('inStock', e.target.checked)}
            />
            <label htmlFor="inStock">In Stock Only</label>
          </div>
        </div>

        <button type="submit">Search</button>
        {validationError && <div className="error">{validationError}</div>}
      </form>

      <div className="url-display">
        URL: {window.location.origin}/?{new URLSearchParams(searchCodec.encode(search)).toString()}
      </div>
    </div>
  );
}

function UserFormDemo() {
  // Use JSON codec for complex user data - entire object in one parameter
  const userCodec = jsonCodec<UserForm>('user');
  const [user, setUser] = useSearchParams(userCodec, defaultUser);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserForm, value: any) => {
    setUser({ ...user, [field]: value });
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = userFormSchema.safeParse(user);
    if (result.success) {
      console.log('User form submitted:', result.data);
      setValidationError(null);
    } else {
      setValidationError(result.error.errors[0]?.message || 'Validation error');
    }
  };

  return (
    <div className="demo-section">
      <h2>👤 User Form (URL Search Params + JSON Codec)</h2>
      <p>This form syncs with URL search parameters using a JSON codec. The entire form data is stored in one parameter.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={user.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            value={user.age}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={user.role}
            onChange={(e) => handleInputChange('role', e.target.value as UserForm['role'])}
          >
            <option value="guest">Guest</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={user.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              id="isActive"
              type="checkbox"
              checked={user.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
            />
            <label htmlFor="isActive">Active Account</label>
          </div>
        </div>

        <button type="submit">Save User</button>
        {validationError && <div className="error">{validationError}</div>}
      </form>

      <div className="url-display">
        URL: {window.location.origin}/?{new URLSearchParams(userCodec.encode(user)).toString()}
      </div>
    </div>
  );
}

function TabDemo() {
  // Use hash parameters for UI state that shouldn't affect page reloads
  const tabCodec = flatCodec<TabState>();
  const [tabState, setTabState] = useHashParams(tabCodec, defaultTabs);

  const setActiveTab = (tab: TabState['activeTab']) => {
    setTabState({ ...tabState, activeTab: tab });
  };

  const toggleSidebar = () => {
    setTabState({ ...tabState, sidebarOpen: !tabState.sidebarOpen });
  };

  return (
    <div className="demo-section">
      <h2>📑 Tab Navigation (Hash Params + Flat Codec)</h2>
      <p>This demo shows UI state synced with hash parameters. The tab state is preserved in the URL hash.</p>
      
      <div className="tabs">
        <button 
          className={`tab ${tabState.activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button 
          className={`tab ${tabState.activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          User Profile
        </button>
        <button 
          className={`tab ${tabState.activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
      </div>

      <div>
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={tabState.sidebarOpen}
            onChange={toggleSidebar}
          />
          <label>Show Sidebar</label>
        </div>
      </div>

      <div className="url-display">
        Hash: #{new URLSearchParams(tabCodec.encode(tabState)).toString()}
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Active Tab:</strong> {tabState.activeTab}<br />
        <strong>Sidebar:</strong> {tabState.sidebarOpen ? 'Open' : 'Closed'}
      </div>
    </div>
  );
}

function PreferencesDemo() {
  // Use localStorage for persistent user preferences
  const preferencesCodec = flatCodec<Preferences>();
  const [preferences, setPreferences] = useLocalStorageCodec(
    preferencesCodec,
    'user-preferences',
    defaultPreferences
  );

  const handleInputChange = (field: keyof Preferences, value: any) => {
    setPreferences({ ...preferences, [field]: value });
  };

  return (
    <div className="demo-section">
      <h2>⚙️ User Preferences (localStorage + Flat Codec)</h2>
      <p>These preferences are stored in localStorage and persist across browser sessions.</p>
      
      <div className="form-group">
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={preferences.theme}
          onChange={(e) => handleInputChange('theme', e.target.value as Preferences['theme'])}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="fontSize">Font Size: {preferences.fontSize}px</label>
        <input
          id="fontSize"
          type="range"
          min="10"
          max="24"
          value={preferences.fontSize}
          onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          value={preferences.language}
          onChange={(e) => handleInputChange('language', e.target.value as Preferences['language'])}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>

      <div className="form-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={(e) => handleInputChange('notifications', e.target.checked)}
          />
          <label>Enable Notifications</label>
        </div>
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Current Preferences:</strong><br />
        Theme: {preferences.theme}<br />
        Font Size: {preferences.fontSize}px<br />
        Language: {preferences.language}<br />
        Notifications: {preferences.notifications ? 'Enabled' : 'Disabled'}
      </div>
    </div>
  );
}

function PrefixCodecDemo() {
  // Demonstrate prefix codec to avoid parameter conflicts
  const userPrefixCodec = prefixCodec<{ name: string; email: string }>('user');
  const searchPrefixCodec = prefixCodec<{ query: string; page: number }>('search');
  
  const [userState, setUserState] = useSearchParams(userPrefixCodec, { name: '', email: '' });
  const [searchState, setSearchState] = useSearchParams(searchPrefixCodec, { query: '', page: 1 });

  return (
    <div className="demo-section">
      <h2>🏷️ Prefix Codec Demo (Namespaced Parameters)</h2>
      <p>Multiple forms can coexist without parameter conflicts using prefix codecs.</p>
      
      <div className="demo-grid">
        <div>
          <h3>User Info (user.* prefix)</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={userState.name}
              onChange={(e) => setUserState({ ...userState, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userState.email}
              onChange={(e) => setUserState({ ...userState, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
        </div>

        <div>
          <h3>Search Info (search.* prefix)</h3>
          <div className="form-group">
            <label>Query</label>
            <input
              type="text"
              value={searchState.query}
              onChange={(e) => setSearchState({ ...searchState, query: e.target.value })}
              placeholder="Search terms"
            />
          </div>
          <div className="form-group">
            <label>Page</label>
            <input
              type="number"
              value={searchState.page}
              onChange={(e) => setSearchState({ ...searchState, page: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>
      </div>

      <div className="url-display">
        URL: {window.location.origin}/?{
          new URLSearchParams({
            ...userPrefixCodec.encode(userState),
            ...searchPrefixCodec.encode(searchState)
          }).toString()
        }
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="container">
      <h1>🚀 kvkit React Demo</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
        Demonstrating codec-driven state synchronization with URLs and localStorage
      </p>

      <SearchDemo />
      <UserFormDemo />
      <TabDemo />
      <PreferencesDemo />
      <PrefixCodecDemo />

      <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>💡 What's happening here?</h3>
        <ul>
          <li><strong>Search Form:</strong> Uses flat codec with search params - each field is a separate URL parameter</li>
          <li><strong>User Form:</strong> Uses JSON codec with search params - entire form data in one parameter</li>
          <li><strong>Tab Navigation:</strong> Uses hash parameters for UI state that shouldn't trigger navigation</li>
          <li><strong>Preferences:</strong> Uses localStorage for persistent settings across sessions</li>
          <li><strong>Prefix Demo:</strong> Shows how multiple forms can coexist without parameter conflicts</li>
        </ul>
        <p>
          <strong>Try this:</strong> Fill out the forms, copy the URL, and paste it in a new tab. 
          The state will be restored! Refresh the page and your localStorage preferences will persist.
        </p>
      </div>
    </div>
  );
}

export default App;
