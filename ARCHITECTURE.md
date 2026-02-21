# Architecture & Implementation Details

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                     │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                       │
│  - /                    (Login/Signup)                       │
│  - /admin               (Admin Dashboard)                    │
│  - /admin/groups/[id]   (Group Management)                   │
│  - /dashboard           (Member Dashboard)                   │
│  - /join-group          (Invite Code Entry)                  │
├─────────────────────────────────────────────────────────────┤
│  API Routes:                                                 │
│  - /api/admin/groups/*  (Admin Group Management)            │
│  - /api/member/*        (Member Functions)                   │
│  - /api/groups/[id]/*   (Group Data Access)                 │
│  - /api/auth/[...]      (NextAuth.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Authentication: NextAuth.js (Credentials Provider)         │
│  - Session Strategy: JWT                                     │
│  - Role Assignment: On User Creation                         │
│  - Role Detection: Email contains "admin"                    │
├─────────────────────────────────────────────────────────────┤
│  Database: Prisma ORM + SQLite                              │
│  - Schema: User, SavingsGroup, GroupMember, Transaction     │
│  - File Location: ./db/custom.db                            │
├─────────────────────────────────────────────────────────────┤
│  UI Components: Shadcn/ui + Tailwind CSS                    │
│  - Button, Card, Dialog, Input, Table, Tabs                │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy & Access Control

### User Roles
```
ADMIN Role:
  - Login email contains "admin" (e.g., admin@test.com)
  - Can create groups
  - Can see only own groups (filtered by createdBy)
  - Can add/remove members
  - Can record contributions and payouts
  - Can execute group payouts
  - CANNOT see member dashboards

MEMBER Role:
  - Login email does not contain "admin"
  - Can view only groups they've joined
  - Can view only transactions for their joined groups
  - Can join multiple groups via invite codes
  - Can switch between groups
  - CANNOT access admin area
```

### Data Isolation
```
1. Admin's Groups:
   SELECT * FROM SavingsGroup WHERE createdBy = :adminId
   
2. Member's Groups:
   SELECT * FROM SavingsGroup 
   WHERE id IN (
     SELECT groupId FROM GroupMember WHERE userId = :memberId
   )
   
3. Member's Transactions (for a specific group):
   SELECT * FROM Transaction 
   WHERE groupId = :groupId 
   AND groupId IN (
     SELECT groupId FROM GroupMember WHERE userId = :memberId
   )
```

## Authentication Flow

### New User Signup
```
1. User fills signup form (name, email, password)
2. POST /api/auth/callback/credentials
3. Check if user exists:
   - YES: Verify password
   - NO: Create new user with role assignment
4. Role Assignment Logic:
   if (email.toLowerCase().includes("admin")) {
     role = "ADMIN"
   } else {
     role = "MEMBER"
   }
5. Generate JWT token with role included
6. Set session cookie
```

### Session Callback (Every Request)
```
jwt(token) {
  if (user) {
    token.role = user.role
  }
  return token
}

session(session, token) {
  session.user.role = token.role
  return session
}
```

## Invite Code System

### Code Generation
```
// In POST /api/admin/groups
function generateInviteCode() {
  return Math.random()
    .toString(36)          // "0.abc123xyz..."
    .substring(2, 8)       // "abc123"
    .toUpperCase()         // "ABC123"
}
// Result: 6-character alphanumeric code
```

### Code Validation
```
// In POST /api/member/join-group
1. Receive inviteCode from client
2. Convert to uppercase: inviteCode.toUpperCase()
3. Query: SELECT * FROM SavingsGroup WHERE inviteCode = :code
4. If found:
   - Check if user already member: findUnique(userId, groupId)
   - If not: Create GroupMember entry
5. Return success/error
```

### Key Features
- ✅ Unique per group (not per member)
- ✅ Reusable by multiple members
- ✅ 6-character, uppercase, alphanumeric
- ✅ Case-insensitive input (normalized to uppercase)
- ✅ Permanent (never changes)

## Transaction Flow

### Recording a Contribution
```
Admin Flow:
1. Click "Record Payment" on member in group
2. Enter amount (e.g., 50)
3. POST /api/admin/groups/[groupId]/transactions
   {
     userId: memberId,
     amount: 50,
     type: "CONTRIBUTION",
     description: "[auto-generated]"
   }
4. Transaction created in database
5. Member sees CONTRIBUTION in dashboard transactions table
```

### Executing a Payout
```
Admin Flow:
1. Click "Run Payout" button
2. POST /api/admin/groups/[groupId]/payout
3. Backend:
   a. Get all members in group
   b. Sum all CONTRIBUTION transactions: totalPool
   c. Calculate: payoutPerMember = totalPool / memberCount
   d. Create PAYOUT transaction for each member:
      {
        userId: memberId,
        amount: payoutPerMember,
        type: "PAYOUT",
        description: "Payout from [Group Name]"
      }
   e. Return success with calculations
4. All members see PAYOUT in their transactions
5. Member dashboard shows:
   - Total Contributed: sum of CONTRIBUTION amounts
   - Total Received: sum of PAYOUT amounts
```

## Group Membership Management

### Adding Member by Email (Admin)
```
Flow:
1. Admin clicks "Add Member" in group management
2. Enter email: member@test.com
3. POST /api/admin/groups/[groupId]/members
   { email: "member@test.com" }
4. Backend:
   a. Find or create User with email
   b. If user doesn't exist:
      - role = "MEMBER" (default)
      - Create user record
   c. Create GroupMember entry
   d. Return success
5. Member appears in group's members table
```

### Joining via Invite Code (Member Self-Service)
```
Flow:
1. Member navigates to /join-group
2. Clicks "Enter Invite Code"
3. Types invite code in dialog
4. POST /api/member/join-group
   { inviteCode: "ABC123" }
5. Backend validates and creates membership
6. Member redirected to /dashboard
7. Group appears in "Your Groups"
```

### Unique Membership Constraint
```
// Prisma Schema
model GroupMember {
  @@unique([userId, groupId])
}

// Prevents:
- Same member joining same group twice
- Duplicate entries in database
- Returns 400 error: "You're already a member"
```

## Frontend Routing

### Login Flow
```
1. User not authenticated
   → Redirected to / (login page)
   
2. User clicks "Sign In" or "Sign Up"
   → Submits credentials to /api/auth/callback/credentials
   → Session created
   
3. Authenticated user visits /
   → useEffect checks session.user.role
   → If ADMIN: redirect to /admin
   → If MEMBER: redirect to /join-group
```

### Admin Flow
```
/admin
├── Shows all groups (POST /api/admin/groups)
├── "Create Group" button
└── /admin/groups/[groupId]
    ├── Members list
    ├── Transactions list
    ├── "Add Member" dialog
    ├── "Record Payment" dialog
    └── "Run Payout" button
```

### Member Flow
```
/join-group
├── "Enter Invite Code" dialog
└── Successful join → redirect to /dashboard

/dashboard
├── Your Groups section
│  ├── Click group to select
│  └── "Join Another Group" button with dialog
├── Group Details (if group selected)
│  ├── Stats: Contributed, Received, Members
│  └── Transactions table
└── If no groups: "Not part of any groups yet"
```

## API Authorization Pattern

### All protected endpoints follow this pattern:
```typescript
export async function GET/POST(
  request: NextRequest,
  { params }: { params: Promise<{ ...ids }> }
) {
  // 1. Get session
  const session = await getServerSession(authOptions)
  
  // 2. Check authentication
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // 3. Check role (if needed)
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  
  // 4. Check ownership/membership (if needed)
  const resource = await db.resource.findUnique(...)
  if (resource.createdBy !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  
  // 5. Process request
  // ...
}
```

## Error Handling

### HTTP Status Codes Used
- `200`: Success (GET, successful POST)
- `201`: Resource created (POST)
- `400`: Bad request (validation error, already member)
- `401`: Unauthorized (no session)
- `403`: Forbidden (wrong role)
- `404`: Not found (invalid invite code, group not owned by admin)
- `500`: Server error (database error)

### Client-Side Error Handling
```typescript
const res = await fetch(endpoint)

if (res.ok) {
  const data = await res.json()
  // Success: show toast, update state
} else {
  const error = await res.json()
  // Error: show error message from error.error
}
```

## Performance Considerations

### Database Queries
1. **Group Listing**: Uses `_count` to avoid separate queries
   ```prisma
   include: { _count: { select: { members, transactions } } }
   ```

2. **Transaction Grouping**: Uses `groupBy` for efficient aggregation
   ```prisma
   db.transaction.groupBy({
     by: ["userId"],
     _sum: { amount: true }
   })
   ```

3. **Member Verification**: Single unique constraint query
   ```prisma
   findUnique({
     where: { userId_groupId: { userId, groupId } }
   })
   ```

### Frontend Optimizations
1. **Conditional Rendering**: Groups only render if selected
2. **Lazy Loading**: Transactions fetched only when group selected
3. **User Experience**: "Join Another Group" prevents re-joins

## Testing Strategy

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive test scenarios.

Key test cases:
- Admin creates group → Member joins via code → Views transactions
- Multiple members in group → Payout calculation verified
- Member joins multiple groups → Correct data isolation
- Invalid invite code → Error message shown
- Duplicate join attempt → "Already member" error

## Future Enhancements

1. **Invite Link**: Generate shareable links instead of just codes
2. **Role-Based Permissions**: Some members as "Treasurer"
3. **Spending Tracking**: Track individual purchases
4. **Notifications**: Email/SMS for payouts and invites
5. **Analytics**: Charts for contribution trends
6. **Export**: CSV/PDF transaction reports
7. **Multiple Currency**: Support different currencies per group
8. **Mobile App**: React Native version
