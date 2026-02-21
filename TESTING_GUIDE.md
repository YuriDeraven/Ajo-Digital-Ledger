# Ajo Digital Ledger - Complete Testing Guide

## System Overview

This is a **multi-tenant savings group management application** where:
- **Admins** manage their own groups, add members, record contributions, and execute payouts
- **Members** join groups via invite codes and view their transaction history
- **Multiple Groups**: Members can join multiple groups and switch between them
- **Invite Codes**: 6-character alphanumeric codes enable secure member onboarding

---

## Test Scenario 1: Admin Creates a Group and Invites a Member

### Step 1: Admin Login
1. Go to http://localhost:3000
2. Sign In with credentials:
   - Email: `admin@test.com` (use any email with "admin" in it)
   - Password: `password123`
3. Expected: Redirected to `/admin` dashboard

### Step 2: Create a Group
1. On admin dashboard, click **"Create Group"** button
2. Fill in:
   - Group Name: `House Fund Q1 2024`
   - Description: `Monthly savings for group expenses`
3. Click **"Create"**
4. Expected: 
   - Group appears in the list
   - **Invite Code is displayed** (6-character code like "ABC123")
   - Member count: 1 (admin is auto-added)
   - Transaction count: 0

### Step 3: Record a Member Contribution (Optional - requires member first)
1. Click **"Manage"** on the group card
2. In the "Add Member" dialog:
   - Email: `member1@test.com`
   - Click **"Add Member"**
3. Expected: Member appears in members table
4. Click **"Record Payment"** next to member:
   - Amount: `50`
   - Click **"Record"**
5. Expected: Transaction appears in transactions list

### Step 4: Execute Payout
1. In group management page, click **"Run Payout"**
2. Expected:
   - Payout calculated: `Total Pool / Members = Payout Per Member`
   - Each member gets a PAYOUT transaction
   - Transactions list updated

---

## Test Scenario 2: Member Joins Group via Invite Code

### Step 1: Member Login
1. Go to http://localhost:3000 (in new tab/incognito if needed)
2. Sign Up with:
   - Name: `John Member`
   - Email: `member1@test.com`
   - Password: `password123`
3. Expected: Redirected to `/join-group` page
   - Shows welcome message: "Join a Group"
   - **"Enter Invite Code"** button visible

### Step 2: Enter Invite Code
1. Click **"Enter Invite Code"** button
2. In dialog, paste the **invite code** from admin's group (from Step 1.4 above)
3. Click **"Join Group"**
4. Expected: 
   - Success message: "Successfully joined group!"
   - Redirected to `/dashboard`
   - Group card appears with name and member/transaction counts

### Step 3: View Transactions
1. On member dashboard, click the group card
2. Expected: 
   - Group selected (highlighted in blue)
   - Transactions table populated:
     - **CONTRIBUTION** type: Amount member paid in
     - **PAYOUT** type: Amount member received
   - Stats cards show:
     - Total Contributed
     - Total Received (Payout)
     - Group Members count

---

## Test Scenario 3: Member Joins Multiple Groups

### Step 1: Admin Creates Second Group
1. Login as admin (from Scenario 1)
2. Create another group:
   - Name: `Rent Pool Q1 2024`
   - Description: `Shared rent expenses`
3. Copy the new **invite code**

### Step 2: Member Joins Second Group
1. Login as member from Scenario 2
2. On member dashboard, click **"Join Another Group"** button
3. Enter the **new invite code**
4. Click **"Join Group"**
5. Expected: Second group appears in the groups grid

### Step 3: Switch Between Groups
1. Click on different group cards
2. Expected: 
   - Selected group highlighted in blue
   - Transactions table updates with that group's transactions
   - Stats cards update accordingly

---

## Test Scenario 4: Admin Manually Adds Member by Email

### Step 1: Create Group
1. Login as admin
2. Create a new group: `Emergency Fund`
3. Copy invite code

### Step 2: Add Member by Email
1. Click **"Manage"** on the group
2. Click **"Add Member"**
3. Enter member email: `newmember@test.com`
4. Click **"Add"**
5. Expected: Member appears in members table

### Step 3: New Member Joins
1. Create new account with `newmember@test.com`
2. Login as this user
3. On `/join-group` page, skip entering code (or use the invite code)
4. Expected: Can see the group in dashboard if they joined via code

---

## Test Scenario 5: Role-Based Routing

