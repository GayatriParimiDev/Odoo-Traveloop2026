<div align="center">
  <img src="./logo.png" alt="Traveloop Logo" width="250" />
  <h1>Traveloop 🪐</h1>
  <p><em>"Sun-Baked Simplicity" — Luxurious warmth meets disciplined minimalism for the ultimate trip planning experience.</em></p>
  <p>Built for the <strong>Odoo Hackathon</strong></p>
</div>

<br />

Traveloop is a comprehensive travel planning platform. It empowers users to seamlessly plan multi-city trips, build dynamic itineraries, manage expenses, and keep a travel journal, all within a beautifully crafted, warm, and minimalist interface.

## ✨ Features

- 🗺️ **Multi-City Trip Planning**: Seamlessly organize trips with multiple stops and destinations.
- 📅 **Enhanced Dynamic Itinerary Builder**: Smart city autocomplete, interactive stop management, and real-time database persistence.
- 🔍 **Activity Search & Discovery**: Browse and filter thousands of activities by category, cost, and duration with instant "add to stop" functionality.
- 💰 **Expense Tracking**: Keep a close eye on your budget with auto-calculated trip budgets and expense categorization.
- 🎒 **Packing Checklist**: Never forget an essential item again.
- 📓 **Travel Journal**: Document your journey and preserve your memories.
- 🌍 **Shared/Public Trips**: Share your adventures with friends or the public.
- 🔒 **Secure Authentication**: Custom JWT-based authentication system with a redesigned immersive onboarding interface.

## 🛠️ Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,nodejs,express,postgres" alt="Tech Stack Images" />
</div>

### Frontend
- **React 18** (via Vite)
- **React Router DOM** for navigation
- **Design System**: Custom "Sahara" warm minimalism (EB Garamond & Manrope typography)

### Backend
- **Node.js** & **Express.js**
- **PostgreSQL** (via `postgres` driver)
- **JWT** for secure authentication
- **Bcrypt.js** for password hashing

## 🎨 Design Philosophy
Traveloop uses a "Sun-Baked Simplicity" design language.
- **Colors**: Warm earthy tones (Burnt Sienna `#c2652a`), Warm Linen backgrounds (`#faf5ee`), and Dusty Rose (`#8c3c3c`).
- **Typography**: Editorial serif (EB Garamond) paired with geometric sans-serif (Manrope) for a luxury feel.
- **Elevation**: Ultra-soft shadows and generous whitespace for a clutter-free, curated experience.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Odoo-Traveloop2026
   ```

2. **Database Setup**
   Execute the `schema.sql` file in your PostgreSQL database to create the necessary tables, enums, and triggers.
   ```bash
   psql -U your_username -d your_database -f schema.sql
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with your database credentials and JWT_SECRET
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to explore Traveloop.

## 📸 Screenshots

*(To see the platform in action, check out the provided screenshots in the repository)*
- `login.png` - User authentication interface
- `dashboard.png` - Main user dashboard
- `left-panel.png` - Immersive signup visual background
- `itinerary_builder.png` - The dynamic stop and activity orchestrator
- `activity_search.png` - The database-driven activity discovery engine

---
<div align="center">
  Built with ❤️ for the Odoo Hackathon.
</div>
