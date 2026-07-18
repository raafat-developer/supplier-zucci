# Zucci Supplier Connect — Vue 3

Vendor management platform for Zucci marketplace, built with Vue 3 Composition API.

## Tech Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router 4** (hash-based routing)
- **Pinia** (state management)
- **Tailwind CSS 3** (utility-first styling)
- **Chart.js 4** (interactive charts)
- **Lucide Vue Next** (icons)
- **Vite 6** (build tool)

## Getting Started

```bash
cd vue-project
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
src/
├── assets/styles/     # CSS: variables, auth, components
├── components/
│   ├── layout/        # AppLayout, AppSidebar, AppTopbar
│   ├── ui/            # Badge, Button, Switch, SearchableSelect, PhoneInput, DataTable, Checkbox, SearchField
│   ├── shared/        # ToastContainer, ModalContainer, AppDrawer, OtpPopup, AccountManagerCard, ZucciFooter
│   └── settings/      # SettingsSection, InfoRow
├── composables/       # useModal, useToast
├── data/              # Mock data, banks, categories, countries
├── router/            # Vue Router config (all routes)
├── stores/            # Pinia stores (app, auth, brand)
├── views/
│   ├── auth/          # LoginView, RegisterView, PendingView, LoadingView
│   ├── analytics/     # AnalyticsView, ReportView
│   ├── files/         # FilesView
│   ├── finance/       # FinanceView
│   ├── notifications/ # NotificationsView
│   ├── orders/        # OrderList, OrderDetail
│   ├── products/      # ProductList, ProductDetail, ProductAdd, SizeCharts
│   ├── settings/      # General, MyAccount, Business, Brands, BrandDetail, Team, Integrations
│   └── DashboardView.vue
├── App.vue
└── main.js
```

## Features

- **Auth**: Login (email → password → OTP), Registration (9-step conversational), Pending approval screen
- **Dashboard**: KPIs with sparkline charts, revenue area chart, market doughnut, recent orders, tier card, partnership manager
- **Products**: List with filters, detail/edit with variants & pricing, add new product, size charts
- **Orders**: List with stats bar, detail with items table, activity timeline, comments with @mentions
- **Finance**: Earnings chart, transaction history, payout requests
- **Analytics**: 6 KPI cards, 4 chart cards, drill-down report pages
- **Files**: Grid view, preview modal (images/video/PDF)
- **Notifications**: Filtered by type (orders/products/transactions/system)
- **Settings**: General, My Account (with OTP verification), Business (markets, banking), Brands (social media, assets, synced stores), Team (role groups, invite), Integrations

## Design System

- **Font**: Geist (sans) + Geist Mono
- **Colors**: shadcn/ui CSS variables (light/dark mode)
- **Components**: shadcn-inspired (Badge, Switch, Button, SearchableSelect, DataTable)
- **Charts**: Chart.js with gradient fills, shadcn color palette
- **Sidebar**: Collapsible with slide-down submenus, brand switcher
