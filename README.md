# TradeOne - Trading Dashboard & Copier

A comprehensive trading platform for managing multiple trading accounts, copying trades in real-time, tracking payouts, and journaling your trading activity.

## 🚀 Features

- **Unified Dashboard** - Manage all your trading accounts in one centralized location
- **Trade Copier** - Copy trades across multiple accounts in real-time
- **Performance Analytics** - Track your trading performance with detailed session and strategy analysis
- **Trading Journal** - Log and analyze your trades with comprehensive metrics
- **Payout Tracker** - Monitor and manage your trading payouts
- **Admin Panel** - Control feature access, pricing, and maintenance mode
- **Real-time Sync** - Instant updates across all connected accounts

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 7.2.7
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Backend**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **State Management**: React Context API

## 📦 Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone git@github.com:mimenterprise125-cloud/tradeoneworking.git

# Step 2: Navigate to the project directory
cd tradeoneworking

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Step 5: Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable React components
│   ├── modals/         # Modal dialogs (AddJournalDialog, etc.)
│   ├── layout/         # Layout components
│   └── ui/            # UI component library
├── pages/              # Page components (Dashboard, Admin, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and contexts
│   ├── AuthProvider    # Authentication context
│   └── AdminContext    # Admin settings context
└── main.tsx            # Application entry point
```

## 🔧 Development

### Build

```sh
npm run build
```

### Run locally

```sh
npm run dev
```

### Lint & Format

```sh
npm run lint
```

## 📊 Key Features Explained

### Trading Sessions
Support for 7 different trading sessions:
- No Session
- London
- Asia
- New York
- London Killzone
- Asia Killzone
- New York Killzone

Session-specific performance analysis helps identify which sessions yield the best results.

### P&L Management
- Track Stop Loss (SL) and Take Profit (TP) levels
- Support for both price-based and points-based P&L tracking
- Required field validation for accurate performance metrics

### Admin Controls
- Feature locking system for different access levels
- Pricing tier management
- Maintenance mode for system updates
- Real-time settings synchronization

## 🚀 Deployment

To deploy this project:

1. Build the application: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Configure environment variables on your hosting platform
4. Ensure Supabase database is set up with the required schema

## 📝 Contributing

When contributing to TradeOne:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "feat: description"`
3. Push to the branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📧 Support

For support or questions, please contact the TradeOne team.
