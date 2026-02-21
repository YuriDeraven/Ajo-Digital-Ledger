# Ajo Digital Ledger - Admin Flow Testing Guide

## Current Status
✅ Server running at http://localhost:3000
✅ Database configured
✅ Authentication system working

---

## Admin Flow (What You Requested)

### **Step 1: Sign In as Admin**
1. Go to http://localhost:3000
2. Use email containing **"admin"** (e.g., `admin@test.com`)
3. Enter name (e.g., "Admin User")
4. Click "Sign Up" (creates admin automatically)
5. **Expected:** Redirects to `/admin` dashboard

### **Step 2: Create a Savings Group**
1. On Admin Dashboard (`/admin`)
2. Click **"+ Create Group"** button
3. Enter:
   - **Group Name**: (e.g., "My Savings Group")
   - **Description**: (optional, e.g., "Weekly savings for community")
4. Click **"Create"**
5. **Expected:** Group appears in list with auto-generated invite code

### **Step 3: Get the Invite Code**
1. In the admin dashboard, find your created group
2. Look for the **Invite Code** displayed next to the group
3. **Format**: 6 uppercase letters (auto-generated, e.g., `ABC123`)
4. **Copy this code** - members will use it to join

### **Step 4: Share Code with Members**
- Members will go to `/join-group`
- Enter this invite code
- They'll be added to your group

---

## Member Flow (For Testing)

### **Step 1: Sign In as Member**
1. Go to http://localhost:3000
2. Use email **NOT containing "admin"** (e.g., `member@test.com`)
3. Enter name (e.g., "John Member")
4. Click "Sign Up"
5. **Expected:** Redirects to `/join-group` page

### **Step 2: Join a Group**
1. On Join Group page (`/join-group`)
2. Click **"+ Join Group"** button
3. Enter the **invite code** from Step 3 above
4. Click **"Join"**
5. **Expected:** Message shows "You've joined the group!"

### **Step 3: View Dashboard**
1. After joining, should redirect to `/dashboard`
2. Shows:
   - Your groups
   - Transactions
   - Group balance
   - Members in group

---

## Expected Page Routes

| Route | User Type | Purpose |
|-------|-----------|---------|
| `/` | Any | Login/Sign up page |
| `/admin` | ADMIN | Create groups, view invite codes |
| `/join-group` | MEMBER | Join existing groups with invite code |
| `/dashboard` | MEMBER | View joined groups and transactions |
| `/admin/groups/[id]` | ADMIN | Manage specific group, view members & transactions |

---

## Key Features to Test

### **Admin Features**
- ✅ Create new savings groups
- ✅ Get unique invite codes for each group
- ✅ View all members in group
- ✅ View all transactions
- ✅ Track group balance

### **Member Features**
- ✅ Join groups using invite code
- ✅ View my groups
- ✅ Record contributions
- ✅ Record payouts
- ✅ View transaction history

---

## Demo Test Case

### **Admin Setup (5 minutes)**
```
1. Sign in: admin@example.com
2. Create group: "Office Savings"
3. Get code: ABC123 (example)
4. Copy code
```

### **Member Joins (2 minutes)**
```
1. Sign in: member@example.com
2. Go to /join-group
3. Enter code: ABC123
4. Success!
```

### **Member Transactions (3 minutes)**
```
1. Add contribution: $50
2. View transaction in history
3. See group balance update
```

---

## Troubleshooting

**If login loops back to sign in:**
- Clear browser cache
- Try different email
- Check that role detection is working (see logs)

**If /join-group page doesn't load:**
- Ensure you're logged in as MEMBER (no "admin" in email)
- Check browser console for errors

**If invite code not visible:**
- Refresh admin page
- Check that group was actually created

---

## Architecture Overview

### **Authentication Flow**
```
Sign In → Credentials Provider → Database Query
→ Create/Get User with Role
→ Generate JWT Token → Redirect based on role
```

### **Role Detection**
- Email containing "admin" → ADMIN role
- Other emails → MEMBER role

### **Group Invite System**
```
Admin creates group → System generates invite code
→ Member enters code → Member joined to group
→ Member can see transactions
```

---

## Database Schema
- **Users**: id, email, name, role (ADMIN/MEMBER)
- **SavingsGroups**: id, name, description, inviteCode, createdBy, createdAt
- **GroupMembers**: id, userId, groupId, role, joinedAt
- **Transactions**: id, groupId, userId, amount, type (CONTRIBUTION/PAYOUT), description, createdAt
