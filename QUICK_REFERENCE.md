# Quick Reference & Troubleshooting

## 🚀 Start the Server

```bash
cd "c:\Users\HomePC\Desktop\In Repo\Ajo-Digital-Ledger"
npm run dev
```

Should see:
```
> next dev
  ▲ Next.js 15.3.5

  ✓ Ready in 5.4s
```

Then open: **http://localhost:3000**

---

## 🎯 Quick Test Checklists

### **Admin Test (3 minutes)**
- [ ] Sign up with `admin@test.com`
- [ ] Redirects to `/admin`
- [ ] Click "+ Create Group"
- [ ] Enter group name "Test"
- [ ] Click "Create"
- [ ] Group appears in table
- [ ] Invite code visible in table (e.g., "ABC123")
- [ ] Click "Manage" to see group details

### **Member Test (3 minutes)**
- [ ] Sign up with `user@test.com`
- [ ] Redirects to `/join-group`
- [ ] Click "+ Join Group"
- [ ] Enter invite code from admin
- [ ] Click "Join"
- [ ] Redirects to `/dashboard`
- [ ] Group appears in "My Groups"
- [ ] Can click group to see details

### **Transaction Test (3 minutes)**
- [ ] In `/dashboard`, select a group
- [ ] Click "+ Add Transaction"
- [ ] Enter amount: 50
- [ ] Type: CONTRIBUTION
- [ ] Click "Add"
- [ ] Transaction appears in list
- [ ] Balance shows: $50
- [ ] Repeat with PAYOUT type
- [ ] Balance updates correctly

---

## ❌ Troubleshooting

### **"The site can't be reached"**
```
Problem: Server not running
Solution:
1. Open terminal in project folder
2. Run: npm run dev
3. Wait for "Ready in X.Xs"
4. Refresh browser
```

### **"Stuck on login page after signing in"**
```
Problem: Not redirecting after login
Solution:
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R on Windows)
3. Try different email
4. Check browser console for errors (F12)
```

### **"Can't join group - invalid code"**
```
Problem: Wrong or expired code
Solution:
1. Go back to admin page
2. Check the invite code in the table
3. Copy it exactly (case-sensitive)
4. Try again
```

### **"Group not appearing in my groups"**
```
Problem: Join didn't work
Solution:
1. Check you're logged in as MEMBER (not ADMIN)
2. Try different invite code
3. Refresh page
4. Check browser console for error message
```

### **"Can't create group on admin page"**
```
Problem: Admin page not loading or broken
Solution:
1. Make sure you signed up with "admin" in email
2. Refresh the page
3. Check console for errors
4. Try logging out and back in
```

### **"Page shows loading forever"**
```
Problem: Slow or stuck loading
Solution:
1. Check browser console (F12) for errors
2. Refresh the page
3. Open developer tools network tab
4. See if API calls are stuck
5. Restart server if needed
```

### **"Database error" messages**
```
Problem: Database connection issue
Solution:
1. Stop the server (Ctrl+C)
2. Run: npx prisma generate
3. Run: npm run dev
4. Try again

If still broken:
1. Delete .next folder: rm -r .next
2. Run: npm run build
3. Run: npm run dev
```

---

## 🔍 Testing with Different Emails

### **Admin Emails (use ANY of these)**
```
admin@test.com
admin@example.com
administrator@app.com
my-admin@service.com
```

### **Member Emails (use ANY non-admin emails)**
```
user@test.com
john@example.com
member@app.com
sarah.smith@service.com
someone@gmail.com
```

---

## 💻 Browser Console Tips

### **Check for Errors**
1. Press `F12` to open Developer Tools
2. Click "Console" tab
3. Look for red error messages
4. Report the exact error

### **Check Network Requests**
1. Press `F12`
2. Click "Network" tab
3. Try an action
4. See if API calls succeed (green 200 status)
5. Click on request to see details

### **Check Session Data**
1. Press `F12`
2. Click "Application" or "Storage" tab
3. Look for "Cookies" section
4. Should see auth-related cookies
5. Session should contain user ID and role

---

## 📊 Database Check

### **Verify Database Exists**
```bash
# Check if database file exists
Test-Path "c:\Users\HomePC\Desktop\In Repo\Ajo-Digital-Ledger\db\custom.db"
# Should return: True
```

### **View Database Contents** (if Prisma Studio available)
```bash
# Start Prisma Studio (visual database viewer)
npx prisma studio
# Opens browser interface to see all data
```

### **Check Database Schema**
```bash
# View all migrations
npx prisma migrate status
# Should show "Database is in sync"
```

