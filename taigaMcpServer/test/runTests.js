#!/usr/bin/env node

/**
 * Test Runner - Runs all test suites
 */

import TestRunner from './mcpTest.js';
import IntegrationTestRunner from './integration.js';

async function runAllTests() {
  console.log('🧪 Taiga MCP Server Test Suite');
  console.log('==============================\n');

  let totalPassed = 0;
  let totalFailed = 0;

  try {
    // Run basic MCP tests
    console.log('📋 Running Basic MCP Tests...');
    const basicRunner = new TestRunner();
    
    // Override the exit calls to continue with integration tests
    const originalExit = process.exit;
    process.exit = () => {}; // Temporarily disable exit
    
    await basicRunner.run();
    totalPassed += basicRunner.passed;
    totalFailed += basicRunner.failed;

    console.log('\n' + '='.repeat(50) + '\n');

    // Run integration tests
    console.log('🔗 Running Integration Tests...');
    const integrationRunner = new IntegrationTestRunner();
    await integrationRunner.run();
    totalPassed += integrationRunner.passed;
    totalFailed += integrationRunner.failed;

    // Restore original exit function
    process.exit = originalExit;

    // Final results
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Final Test Results:');
    console.log('='.repeat(50));
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    
    if (totalPassed + totalFailed > 0) {
      const successRate = Math.round((totalPassed / (totalPassed + totalFailed)) * 100);
      console.log(`📈 Overall Success Rate: ${successRate}%`);
    }

    if (totalFailed > 0) {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests completed successfully!');
      console.log('🚀 Taiga MCP Server is ready for use!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception in test runner:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 Unhandled rejection in test runner:', reason);
  process.exit(1);
});

// Run tests
runAllTests();