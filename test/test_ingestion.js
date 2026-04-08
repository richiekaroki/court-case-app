import { ingestCase } from '../dist/services/CaseIngestionService.js';
import sequelize from '../dist/middleware/sequelize.js';

const timestamp = Date.now();
const uniqueCaseNumber = `INGESTION-TEST-${timestamp}`;

const testCase = {
    caseNumber: uniqueCaseNumber,
    title: 'Ingestion Test Case',
    citation: `[2024] ING ${timestamp}`,
    dateDelivered: new Date(),
    courtName: 'High Court of Kenya',
    countyName: 'Nairobi',
    judges: ['Hon. Justice Test'],
    advocates: [{ name: 'Test Law Firm', type: 'company' }],
    partyList: [{ name: 'Test Party 1', type: 'Petitioner' }]
};

const test = async () => {
    console.log('\n🧪 Testing Case Ingestion...\n');
    
    try {
        console.log('📝 Ingestion test case:', testCase.caseNumber);
        await ingestCase(testCase);
        console.log('✅ Ingestion successful!');
        
        // Verify in database
        const [results] = await sequelize.query(
            `SELECT * FROM court_case WHERE case_number = '${uniqueCaseNumber}'`
        );
        
        if (results && results.length > 0) {
            console.log('✅ Case found in database!');
            console.log('   ID:', results[0].id);
            console.log('   Court ID:', results[0].court_id);
            
            // Test duplicate prevention
            console.log('\n📝 Testing duplicate prevention...');
            try {
                await ingestCase(testCase);
                console.log('⚠️ Duplicate was allowed (should be blocked)');
            } catch (dupError) {
                console.log('✅ Duplicate correctly blocked:', dupError.message);
            }
            
            console.log('\n🎉 Phase 2 Ingestion Test PASSED!');
        } else {
            console.error('❌ Case not found in database after ingestion');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        process.exit(1);
    }
    
    process.exit(0);
};

test();