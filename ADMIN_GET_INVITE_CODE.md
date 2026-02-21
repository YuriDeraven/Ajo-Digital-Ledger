# Admin Invite Code Flow - Step by Step

## The Complete Admin Journey to Get the Invite Code

```
┌─────────────────────────────────────────────────────────────────┐
│                  ADMIN INVITE CODE GENERATION                   │
└─────────────────────────────────────────────────────────────────┘

STEP 1: Admin Signs Up
════════════════════════════════════════════════════════════════════

1. Go to: http://localhost:3000
   
2. You see the login page:
   ┌──────────────────────────────────────┐
   │     Ajo Digital Ledger               │
   │  [Sign In]  [Sign Up] ← Click this   │
   └──────────────────────────────────────┘

3. Fill in Sign Up form:
   ┌──────────────────────────────────────┐
   │  Email: admin@test.com       ← KEY! │
   │  Name:  Admin User                   │
   │  [Sign Up Button]                    │
   └──────────────────────────────────────┘
   
   ⚠️  Email MUST contain "admin" to be detected as ADMIN!

4. Click "Sign Up"
   ↓
   Backend creates user with role=ADMIN
   ↓
   Automatically redirects to: /admin


STEP 2: Admin Dashboard Loads
════════════════════════════════════════════════════════════════════

You land on the admin dashboard (/admin):

   ┌────────────────────────────────────────────────┐
   │  Admin Dashboard                               │
   │  Welcome, Admin User          [+ Create Group] │
   ├────────────────────────────────────────────────┤
   │  Active Groups: 0    Members: 0    Trans: 0    │
   ├────────────────────────────────────────────────┤
   │  Your Groups                                   │
   │  ┌──────────────────────────────────────────┐ │
   │  │ No groups yet. Create one to get started!│ │
   │  └──────────────────────────────────────────┘ │
   └────────────────────────────────────────────────┘


STEP 3: Create a Group
════════════════════════════════════════════════════════════════════

1. Click the "[+ Create Group]" button
   ↓
   A dialog/modal appears:
   
   ┌──────────────────────────────────────┐
   │  Create New Savings Group            │
   ├──────────────────────────────────────┤
   │  Group Name:  _______________        │
   │  Description: _______________        │
   │                                      │
   │         [Create Button]              │
   └──────────────────────────────────────┘

2. Fill in the form:
   
   ┌──────────────────────────────────────┐
   │  Group Name: Office Savings  ← Type  │
   │  Description: Weekly savings ← Opt   │
   │                                      │
   │         [Create Button]              │
   └──────────────────────────────────────┘

3. Click "Create"
   ↓
   Backend:
   ├─ Creates SavingsGroup record
   ├─ Generates 6-letter invite code
   ├─ Adds you as ADMIN member
   └─ Returns to admin page


STEP 4: SEE THE INVITE CODE! ✨
════════════════════════════════════════════════════════════════════

The group now appears in your dashboard table:

   ┌─────────────────────────────────────────────────────────┐
   │  Your Groups                                            │
   ├──────────────┬─────────┬──────┬──────────┬────────────┤
   │ Group Name   │ Members │Trans │  Code    │  Actions   │
   ├──────────────┼─────────┼──────┼──────────┼────────────┤
   │ Office Sav.  │    1    │  0   │ ABC123   │ [Manage]   │
   │              │         │      │ ← THIS!  │            │
   └──────────────┴─────────┴──────┴──────────┴────────────┘

   🎯 THIS IS THE INVITE CODE MEMBERS WILL USE!
   
   Copy it: ABC123


STEP 5: (Optional) View Group Details
════════════════════════════════════════════════════════════════════

Click "Manage" to see more details:

   ┌─────────────────────────────────────┐
   │  Office Savings Group               │
   │  Invite Code: ABC123                │
   ├─────────────────────────────────────┤
   │  Members (1)                        │
   │  ├─ Admin User (ADMIN)              │
   │  └─ (waiting for members...)        │
   ├─────────────────────────────────────┤
   │  Transactions (0)                   │
   │  (no transactions yet)              │
   └─────────────────────────────────────┘


WHAT THE ADMIN HAS NOW
════════════════════════════════════════════════════════════════════

✅ Created a group: "Office Savings"
✅ Got an invite code: ABC123
✅ Can share code with members
✅ Can see who joins
✅ Can view group transactions


HOW MEMBERS USE THIS CODE
════════════════════════════════════════════════════════════════════

1. Member signs up (without "admin" in email)
2. Redirects to /join-group page
3. Clicks "+ Join Group"
4. Enters code: ABC123
5. Clicks "Join"
6. → Member is now part of "Office Savings" group!


VISUAL TIMELINE
════════════════════════════════════════════════════════════════════

Time:  Action                           Page
────────────────────────────────────────────────
T0:    Go to site                       /
T1:    Sign up as admin@test.com        /
T2:    Click Sign Up                    /
T3:    Redirected automatically         /admin
T4:    See dashboard (empty)            /admin
T5:    Click "+ Create Group"           /admin (dialog opens)
T6:    Fill in group name               /admin (modal)
T7:    Click "Create"                   /admin (modal)
T8:    ✅ GROUP CREATED!                /admin
T9:    ✅ INVITE CODE SHOWN!            /admin (in table)
T10:   Can view more details            /admin/groups/[id]


KEY POINTS FOR ADMIN INVITE CODE
════════════════════════════════════════════════════════════════════

✅ Sign up with "admin" in email
✅ Automatic redirect to /admin dashboard
✅ Click "+ Create Group"
✅ Enter group name
✅ Click "Create"
✅ See group in table
✅ Find "Code" column
✅ Copy the code (e.g., ABC123)
✅ Share with members
✅ Done! ✨

The code is:
- Unique per group
- 6 characters
- Random letters/numbers
- Case-sensitive when members use it
- Display in admin dashboard
- Can be copied and shared
- Members use it to join


QUICK EXAMPLE
════════════════════════════════════════════════════════════════════

Admin Email:      admin@example.com
Sign Up:          ✅ Creates ADMIN role user
Redirect:         ✅ Goes to /admin
Create Group:     ✅ "Community Savings"
Auto-Generated:   ✅ Code = XYZ789
Share Code:       ✅ Send "XYZ789" to members
Member Join:      ✅ Member enters XYZ789
Result:           ✅ Group has 2 people now!


WHAT IF SOMETHING GOES WRONG?
════════════════════════════════════════════════════════════════════

❌ Not redirecting to /admin?
   → Refresh page
   → Check email contains "admin"
   → Try different email

❌ Can't see invite code?
   → Refresh page
   → Make sure group was created
   → Check if you're on /admin page
   → Check table has a "Code" column

❌ Code looks wrong?
   → It's randomly generated, that's normal!
   → Examples: ABC123, XYZ789, DEF456
   → They're all valid, don't worry

❌ Group not appearing?
   → Refresh page
   → Check console for errors (F12)
   → Try creating again


COMPLETE FLOW VISUALIZATION
════════════════════════════════════════════════════════════════════

               ADMIN FLOW
                  |
        ┌─────────┴──────────┐
        |                    |
    Sign Up              Create Group
    (admin@             (Office Savings)
     test.com)               |
        |                    |
        └────→ Redirect  ────→ Get Code
               to /admin      ABC123
                              |
                              v
                        Display in Table
                          /admin page
                              |
                              v
                        ADMIN COPIES CODE
                        SHARES WITH MEMBERS

               MEMBER USES CODE
                  |
        ┌─────────┴──────────┐
        |                    |
    Sign Up              Enter Code
    (user@               (ABC123)
     test.com)               |
        |                    |
        └────→ Redirect  ────→ Join Group
               to /           |
              join-group      v
                        SUCCESS!
                        Redirects to
                        /dashboard
                        (can see group now)


You now have the complete picture of how to get the invite code! 🎉