### Admin Try to Access Member Dashboard
1. Login as admin
2. Manually navigate to http://localhost:3000/dashboard
3. Expected: Redirected back to `/admin`

### Member Try to Access Admin Dashboard
1. Login as member
2. Manually navigate to http://localhost:3000/admin
3. Expected: Redirected to `/join-group` or `/dashboard`

---

## Key Features to Verify

### Admin Dashboard
- ✅ Shows all groups created by this admin
- ✅ Stats: Active Groups, Total Members, Total Transactions
- ✅ Groups table with Manage buttons
- ✅ Create Group button
- ✅ "Manage" button routes to `/admin/groups/[groupId]`

### Group Management Page
- ✅ Members list with member names/emails
- ✅ "Record Payment" button per member
- ✅ Transaction history (CONTRIBUTION + PAYOUT types)
- ✅ "Run Payout" button distributes funds equally
- ✅ "Delete Member" buttons visible

### Member Dashboard
- ✅ Your Groups section shows all joined groups
- ✅ "Join Another Group" button with dialog
- ✅ Transactions table shows type, amount, description, date
- ✅ Stats show Total Contributed, Total Received, Members
- ✅ Clicking group card switches selected group

### Join Group Page
- ✅ Welcome message for first-time members
- ✅ "Enter Invite Code" button
- ✅ Dialog accepts 6-char invite codes (uppercase)
- ✅ Error message on invalid code
- ✅ Success message and redirect on valid code

---

## API Endpoints Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/admin/groups` | GET, POST | ADMIN | List and create groups |
| `/api/admin/groups/[id]` | GET | ADMIN | Get group details |
| `/api/admin/groups/[id]/members` | GET, POST | ADMIN | List and add members |
| `/api/admin/groups/[id]/members/[mid]` | DELETE | ADMIN | Remove member |
| `/api/admin/groups/[id]/transactions` | GET, POST | ADMIN | View and record transactions |
| `/api/admin/groups/[id]/payout` | POST | ADMIN | Execute group payout |
| `/api/member/groups` | GET | MEMBER | List user's groups |
| `/api/member/join-group` | POST | MEMBER | Join group via invite code |
| `/api/groups/[id]/transactions` | GET | MEMBER | Get group transactions |

---

## Database Schema

### User
- `id`: Unique identifier
- `email`: User email (unique)
- `name`: User name
- `role`: "ADMIN" or "MEMBER" (assigned on first signup)
- `createdAt`, `updatedAt`: Timestamps

### SavingsGroup
- `id`: Unique identifier
- `name`: Group name
- `description`: Optional description
- `inviteCode`: 6-char alphanumeric code (unique per group)
- `createdBy`: Admin user ID
- `createdAt`, `updatedAt`: Timestamps

### GroupMember
- `id`: Unique identifier
- `userId`: User ID
- `groupId`: Group ID
- `role`: "MEMBER" (typically)
- `joinedAt`: Timestamp when joined
- **Unique constraint**: (userId, groupId) - prevents duplicate memberships

### Transaction
- `id`: Unique identifier
- `groupId`: Group ID
- `userId`: User ID
- `amount`: Transaction amount
- `type`: "CONTRIBUTION" or "PAYOUT"
- `description`: Optional notes
- `createdAt`: Timestamp

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Invite code not found | Ensure code matches exactly (6 chars, uppercase). Check it's from the correct group. |
| Member can't join after email add | Use the invite code from the group instead of relying on email-based add. |
| No transactions showing | Records payments as admin in group management page first. |
| Admin can't see own groups | Check role field in User table - must be "ADMIN" for admin@test.com |
| Members seeing admin interface | Check session.user.role is "MEMBER" in browser console |

---

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL=file:./db/custom.db
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_DEBUG=true
```

---

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
prisma migrate dev --name <description>

# Reset database (WARNING: deletes all data)
prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

---

## Success Criteria

✅ Admin can create groups with unique invite codes
✅ Admin can manually add members by email
✅ Admin can record contributions and payouts
✅ Members can join groups via 6-character invite codes
✅ Members can view their transactions
✅ Members can join multiple groups and switch between them
✅ Members cannot see other members' transactions from other groups
✅ Admins cannot access member dashboards
✅ Members cannot access admin dashboards
✅ Payout distribution is equal among all members
✅ UI is intuitive with clear calls-to-action
