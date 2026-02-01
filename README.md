# Phrase Editor

A web tool for editing phrase lists (each line is a separate phrase) with support for up to 10,000 rows and a set of text transformations.

**Live Demo:** https://phrase-editor-pjxpgctr6-artems-projects-20cd3248.vercel.app/

## How to run locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Technologies

- **React 19** + **TypeScript** — UI framework
- **Tailwind CSS** — styling
- **Zustand** — state management
- **Vite** — build tool and dev server
- **Web Workers** — processing large texts without blocking UI
- **IndexedDB** — storage for large texts (>5 MB)
- **react-virtuoso** — virtualization for displaying long lists

## Implemented Features

### UI/UX

- ✅ Large text field (textarea with virtualization for >1000 rows)
- ✅ Operations panel with buttons (left side)
- ✅ Result preview (toggle between input/output in the same field)
- ✅ Metrics: number of rows, empty rows, words, characters, execution time of last operation
- ✅ Clear field
- ✅ Copy result to clipboard
- ✅ Import/export .txt files (upload/download)
- ✅ **File upload validation** (size and type checking)
- ✅ **Toast notifications** for errors and success messages
- ✅ **Drag & Drop** file support
- ✅ **Keyboard shortcuts** (Ctrl+Z/Y for undo/redo, Ctrl+C for copy)
- ✅ **Edit Line Modal** (replaces prompt() for better UX)

### Text Processing Operations

#### Case

- ✅ All uppercase (`uppercase`)
- ✅ All lowercase (`lowercase`)
- ✅ Each word capitalized (`title_case`)
- ✅ Only first word capitalized (`sentence_case`)

#### Symbols / Wrapping

- ✅ Add + before each word (`add_plus_prefix`)
- ✅ Remove + before words (`remove_plus_prefix`)
- ✅ Add quotes around line (`add_quotes`)
- ✅ Add square brackets around line (`add_brackets`)
- ✅ Add - at line start (`add_dash_prefix`)
- ✅ -[...] at start (`add_dash_brackets_prefix`)
- ✅ -"..." at start (`add_dash_quotes_prefix`)

#### Cleaning

- ✅ Remove extra spaces (`trim_spaces`)
- ✅ Remove tabs (`remove_tabs`)
- ✅ Remove everything after " -" (`remove_after_dash`)
- ✅ Replace spaces with \_ (`replace_spaces_with_underscore`)
- ✅ Remove special characters (`remove_special_chars`)
- ✅ Replace special characters with spaces (`replace_special_chars_with_spaces`)

#### Search/Replace

- ✅ Two fields: find and replace
- ✅ Replace across all lines
- ✅ Regex support (optional)
- ✅ Case sensitive option

#### Sorting and Uniqueness

- ✅ Sort lines A-Z (`sort_asc`) with locale support via `localeCompare`
- ✅ Sort lines Z-A (`sort_desc`)
- ✅ Sort lines A-Я (Cyrillic ascending) (`sort_asc_cyrillic`)
- ✅ Sort lines Я-А (Cyrillic descending) (`sort_desc_cyrillic`)
- ✅ Remove duplicate lines (`remove_duplicates`)
- ✅ Remove empty lines (`remove_empty_lines`)

### Action History (Undo/Redo)

- ✅ Undo/Redo with unlimited steps (implemented via history array)
- ✅ Step = one operation click or search/replace application
- ✅ After Undo and executing new operation — redo branch is reset (like in regular editors)
- ✅ History stored in memory, automatically cleared on new operations after undo

### Export Formats

- ✅ Export as .txt file
- ✅ Export as .csv file
- ✅ Export as .json file

## Project Requirements (Technical Specification)

### Context
Web tool for editing phrase lists (each line is a separate phrase). The tool must reliably work with volumes up to 10,000 rows and a set of typical text transformations.

**Reference UI/Logic:** http://www.mikes-marketing-tools.com/keyword-tool/

**Goal:** Check ability to build understandable UI/state architecture, accuracy of working with strings/Unicode, performance on large volumes, code quality, UX, and attention to details.

### 1. Technologies and Limitations

**Allowed:**
- Any modern stack: React / Angular
- Any UI-kit or custom CSS (Bootstrap/Tailwind/MUI — your choice)

**Not required:**
- Server-side code
- Database
- Authentication

**Storage:**
- In memory + can use LocalStorage/IndexedDB (e.g., for autosave/draft)

**Important:**
- Application must work in browser without backend
- Mandatory deployment (Vercel/Netlify/GitHub Pages or your server)

