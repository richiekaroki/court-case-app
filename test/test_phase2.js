import { getScraperState } from '../dist/utils/system/initial_run_checker.js';

const test = async () => {
    console.log('\n🧪 Testing Scraper State...\n');
    
    try {
        const state = await getScraperState();
        console.log('✅ Scraper State retrieved successfully!');
        console.log('📊 State:', JSON.stringify(state, null, 2));
        
        // Verify expected properties
        if (state.isFirstRun !== undefined) {
            console.log('✅ isFirstRun:', state.isFirstRun);
        }
        if (state.lastPage !== undefined) {
            console.log('✅ lastPage:', state.lastPage);
        }
        if (state.totalCasesScraped !== undefined) {
            console.log('✅ totalCasesScraped:', state.totalCasesScraped);
        }
        
        console.log('\n🎉 Phase 2 Scraper State Test PASSED!');
    } catch (error) {
        console.error('❌ Test FAILED:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
    
    process.exit(0);
};

test();