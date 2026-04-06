# Finance Dashboard Frontend Client

The frontend client is a Single Page Application (SPA) built to deliver a highly interactive, responsive, and data-rich user experience for the Finance System. It perfectly couples with the Django backend endpoints.

---

## 🛠️ Tech Stack & Tooling

* **Framework:** React 18, scaffolded with Vite for instantaneous Hot Module Replacement (HMR) and optimized build times.
* **Routing:** `react-router-dom` v6 enforcing strict declarative route setups (`<Route path="..." />`). Features a robust Protected Route overlay that verifies JWT authentication status before allowing access to internal dashboard panels.
* **Component Styling:** Built fundamentally with vanilla CSS alongside native CSS variables (tokens) to implement a unified dark/modern aesthetic without the overhead of heavy CSS frameworks.
* **Data Visualization:** Utilizes `recharts` for smooth, animated, and responsive SVG graphing extending continuously across **all 12 fiscal months**.

---

## 🏗️ Structuring & Architecture

The frontend follows a highly modular tree structure to keep everything clean and decoupled:

* `/src/components`: Contains stateless layout definitions (Sidebar, Header, Layout wrapper).
* `/src/pages`: 
  * `Login.jsx` & `Register.jsx`: Public gateway handling JWT retrieval.
  * `Dashboard.jsx`: Primary grid layout fetching and parsing the `recharts` data. Employs 4 top-level analytical stat cards, displaying Revenue, Net Balance, Total Expenses, and specifically real-time **Today's Expenses**.
  * `FinanceRecords.jsx`: Data Management page divided into three dynamic columns: **Bulk Input** (supports .csv, .xls, .xlsx seamlessly), **Manual Entry** (allows for fast, single-transaction manual inserts straight on the screen bypassing file setups), and **Live Filtering** features.
  * `UserManagement.jsx`: Admin-exclusive panel for mutuating account roles via API commands.
* `/src/api.js`: An Axios interceptor singleton that globally guarantees token insertion and graceful 401 unauthenticated redirects back to `/login`.
* `App.jsx`: Global context providers (Authentication, Dark Mode, Currency Setting) wrapping the Router logic.

---

## 🚀 Setup & Execution

1. Make sure Node.js (v18+) is installed.
2. Open a terminal to this directory (`/frontend/`) and run the setup scripts:
```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Building for Production
If you need to ship the frontend to a distributed cloud provider such as Vercel or Netlify, run:
```bash
npm run build
```
This generates an optimized static bundle in the `/dist` directory that you can safely orchestrate inside automated deployment pipelines.
