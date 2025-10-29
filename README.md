# Hospitality Dashboard

A comprehensive admin panel for managing hotel or vacation rental units, bookings, scheduling, and contacts. Features a mock AI-powered agent for assistance.

## Live Demo

🚀 **View the live application**: [https://botlychat.github.io/Dashboard---Gv1/](https://botlychat.github.io/Dashboard---Gv1/)

## Features

- 📊 **Dashboard**: Overview of bookings, revenue, and occupancy
- 📅 **Calendar**: Manage bookings and availability
- 🏢 **Units Management**: Add and configure properties
- 🤖 **AI Agent**: Mock intelligent assistant for customer support (no API required)
- 👥 **Contacts**: Customer management system
- ⭐ **Reviews**: Feedback and ratings management
- 🌐 **Website Settings**: Customize your property websites
- ⚙️ **Account Settings**: Business configuration

## AI Agent Demo

The AI Agent feature includes a **mock chat interface** that demonstrates how an intelligent assistant would work for your hospitality business. The AI agent can:

- Answer customer questions about availability
- Provide pricing information
- Handle booking inquiries
- Offer personalized recommendations

**Note**: This uses simulated responses for demonstration purposes - no external API keys required!

## Run Locally

**Prerequisites:** Node.js

1. **Clone the repository:**
   ```bash
   git clone https://github.com/botlychat/Dashboard---Gv1.git
   cd Dashboard---Gv1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser to:**
   `http://localhost:3000/Dashboard---Gv1/`

## Build and Deploy

**Build for production:**
```bash
npm run build
```

**Deploy to GitHub Pages:**
The application automatically deploys to GitHub Pages when you push to the main branch.

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Charts**: Recharts
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## Architecture

- 📁 **`components/`** - Reusable UI components
- 📁 **`pages/`** - Main application pages
- 📁 **`services/`** - Mock AI service (no external dependencies)
- 📁 **`data/`** - Sample data and configurations
- 📁 **`hooks/`** - Custom React hooks
- 📁 **`utils/`** - Utility functions and translations

## Mock Data

The application comes with sample data for:
- Hotel units and properties
- Booking records
- Customer contacts
- AI agent configurations
- Website settings

## Multi-language Support

- 🇺🇸 English
- 🇸🇦 Arabic (RTL support)

## License

This project is for demonstration purposes.
