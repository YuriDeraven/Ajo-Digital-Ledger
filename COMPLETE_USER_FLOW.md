# Ajo Digital Ledger - Complete User Flow

## 🔑 Login & Redirect Logic

```
                    ┌─────────────────────┐
                    │   Visit /          │
                    │  (Login Page)       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Enter Email & Name  │
                    │ Click Sign Up/In    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Credentials Provider│
                    │ Creates/Gets User   │
                    │ Detects Role        │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌────────────────────┐       ┌────────────────────┐
    │ Role = ADMIN       │       │ Role = MEMBER      │
    │ (email w/ "admin") │       │ (other email)      │
    └────────┬───────────┘       └────────┬───────────┘
             │                            │
             ▼                            ▼
    ┌────────────────────┐       ┌────────────────────┐
    │   /admin           │       │   /join-group      │
    │ Create Groups      │       │ Enter Invite Code  │
    │ Get Invite Codes   │       │ Join Group         │
    │ View Members       │       │                    │
    │ View Transactions  │       │                    │
    └────────────────────┘       └────────┬───────────┘
                                         │
                                    Joined?
                                         │
                                         ▼
                            ┌────────────────────┐
                            │   /dashboard       │
                            │ View Groups        │
                            │ Add Transactions   │
                            │ View History       │
                            └────────────────────┘
```

---

## 📊 Admin Flow - Detailed

### **Step 1: Sign Up as Admin**
```
Homepage (/)
  │
  ├─ Sign Up Tab
  │  │
  │  ├─ Email: admin@test.com
  │  ├─ Name: Admin User
  │  └─ Click: Sign Up
  │
  └─ Backend creates ADMIN user (role=ADMIN)
     │
     └─ Redirect to: /admin
```

### **Step 2: Create Group (Admin Dashboard)**
```
/admin Dashboard
  │
  ├─ Shows: Active Groups, Members, Transactions (stats)
  ├─ Shows: Group table with existing groups
  │
  ├─ Click: "+ Create Group" button
  │  │
  │  ├─ Modal opens
  │  │  ├─ Group Name: "Office Savings"
  │  │  ├─ Description: "Monthly savings"
  │  │  └─ Click: Create
  │  │
  │  └─ Backend:
  │     ├─ Creates SavingsGroup record
  │     ├─ Generates inviteCode: "ABC123"
  │     ├─ Adds admin as ADMIN member
  │     └─ Returns group data
  │
  └─ Result: New group appears in table
     │
     └─ Column: "Invite Code" shows "ABC123"
```

### **Step 3: View Group Details (Optional)**
```
/admin Dashboard
  │
  ├─ Click: "Manage" button on group row
  │  │
  │  └─ Navigate to: /admin/groups/[groupId]
  │
  └─ /admin/groups/[groupId] page shows:
     ├─ Group name
     ├─ Members table
     │  └─ Name, Email, Role
     ├─ Transactions table
     │  └─ User, Amount, Type, Date
     └─ Payout management
        └─ Record distribution payments
```

### **Admin's Invite Code**
```
The invite code is displayed in the admin dashboard table:

┌──────────────────┬─────────┬──────────┬──────────┬────────┐
│ Group Name       │ Members │ Trans    │ Code     │ Action │
├──────────────────┼─────────┼──────────┼──────────┼────────┤
│ Office Savings   │    1    │    0     │ ABC123   │ Manage │
└──────────────────┴─────────┴──────────┴──────────┴────────┘

ADMIN SHARES THIS CODE WITH MEMBERS: ABC123
```

---

## 👥 Member Flow - Detailed

### **Step 1: Sign Up as Member**
```
Homepage (/)
  │
  ├─ Sign Up Tab
  │  │
  │  ├─ Email: member@test.com (NO "admin" in email!)
  │  ├─ Name: John Member
  │  └─ Click: Sign Up
  │
  └─ Backend creates MEMBER user (role=MEMBER)
     │
     └─ Redirect to: /join-group
```

### **Step 2: Join Group**
```
/join-group Page
  │
  ├─ Shows: "My Groups" (empty at first)
  │
  ├─ Click: "+ Join Group" button
  │  │
  │  ├─ Dialog opens: "Enter invite code"
  │  │  │
  │  │  ├─ Input code: "ABC123"
  │  │  └─ Click: "Join"
  │  │
  │  └─ Backend:
  │     ├─ Validates invite code
  │     ├─ Finds SavingsGroup with code "ABC123"
  │     ├─ Adds member to GroupMembers
  │     └─ Returns success
  │
  └─ Result: Success message
     │
     └─ Redirects to: /dashboard
```

