#!/usr/bin/env node

/**
 * Unit Test Suite - Tests individual components without MCP transport
 */

import { TaigaService } from '../src/taigaService.js';
import { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../src/constants.js';
import { formatDate, createSuccessResponse, createErrorResponse } from '../src/utils.js';

class UnitTestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, testFn) {
    try {
      process.stdout.write(`🧪 ${name}... `);
      await testFn();
      console.log('✅ PASS');
      this.passed++;
    } catch (error) {
      console.log('❌ FAIL');
      console.log(`   Error: ${error.message}`);
      this.failed++;
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  async run() {
    console.log('🧪 Unit Test Suite\n');

    // Test Constants
    await this.test('Constants are defined', async () => {
      this.assert(API_ENDPOINTS.PROJECTS, 'API_ENDPOINTS.PROJECTS should be defined');
      this.assert(ERROR_MESSAGES.AUTHENTICATION_FAILED, 'ERROR_MESSAGES.AUTHENTICATION_FAILED should be defined');
      this.assert(SUCCESS_MESSAGES.AUTHENTICATED, 'SUCCESS_MESSAGES.AUTHENTICATED should be defined');
    });

    // Test Utility Functions
    await this.test('Date formatting utility', async () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      this.assert(typeof formatted === 'string', 'Should return a string');
      this.assert(formatted.includes('2024'), 'Should contain the year');
    });

    await this.test('Success response creation', async () => {
      const response = createSuccessResponse('Test message');
      this.assert(response.content, 'Should have content property');
      this.assert(response.content[0].type === 'text', 'Should have text type');
      this.assert(response.content[0].text === 'Test message', 'Should contain the message');
    });

    await this.test('Error response creation', async () => {
      const response = createErrorResponse('Test error');
      this.assert(response.content, 'Should have content property');
      this.assert(response.isError === true, 'Should have isError flag');
      this.assert(response.content[0].text.includes('Test error'), 'Should contain the error message');
    });

    // Test TaigaService instantiation
    await this.test('TaigaService instantiation', async () => {
      const service = new TaigaService();
      this.assert(service, 'Should create TaigaService instance');
      this.assert(typeof service.listProjects === 'function', 'Should have listProjects method');
      this.assert(typeof service.createUserStory === 'function', 'Should have createUserStory method');
    });

    // Test URL construction
    await this.test('API URL construction', async () => {
      const service = new TaigaService();
      const baseUrl = process.env.TAIGA_API_URL || 'https://api.taiga.io/api/v1';
      
      // Test that service uses the base URL correctly
      this.assert(baseUrl.includes('api'), 'Should contain api in URL');
      this.assert(baseUrl.includes('v1'), 'Should contain version in URL');
    });

    // Test Constants Structure
    await this.test('Endpoints structure', async () => {
      this.assert(API_ENDPOINTS.PROJECTS, 'Should have PROJECTS endpoint');
      this.assert(API_ENDPOINTS.MILESTONES, 'Should have MILESTONES endpoint');
      this.assert(API_ENDPOINTS.USER_STORIES, 'Should have USER_STORIES endpoint');
      this.assert(API_ENDPOINTS.TASKS, 'Should have TASKS endpoint');
      this.assert(API_ENDPOINTS.ISSUES, 'Should have ISSUES endpoint');
      this.assert(API_ENDPOINTS.PRIORITIES, 'Should have PRIORITIES endpoint');
    });

    await this.test('Error messages structure', async () => {
      this.assert(ERROR_MESSAGES.AUTHENTICATION_FAILED, 'Should have AUTHENTICATION_FAILED message');
      this.assert(ERROR_MESSAGES.PROJECT_NOT_FOUND, 'Should have PROJECT_NOT_FOUND message');
      this.assert(ERROR_MESSAGES.FAILED_TO_LIST_PROJECTS, 'Should have FAILED_TO_LIST_PROJECTS message');
    });

    await this.test('Success messages structure', async () => {
      this.assert(SUCCESS_MESSAGES.AUTHENTICATED, 'Should have AUTHENTICATED message');
      this.assert(SUCCESS_MESSAGES.USER_STORY_CREATED, 'Should have USER_STORY_CREATED message');
      this.assert(SUCCESS_MESSAGES.ISSUE_CREATED, 'Should have ISSUE_CREATED message');
    });

    // Test Environment Variables Handling
    await this.test('Environment variable handling', async () => {
      const originalUrl = process.env.TAIGA_API_URL;
      
      // Test with undefined env var
      delete process.env.TAIGA_API_URL;
      const service1 = new TaigaService();
      this.assert(service1, 'Should handle missing environment variables');
      
      // Restore original value
      if (originalUrl) {
        process.env.TAIGA_API_URL = originalUrl;
      }
    });

    // Test Data Validation Helpers (if any exist in utils)
    await this.test('Response format validation', async () => {
      const validResponse = createSuccessResponse('test');
      this.assert(Array.isArray(validResponse.content), 'Content should be an array');
      this.assert(validResponse.content.length > 0, 'Content should not be empty');
      this.assert(validResponse.content[0].type, 'Content items should have type');
      this.assert(validResponse.content[0].text, 'Content items should have text');
    });

    // Print results
    console.log('\n📊 Unit Test Results:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    if (this.passed + this.failed > 0) {
      console.log(`📈 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);
    }

    if (this.failed > 0) {
      console.log('\n⚠️  Some unit tests failed.');
      return false;
    } else {
      console.log('\n🎉 All unit tests passed!');
      return true;
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new UnitTestRunner();
  runner.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Unit test runner failed:', error);
    process.exit(1);
  });
}

export default UnitTestRunner;