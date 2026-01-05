# Ajo Digital Ledger

A modern, transparent digital ledger application for community savings groups (Ajo, Susu, Stokvel). This application provides secure tracking of contributions and payouts with full transparency for all group members.

## 🎯 Features

### Core Functionality
- **User Authentication**: Simple email-based registration and login
- **Group Management**: Create new savings groups or join existing ones via invite codes
- **Transaction Tracking**: Record contributions and payouts with detailed descriptions
- **Real-time Balance**: Automatic calculation of group and individual balances
- **Transparent History**: Complete transaction history visible to all group members
- **Security**: Group-based access control ensures members can only see their own groups

### Key Features Demonstrated
1. **User Authentication** - Full user registration, login, and secure session management
2. **Group Creation/Joining** - Create savings circles and invite users via unique codes
3. **Ledger Schema** - Secure transaction tracking with amount, type, timestamp, and user info
4. **Balance Calculation** - Real-time server-side balance calculations from transaction data
5. **Responsive Design** - Mobile-first design that works on all devices

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** icons

### Backend
- **Next.js API Routes** for server-side logic
- **NextAuth.js** for authentication
- **Prisma ORM** for database operations
- **SQLite** for data storage

### Database Schema
- **Users**: Authentication and user information
- **SavingsGroups**: Group details and invite codes
- **GroupMembers**: Membership relationships with roles
- **Transactions**: Complete transaction ledger

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npm run db:push
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage Guide

### 1. Authentication
- **Sign Up**: Enter your email and name to create an account
- **Sign In**: Use your email to log in (no password required for demo)

### 2. Creating a Group
- Click "Create Group" in the sidebar
- Enter group name and optional description
- Your group will be created with a unique invite code
- You'll automatically become the group admin

### 3. Joining a Group
- Get the invite code from a group member
- Enter the code in the "Join Group" section
- You'll be added as a regular member

### 4. Recording Transactions
- Select a group from your groups list
- Click "Add Transaction"
- Enter amount, select type (Contribution/Payout), and add description
- The transaction is recorded and visible to all group members

### 5. Viewing History
- All transactions are displayed in chronological order
- Contributions show in green (+)
- Payouts show in red (-)
- Each transaction shows the user, amount, and date

## 🔒 Security Features

- **Group Isolation**: Members can only access groups they belong to
- **Transaction Validation**: Server-side validation prevents invalid transactions
- **Payout Controls**: Payouts are limited to available group balance
- **Session Management**: Secure authentication with NextAuth.js

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth configuration
│   │   ├── groups/                # Group management APIs
│   │   └── groups/[groupId]/transactions/  # Transaction APIs
│   ├── page.tsx                   # Main application page
│   └── layout.tsx                 # Root layout with providers
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── providers.tsx              # Session provider wrapper
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   └── db.ts                      # Prisma client
├── types/
│   └── next-auth.d.ts            # TypeScript extensions
└── prisma/
    └── schema.prisma              # Database schema
```

## 🎨 Design Principles

- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: Semantic HTML and ARIA support
- **User Experience**: Clear visual feedback and intuitive navigation
- **Transparency**: All group members can see complete transaction history

## 🔮 Future Enhancements

- **Monthly Reports**: Automated contribution and payout summaries
- **Member Roles**: Enhanced permissions for group admins
- **Transaction Categories**: Better organization with custom categories
- **Email Notifications**: Alerts for new transactions
- **Export Features**: Download transaction history as CSV/PDF
- **Multi-Currency**: Support for different currencies
- **Recurring Contributions**: Automated regular contribution tracking

## 🤝 Contributing

This is a demonstration project showcasing Next.js development patterns. Feel free to use it as a reference for your own applications.

---

**Raven Tech - Built with ❤️ using Next.js 15, TypeScript, and modern web technologies**