### 2. UI/UX (Minimum)

**Page with:**
- Large text field (textarea/editor) for pasting rows
- Operations panel (buttons)
- Ability to see "result" (in the same field or separate block — your choice)
- Status/metrics: number of rows, number of empty rows, execution time of last operation (approximate is fine)

**Functions:**
- Clear field
- Copy result to clipboard
- Import/export .txt (upload/download) — preferred

### 3. Text Processing Operations (Required)

**Example input line:** `сок ЦІНА`

**Case:**
- All uppercase → `СІК ЦІНА`
- All lowercase → `сік ціна`
- Each word capitalized → `Сік Ціна`
- Only first word capitalized → `Сік ціна`

**Symbols / Wrapping:**
- Add + before each word → `+сок +ціна`
- Remove + before words → `сок ЦІНА`
- Add quotes around line → `"Сік ЦІНА"`
- Add square brackets around line → `[Сік ЦІНА]`
- Add - at line start → `-Сік ЦІНА`
- -[...] at start (dash + square brackets) → `-[сок ЦІНА]`
- -"..." at start (dash + quotes) → `-"сок ЦІНА"`

**Cleaning:**
- Remove extra spaces (compress multiple spaces, remove spaces at edges)
- Remove tabulation \t
- Remove everything to the right after substring " -" (space+dash), including dash
  - Example: `сік ціна - вишня` → `сік ціна`
- Replace spaces with _ → `сок_ціна`
- Remove special characters: `() \ ~ ! @#$%^&*_=+[]\{} | ; ' : " , / < > ?`
- Replace special characters with spaces (same characters → space)

**Search/Replace:**
- Two fields: find and replace
- Replace across all lines (without regex is enough; regex is a bonus)

**Sorting and Uniqueness:**
- Sort lines A-Z (consider locale ru/ua via localeCompare)
- Sort lines Z-A
- Remove duplicate lines (line by line)

### 4. Action History (Required)

- Undo/Redo minimum 10 steps
- Step = one operation click (or "apply" search/replace)
- After Undo and executing new operation — redo branch must reset (like in regular editors)

### 5. Non-Functional Requirements

**Performance:**
- 10,000 rows: operations must execute without "freezing" interface
- If operation is potentially heavy — use batching/requestAnimationFrame/setTimeout/Web Worker (any smart solution)
- Cannot "render 10k DOM elements as rows" — work with text/array efficiently

**Quality:**
- Readable structure (modules/hooks/services/utilities — your choice)
- Careful handling of empty rows, spaces at start/end
- Errors should not break application

### 6. Deliverables

- Link to working version (deployment)
- Link to repository (GitHub/GitLab)
- README.md:
  - How to run locally
  - What solutions were adopted for performance/undo-redo
  - What wasn't completed / what would be improved

## Implementation Checklist

### High Priority (Completed ✅)
- [x] File upload validation
- [x] Toast notifications for errors
- [x] Replace prompt() with modal window
- [x] Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+C)

### Medium Priority (Completed ✅)
- [x] Drag & Drop for files
- [x] Toast notifications for successful operations
- [ ] Empty rows handling improvements
- [ ] Accessibility improvements

### Nice to Have
- [x] Export to CSV/JSON
- [ ] Additional operations
- [ ] Multilingual support

## Recent Improvements

### High Priority Improvements ✅

1. **File Upload Validation**
   - File size validation (max 10MB)
   - File type validation (only .txt files)
   - User-friendly error messages
   - Loading indicator for large files

2. **Error Handling**
   - Toast notifications for errors
   - User-friendly error messages
   - Error messages shown to users instead of just console logs

3. **Edit Line Modal**
   - Replaced `prompt()` with a modal window
   - Multi-line editing support
   - Save/Cancel buttons
   - Keyboard shortcuts (Ctrl+Enter to save, Esc to cancel)

### Medium Priority Improvements ✅

4. **Toast Notifications**
   - Success notifications for completed operations
   - Shows number of processed rows
   - Auto-dismiss after 3 seconds

5. **Keyboard Shortcuts**
   - Ctrl+Z / Cmd+Z - Undo
   - Ctrl+Y / Cmd+Y - Redo
   - Ctrl+C / Cmd+C - Copy (if text is selected, copies selection; otherwise copies all text)
   - Esc - Close modals

6. **Drag & Drop for Files**
   - Drag & drop support on text field
   - Visual indicator when dragging
   - File validation before upload

## Performance Solutions

