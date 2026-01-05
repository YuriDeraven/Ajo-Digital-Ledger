import { db } from '@/lib/db'

async function createTestData() {
  try {
    console.log('Creating test data...')
    
    // Create test user
    const user = await db.user.upsert({
      where: { email: 'demo@ajo.com' },
      update: {},
      create: {
        email: 'demo@ajo.com',
        name: 'Demo User'
      }
    })
    console.log('Test user:', user)
    
    // Create test group
    const group = await db.savingsGroup.create({
      data: {
        name: 'Demo Savings Group',
        description: 'A demo group for testing',
        inviteCode: 'DEMO123',
        createdBy: user.id,
        members: {
          create: {
            userId: user.id,
            role: "ADMIN"
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            transactions: true
          }
        }
      }
    })
    console.log('Test group:', group)
    
    // Create test transaction
    const transaction = await db.transaction.create({
      data: {
        groupId: group.id,
        userId: user.id,
        amount: 100.00,
        type: 'CONTRIBUTION',
        description: 'Initial contribution'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
    console.log('Test transaction:', transaction)
    
    console.log('Test data created successfully!')
    console.log('You can now login with: demo@ajo.com')
    
  } catch (error) {
    console.error('Error creating test data:', error)
  }
}

createTestData()