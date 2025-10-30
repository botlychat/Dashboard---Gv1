<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Hospitality Dashboard 🏨

A modern, bilingual (English/Arabic) dashboard for managing hospitality businesses including chalets, apartments, and hotel rooms.

## 🚀 Features

- **Multi-unit Management** - Manage multiple property groups (Chalets, Apartments, Hotel Rooms)
- **Booking System** - Track bookings with calendar view, pricing, and payment status
- **Contact Management** - Maintain guest information and communication history
- **Review System** - Track and analyze guest feedback
- **Dynamic Pricing** - Weekday-specific pricing and special date overrides
- **Calendar Integration** - Sync with external calendars (iCal/Google Calendar)
- **AI Agent Configuration** - Set up AI-powered booking assistance
- **Website Settings** - Customize theme, content, and social media links
- **Bilingual Support** - Full English and Arabic interface
- **WhatsApp Campaigns** - Send bulk messages to selected contacts

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- Git

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/botlychat/Dashboard---Gv1.git
   cd Dashboard---Gv1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local file
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to: `http://localhost:5173`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload enabled) |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with interactive UI |
| `npm run test:coverage` | Generate test coverage report |

## 🏗️ Project Structure

```
Dashboard---Gv1/
├── components/          # Reusable UI components
├── pages/               # Main application pages
├── hooks/               # Custom React hooks
├── utils/               # Utility functions & translations
├── data/                # Mock data
├── src/test/            # Test files
├── App.tsx              # Root component with routing
├── types.ts             # TypeScript type definitions
└── vite.config.ts       # Build configuration
```

## 🎨 Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Routing:** React Router v7
- **Charts:** Recharts
- **Styling:** Tailwind CSS
- **State:** React Context + localStorage
- **Testing:** Vitest + React Testing Library

## 🧪 Testing

**Run all tests:**
```bash
npm test
```

**Generate coverage report:**
```bash
npm run test:coverage
```

**Interactive test UI:**
```bash
npm run test:ui
```

Current test coverage: 9 tests passing across utility functions and components.

## 🚀 Deployment

**Deploy to GitHub Pages:**
```bash
npm run deploy
```

The app will be built and deployed automatically to your GitHub Pages URL.

**View your app in AI Studio:**  
https://ai.studio/apps/drive/1KRzboxr2FizKz-IRJFN2MIiCAVfY7lUS

## 📝 Data Storage

The application uses browser `localStorage` for data persistence. Key storage keys:

- `bookings` - Booking records
- `units` - Property units
- `unitGroups` - Property group configurations
- `contacts` - Guest contacts
- `reviews` - Guest reviews
- `pricingOverrides` - Special pricing rules
- `externalCalendars` - Synced calendar URLs
- `websiteSettings` - Website customization per group
- `aiConfig` - AI agent settings per group
- `accountSettings` - Global account preferences

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🤝 Contributing

This is a private repository. Contact the repository owner for contribution guidelines.

## 📧 Support

For support and questions, please contact the development team.

---

**Built with ❤️ by [botlychat](https://github.com/botlychat)**
