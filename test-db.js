import { db } from '@/lib/db'

async function testDb() {
  try {
    // Test database connection
    const userCount = await db.user.count()
    console.log('Database connected. User count:', userCount)
    
    // Test creating a user
    const testUser = await db.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    })
    console.log('Created test user:', testUser)
    
    // Test creating a group
    const testGroup = await db.savingsGroup.create({
      data: {
        name: 'Test Group',
        description: 'Test Description',
        inviteCode: 'TEST123',
        createdBy: testUser.id,
        members: {
          create: {
            userId: testUser.id,
            role: "ADMIN"
          }
        }
      }
    })
    console.log('Created test group:', testGroup)
    
  } catch (error) {
    console.error('Database test failed:', error)
  }
}

testDb()