### Web Workers

All text processing operations are executed in a separate Web Worker (`src/workers/text.worker.ts`), preventing UI blocking even when processing 10,000+ rows.

**Batching:**

- Operations processed by rows are split into batches of 1000 rows
- Progress is displayed in real-time via `postMessage`
- User sees progress indicator during processing

**Example:**

```typescript
// Operations are executed in batches of 1000 rows
const batchSize = 1000;
const batches = Math.ceil(lines.length / batchSize);
for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
  // Process batch
  // Send progress
}
```

### Rendering Virtualization

For texts >1000 rows, virtualization is automatically enabled via `react-virtuoso`:

- Only visible portion of text is rendered
- Scrolling works smoothly even with 50,000+ rows
- Can be manually controlled via Settings Panel

### Operation Caching

**LRU Cache with TTL** (`src/utils/cache.ts`):

- Stores results of heavy operations (sorting, duplicate removal)
- Automatically clears old entries
- Speeds up repeated calls with the same data

**Debouncing:**

- Metric updates and state saving happen with 500ms delay
- Reduces number of operations during fast text input

### IndexedDB for Large Texts

- Texts >5 MB are automatically stored in IndexedDB
- Automatic cleanup of oldest entries when exceeding 100 MB
- Fast access to saved texts

### Rendering Optimization

- Using `useMemo` for metric calculations
- Conditional rendering (don't render table if no data)
- Minimizing re-renders through proper Zustand usage

## Architecture

### Project Structure

```
src/
├── components/          # Common components (ErrorBoundary, PerformanceTester, SettingsPanel, Toast, EditLineModal, KeyboardShortcuts)
├── features/            # Functional modules
│   ├── Metrics/         # Metrics panel
│   ├── Operations/      # Operations panel and buttons
│   └── TextEditor/      # Text editor with virtualization
├── hooks/               # Custom hooks (useDebouncedCallback, useTextWorker, useFileDrop, useKeyboardShortcuts, useToast)
├── providers/           # React providers (PerformanceProvider, ToastProvider)
├── store/               # Zustand store (useStore.ts)
├── types/               # TypeScript types
├── utils/               # Utilities
│   ├── cache.ts         # LRU cache for operations
│   ├── indexedDB.ts     # IndexedDB service
│   ├── localStorage.ts  # LocalStorage service
│   ├── textOperations.ts        # Basic operations
│   ├── textOperationsExtended.ts # Extended operations
│   └── operationsConfig.ts      # Operations configuration
└── workers/             # Web Workers
    └── text.worker.ts   # Worker for text processing
```

### State Management

**Zustand Store** (`src/store/useStore.ts`):

- Centralized application state management
- Operation history (undo/redo)
- Text and operation metrics
- Settings (virtualization, autosave)

### Error Handling

**ErrorBoundary** (`src/components/ErrorBoundary.tsx`):

- Catches critical React errors
- Saves error stack to localStorage
- Shows user-friendly UI with recovery options

**Toast Notifications** (`src/components/Toast.tsx`):

- Success, error, info, and warning notifications
- Auto-dismiss with configurable duration
- Non-blocking user feedback

## Deployment

### Vercel

Project is configured for deployment on Vercel:

- `vercel.json` contains configuration for SPA routing
- Automatic deployment on GitHub push
- Build command: `npm run build`
- Output directory: `dist`

### GitHub Pages

Workflow `.github/workflows/deploy.yml` automatically:

1. Installs dependencies (`npm ci`)
2. Builds project (`npm run build`)
3. Deploys via `peaceiris/actions-gh-pages@v3`

### Netlify

You can use drag & drop of the `dist` folder or configure automatic deployment from GitHub.

## Future Improvements

### Potential Enhancements:

1. **Additional Export Formats:**
   - Excel (via library)

2. **Additional Operations:**
   - Join lines with separator
   - Split lines by separator
   - Number lines (1. 2. 3. or 01. 02. 03.)
   - Filter lines by condition

3. **UX Improvements:**
   - Real-time autosave with conflict resolution
   - Improved dark theme

4. **Performance:**
   - Streaming processing for very large files (>100 MB)
   - WebAssembly for critical operations
   - Service Worker for offline work

5. **Testing:**
   - Unit tests for operations
   - E2E tests for critical scenarios
   - Performance tests (PerformanceTester exists, but can be automated)

6. **Documentation:**
   - Detailed API documentation
   - Usage examples
   - Video tutorial

## License

MIT

## Author

Chasov Artem
