# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Start the Development Server
```bash
cd "c:\Users\HomePC\Desktop\In Repo\Ajo-Digital-Ledger"
npm run dev
```
Server runs on http://localhost:3000

### 2. Create Your First Admin Account
Go to http://localhost:3000
- **Sign Up** tab
- Name: `Admin One`
- Email: `admin@test.com` (email MUST contain "admin")
- Password: `password123`
- Click **Sign Up**
- ✅ Redirected to `/admin` dashboard

### 3. Create a Group
On the admin dashboard:
- Click **"Create Group"** button
- Group Name: `My Savings Group`
- Description: `Group for testing`
- Click **"Create"**
- ✅ **Note the 6-character invite code displayed** (e.g., "ABC123")

### 4. Create a Member Account
In a new tab or incognito window:
- Go to http://localhost:3000
- **Sign Up** tab
- Name: `Member One`
- Email: `member1@test.com` (does NOT contain "admin")
- Password: `password123`
- Click **Sign Up**
- ✅ Redirected to `/join-group` page

### 5. Member Joins the Group
On the `/join-group` page:
- Click **"Enter Invite Code"** button
- Paste the invite code from Step 3 (e.g., "ABC123")
- Click **"Join Group"**
- ✅ Redirected to `/dashboard` and group appears in "Your Groups"

### 6. Record a Contribution (as Admin)
Back to your admin tab:
- In the group, click **"Manage"**
- Click **"Add Member"**
- Email: `member1@test.com`
- Click **"Add"**
- Member appears in the members table
- Click **"Record Payment"** next to the member
- Amount: `100`
- Click **"Record"**
- ✅ Transaction appears in the list

### 7. Execute a Payout (as Admin)
Still in group management:
- Click **"Run Payout"** button
- ✅ Payout calculated and distributed
- Each member gets a PAYOUT transaction

### 8. View Results (as Member)
Back to member tab:
- Refresh `/dashboard`
- Click the group card
- ✅ See both CONTRIBUTION and PAYOUT transactions
- Stats show Total Contributed and Total Received

---

## 📋 Feature Checklist

### Admin Features
- ✅ Create multiple groups
- ✅ View all my groups
- ✅ Add members by email
- ✅ Record contributions
- ✅ Execute payouts
- ✅ View transactions

### Member Features
- ✅ Join groups with invite code
- ✅ View groups I'm part of
- ✅ Switch between groups
- ✅ Join multiple groups
- ✅ View transactions per group
- ✅ See contribution and payout amounts

### Security
- ✅ Role-based access (ADMIN vs MEMBER)
- ✅ Data isolation (can't see other admins' groups)
- ✅ Membership verification (can't join twice)
- ✅ Admin verification (can't manage other groups)

---

## 🔑 Test Credentials

### Pre-created Accounts
| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| `admin@test.com` | `password123` | ADMIN | Main admin account |
| `admin2@test.com` | `password123` | ADMIN | Second admin (separate groups) |
| `member@test.com` | `password123` | MEMBER | Regular member |
| `member2@test.com` | `password123` | MEMBER | Another member |

### Creating New Accounts
**Just Sign Up** with any email containing "admin" (for ADMIN role) or not containing "admin" (for MEMBER role).

---

## 🎯 Common Tasks

### Task 1: Add Multiple Members to a Group
1. As admin, click "Manage" on group
2. Click "Add Member" dialog
3. Enter member email (or their email after they sign up)
4. Repeat for all members

### Task 2: Record Multiple Contributions
1. As admin, for each member click "Record Payment"
2. Enter amount each member paid
3. Click Record
4. Repeat for all members

### Task 3: See Equal Payout
1. As admin, click "Run Payout"
2. Payout = Total Pool / Number of Members
3. Example:
   - 3 members pay $100, $100, $50 each
   - Total Pool = $250
   - Payout Per Member = $250 / 3 = $83.33
   - Each member gets $83.33 PAYOUT transaction

### Task 4: Member Joins Second Group
1. As member, click "Join Another Group"
2. Enter invite code from a different group
3. Click "Join Group"
4. Group appears in "Your Groups"
5. Click group to see its transactions

---

## 🔍 Troubleshooting

### "Invalid invite code" error
- ✅ Check you copied the code correctly
- ✅ Make sure you're using the invite code from the RIGHT group
- ✅ Codes are case-insensitive but display in UPPERCASE

### Member not showing in group
- ✅ Make sure you clicked "Add Member" button
- ✅ Email must match user's email exactly
- ✅ If new email, member must sign up first or admin creates them

### Can't see admin dashboard
- ✅ Your email must contain "admin" (e.g., admin@test.com)
- ✅ Logout and login again to refresh role
- ✅ Check in browser console: `console.log(session)` to see role

### Transactions not showing
- ✅ Make sure contributions were recorded
- ✅ Make sure group was selected (highlighted in blue)
- ✅ Refresh the page
- ✅ Check payout button - might need to run payout first

### "You're already a member" error
- ✅ You already joined this group with that invite code
- ✅ You can only join once per group
- ✅ Try joining a different group

---

## 📊 Database Views

### View All Users
```bash
npx prisma studio
# Navigate to User table
```

### View All Groups
```bash
npx prisma studio
# Navigate to SavingsGroup table
```

### View Transactions
```bash
npx prisma studio
# Navigate to Transaction table
# Filter by groupId or userId
```

---

## 🧪 Testing Scenarios

### Scenario 1: Single Admin, Multiple Members
1. Create admin@test.com
2. Create group "House Fund"
3. Invite member1@test.com and member2@test.com
4. Record $100 from member1, $50 from member2
5. Run payout ($75 each)
6. Verify both members see correct transactions

### Scenario 2: Multiple Admins
1. Create admin@test.com
2. Create admin2@test.com
3. Each creates their own group
4. admin@test.com CANNOT see admin2's groups
5. Each group has separate transactions

### Scenario 3: Member Joins Multiple Groups
1. Create 2 groups with different admin accounts
2. member@test.com joins both with invite codes
3. member sees both groups on dashboard
4. member switches between groups
5. Each group shows different transactions

---

## 💡 Pro Tips

1. **Invite Code Demo**: Use invite codes to quickly add members
2. **Quick Testing**: Use consistent email patterns (admin@, member@) for easy role testing
3. **Payout Math**: Payout always divides total evenly by member count
4. **Multiple Groups**: Members can join unlimited groups and switch between them
5. **Data Privacy**: Members only see their own groups' transactions

---

## 🚨 Important Notes

- ⚠️ This uses **SQLite** - fine for development, use PostgreSQL for production
- ⚠️ No password hashing yet - demo purposes only
- ⚠️ No email verification - use real emails for production
- ⚠️ Data in `./db/custom.db` persists between restarts
- ⚠️ Delete `./db/custom.db` to reset database completely

---

## 📞 Still Have Questions?

Check these files for detailed info:
- **Architecture & Technical Details**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Comprehensive Test Scenarios**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Complete Implementation**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## ✅ Verification Checklist

After completing the 8 steps above, verify:

- [ ] Admin account created (email contains "admin")
- [ ] Group created with visible invite code
- [ ] Member account created (email doesn't contain "admin")
- [ ] Member joined group via invite code
- [ ] Contribution recorded by admin
- [ ] Payout executed by admin
- [ ] Member sees both CONTRIBUTION and PAYOUT in dashboard
- [ ] Group switching works (join another group, switch between them)
- [ ] Stats show correct totals

**If all checks pass, the application is working correctly!** 🎉