---

## 🔧 Useful Commands

### **Restart Everything**
```bash
# Stop server (Ctrl+C in terminal)

# Clear cache
rm -r .next -Force
rm -r node_modules -Force

# Reinstall
npm install

# Restart
npm run dev
```

### **Force Database Reset** (⚠️ Deletes all data)
```bash
# Only do this if database is corrupted
npx prisma migrate reset --force
# Answer "y" to confirm
# Recreates empty database with schema
```

### **Generate Prisma Client**
```bash
npx prisma generate
```

### **Build for Production**
```bash
npm run build
npm start  # Runs production build
```

---

## 📋 Email Patterns

### **Why Email Determines Role?**
- If email contains "admin" (case-insensitive) → ADMIN
- Otherwise → MEMBER

### **Examples**
```
✅ ADMIN:
- admin@test.com
- ADMIN@example.com (uppercase ok)
- my-admin-account@app.com
- administrator@site.com

❌ MEMBER (NOT ADMIN):
- user@test.com
- john@example.com
- admin.user@site.com ❌ (but has "admin", so actually ADMIN!)
```

---

## 🎮 Test Scenarios

### **Scenario 1: Single Admin**
```
1. Admin creates group "Savings"
2. Invite code: ABC123
3. Done - test complete
```

### **Scenario 2: Admin + 1 Member**
```
1. Admin creates group
2. Member joins with code
3. Member adds transaction
4. Both see the transaction
```

### **Scenario 3: Admin + 2 Members**
```
1. Admin creates group
2. Member 1 joins
3. Member 2 joins
4. Member 1: Contribute $50
5. Member 2: Contribute $30
6. Member 1: Payout $40
7. Final balance: $40
8. Both members see all transactions
```

### **Scenario 4: Multiple Groups**
```
1. Admin creates "Group A"
2. Admin creates "Group B"
3. Member joins Group A
4. Different member joins Group B
5. Each sees only their groups
6. Transactions don't mix
```

---

## 📞 When Something Goes Wrong

### **Gather This Information**
1. What were you trying to do?
2. What happened instead?
3. What error message appeared?
4. What's the URL showing in browser?
5. What's shown in terminal running `npm run dev`?
6. What's shown in browser console (F12)?

### **Try These Steps**
1. Refresh the page (F5)
2. Hard refresh (Ctrl+Shift+R)
3. Clear browser cache
4. Restart the dev server
5. Try a different browser
6. Try a different email address

---

## 📂 Important Files

If you need to edit something:

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Login/signup page |
| `src/app/admin/page.tsx` | Admin dashboard |
| `src/app/admin/groups/[groupId]/page.tsx` | Admin group details |
| `src/app/join-group/page.tsx` | Member join page |
| `src/app/dashboard/page.tsx` | Member dashboard |
| `src/lib/auth.ts` | Authentication config |
| `prisma/schema.prisma` | Database schema |
| `.env.local` | Environment variables |

---

## 🎯 Success Indicators

### **Server Running Successfully**
✅ Terminal shows "Ready in X.Xs"
✅ No red error messages in terminal
✅ http://localhost:3000 loads

### **Login Working**
✅ Can sign up with email
✅ No error messages
✅ Redirects to correct page

### **Admin Working**
✅ Lands on `/admin`
✅ Can create group
✅ Invite code appears
✅ Can click "Manage"

### **Member Working**
✅ Lands on `/join-group`
✅ Can join with code
✅ Redirects to `/dashboard`
✅ Can see joined group

### **Transactions Working**
✅ Can add contribution
✅ Can add payout
✅ Balance updates
✅ Transactions appear in list

---

## ⏱️ Expected Loading Times

| Action | Time |
|--------|------|
| Server startup | 5-8 seconds |
| Page load | 1-2 seconds |
| Sign in | 1-2 seconds |
| Create group | 1 second |
| Join group | 1 second |
| Add transaction | 1 second |

If taking much longer, something is wrong.

---

## 🆘 If All Else Fails

1. **Close everything** and restart
2. **Delete** `.next` folder and `db/custom.db`
3. **Reinstall** everything:
   ```bash
   rm -r node_modules
   npm install
   npm run build
   npm run dev
   ```
4. **Try again** with fresh start

This usually fixes most issues!

---

## 📚 Learn More

Check these files for detailed information:
- `APPLICATION_SUMMARY.md` - Full app overview
- `ADMIN_FLOW_TESTING.md` - Admin testing guide
- `COMPLETE_USER_FLOW.md` - Visual flows and scenarios
- `README.md` - Project information