### **Step 3: View Groups & Add Transaction**
```
/dashboard Page
  │
  ├─ Shows: "My Groups"
  │  ├─ List of groups I joined
  │  │
  │  └─ Click group: Shows details
  │     │
  │     ├─ Group name and description
  │     ├─ Current balance
  │     ├─ Members list
  │     └─ Transaction history
  │
  ├─ Click: "+ Add Transaction"
  │  │
  │  ├─ Modal opens
  │  │  ├─ Amount: 50
  │  │  ├─ Type: CONTRIBUTION (or PAYOUT)
  │  │  ├─ Description: "Weekly savings"
  │  │  └─ Click: Add
  │  │
  │  └─ Backend:
  │     ├─ Creates Transaction record
  │     ├─ type=CONTRIBUTION, amount=50
  │     └─ Returns updated group
  │
  └─ Result: Transaction appears in list
     │
     └─ Balance updates: +50 (for contributions)
```

---

## 💰 Transaction Types

### **CONTRIBUTION**
```
Member adds money to savings pool
Example: "I'm saving $50 this week"
Effect: Group balance += 50
```

### **PAYOUT**
```
Member receives payout from savings pool
Example: "I'm taking $100 out"
Effect: Group balance -= 100
```

### **Balance Calculation**
```
Group Balance = Sum(All CONTRIBUTION amounts) - Sum(All PAYOUT amounts)

Example:
- Member A contributes: $50 → Balance: +50
- Member B contributes: $75 → Balance: +125
- Member A payout: $100 → Balance: +25
```

---

## 🔄 Multi-Member Example

### **Scenario: 3 Members, 1 Group**

#### **Setup Phase**
```
1. Admin creates group "Office Savings" → Code: ABC123

2. Member A joins with ABC123
3. Member B joins with ABC123
4. Member C joins with ABC123

Result: Group has 3 members
```

#### **Activity Phase**
```
1. Member A: Contributes $100
   Group Balance: $100

2. Member B: Contributes $80
   Group Balance: $180

3. Member C: Contributes $120
   Group Balance: $300

4. Member A: Payout $150
   Group Balance: $150

5. Member B: Payout $75
   Group Balance: $75
```

#### **Everyone's View**
```
From /dashboard:
- Office Savings group
- Balance: $75
- 3 members
- 5 transactions showing who did what
```

---

## 📱 Device Compatibility

### **Desktop** ✅
- Full UI with all features
- Smooth animations
- Optimized layout

### **Tablet** ✅
- Responsive cards
- Touch-friendly buttons
- Adapted navigation

### **Mobile** ✅
- Stacked layout
- Full functionality
- Mobile-optimized

---

## 🔐 Security & Roles

### **Admin Capabilities**
- Create groups
- View all members in their groups
- View all transactions
- Manage group settings
- Access: `/admin`, `/admin/groups/[id]`

### **Member Capabilities**
- Join groups with code
- View joined groups
- Add transactions
- View transaction history
- Access: `/join-group`, `/dashboard`

### **Guests**
- View login page
- Create account
- Access: `/` (login page only)

---

## 📲 Key Pages Reference

### **Login/Signup** `/`
```
For both admins and members
Two tabs: Sign In & Sign Up
No password needed (demo mode)
```

### **Admin Dashboard** `/admin`
```
Admin-only
Create groups here
View all groups and invite codes
Click "Manage" for details
```

### **Admin Group Details** `/admin/groups/[groupId]`
```
Admin-only (for that group)
View members and transactions
Record payouts to members
Copy invite code
```

### **Join Group** `/join-group`
```
Member-only
Join groups with invite code
View joined groups
Auto-redirects if already in groups
```

### **Member Dashboard** `/dashboard`
```
Member-only
Show joined groups
Select group for details
Add contributions/payouts
View transaction history
```

---

## ✅ Complete Test Workflow (15 minutes)

### **Admin Setup (5 min)**
```
1. Sign up: admin@demo.com
2. Redirects to /admin
3. Click "+ Create Group"
4. Name: "Test Savings"
5. Create
6. Copy invite code from table
7. Share code: "ABC123"
```

### **Member Join (5 min)**
```
1. Sign up: user@demo.com
2. Redirects to /join-group
3. Click "+ Join Group"
4. Enter code: "ABC123"
5. Success!
6. Redirects to /dashboard
7. See "Test Savings" group
```

### **Add Transactions (5 min)**
```
1. On /dashboard
2. Select "Test Savings" group
3. Click "+ Add Transaction"
4. Amount: 50
5. Type: CONTRIBUTION
6. Click "Add"
7. See transaction in list
8. See balance updated: $50
9. Repeat with PAYOUT to see balance change
```

---

## 🎯 Summary

**Admin**: Creates group → Generates code → Shares code

**Members**: Enter code → Join group → Add transactions

**System**: Tracks everything → Calculates balances → Shows history

**Result**: Transparent, digital savings group management! 🎉
