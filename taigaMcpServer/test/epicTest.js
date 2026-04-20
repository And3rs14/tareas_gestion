#!/usr/bin/env node

/**
 * Epic Management System Test Suite
 * Tests for Epic creation, management, and User Story linking functionality
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Test Results Tracker
 */
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Simple test assertion function
 */
function assert(condition, message) {
  results.total++;
  if (condition) {
    results.passed++;
    console.log(`✅ ${message}`);
  } else {
    results.failed++;
    results.errors.push(message);
    console.log(`❌ ${message}`);
  }
}

/**
 * Async test wrapper
 */
async function test(name, fn) {
  console.log(`\n🧪 Test: ${name}`);
  try {
    await fn();
  } catch (error) {
    results.total++;
    results.failed++;
    results.errors.push(`${name}: ${error.message}`);
    console.log(`❌ ${name}: ${error.message}`);
  }
}

/**
 * Main test execution
 */
async function runEpicTests() {
  console.log('🚀 Starting Epic Management System Tests...\n');

  // Test 1: Import Epic tools
  await test('Import Epic tools', async () => {
    const { createEpicTool, listEpicsTool, getEpicTool, updateEpicTool, linkStoryToEpicTool, unlinkStoryFromEpicTool } = 
      await import('../src/tools/epicTools.js');
    
    assert(createEpicTool, 'createEpicTool imported successfully');
    assert(listEpicsTool, 'listEpicsTool imported successfully');
    assert(getEpicTool, 'getEpicTool imported successfully');
    assert(updateEpicTool, 'updateEpicTool imported successfully');
    assert(linkStoryToEpicTool, 'linkStoryToEpicTool imported successfully');
    assert(unlinkStoryFromEpicTool, 'unlinkStoryFromEpicTool imported successfully');
  });

  // Test 2: Validate Epic tool structure
  await test('Validate Epic tool structure', async () => {
    const { createEpicTool, listEpicsTool, getEpicTool, updateEpicTool, linkStoryToEpicTool, unlinkStoryFromEpicTool } = 
      await import('../src/tools/epicTools.js');
    
    // Check createEpicTool structure
    assert(createEpicTool.name === 'createEpic', 'createEpicTool has correct name');
    assert(typeof createEpicTool.description === 'string', 'createEpicTool has description');
    assert(typeof createEpicTool.inputSchema === 'object', 'createEpicTool has inputSchema');
    assert(typeof createEpicTool.handler === 'function', 'createEpicTool has handler function');
    
    // Check listEpicsTool structure
    assert(listEpicsTool.name === 'listEpics', 'listEpicsTool has correct name');
    assert(typeof listEpicsTool.description === 'string', 'listEpicsTool has description');
    assert(typeof listEpicsTool.inputSchema === 'object', 'listEpicsTool has inputSchema');
    assert(typeof listEpicsTool.handler === 'function', 'listEpicsTool has handler function');
    
    // Check getEpicTool structure
    assert(getEpicTool.name === 'getEpic', 'getEpicTool has correct name');
    assert(typeof getEpicTool.description === 'string', 'getEpicTool has description');
    assert(typeof getEpicTool.inputSchema === 'object', 'getEpicTool has inputSchema');
    assert(typeof getEpicTool.handler === 'function', 'getEpicTool has handler function');
    
    // Check updateEpicTool structure
    assert(updateEpicTool.name === 'updateEpic', 'updateEpicTool has correct name');
    assert(typeof updateEpicTool.description === 'string', 'updateEpicTool has description');
    assert(typeof updateEpicTool.inputSchema === 'object', 'updateEpicTool has inputSchema');
    assert(typeof updateEpicTool.handler === 'function', 'updateEpicTool has handler function');
    
    // Check linkStoryToEpicTool structure
    assert(linkStoryToEpicTool.name === 'linkStoryToEpic', 'linkStoryToEpicTool has correct name');
    assert(typeof linkStoryToEpicTool.description === 'string', 'linkStoryToEpicTool has description');
    assert(typeof linkStoryToEpicTool.inputSchema === 'object', 'linkStoryToEpicTool has inputSchema');
    assert(typeof linkStoryToEpicTool.handler === 'function', 'linkStoryToEpicTool has handler function');
    
    // Check unlinkStoryFromEpicTool structure
    assert(unlinkStoryFromEpicTool.name === 'unlinkStoryFromEpic', 'unlinkStoryFromEpicTool has correct name');
    assert(typeof unlinkStoryFromEpicTool.description === 'string', 'unlinkStoryFromEpicTool has description');
    assert(typeof unlinkStoryFromEpicTool.inputSchema === 'object', 'unlinkStoryFromEpicTool has inputSchema');
    assert(typeof unlinkStoryFromEpicTool.handler === 'function', 'unlinkStoryFromEpicTool has handler function');
  });

  // Test 3: Validate Epic tool schemas
  await test('Validate Epic tool schemas', async () => {
    const { createEpicTool, listEpicsTool, getEpicTool, updateEpicTool, linkStoryToEpicTool, unlinkStoryFromEpicTool } = 
      await import('../src/tools/epicTools.js');
    
    // Test createEpic schema
    try {
      const createResult = createEpicTool.inputSchema.parse({
        project: 123,
        subject: 'Test Epic',
        description: 'Test epic description',
        color: '#FF5733',
        tags: ['backend', 'api']
      });
      assert(createResult.project === 123, 'createEpic schema validates project');
      assert(createResult.subject === 'Test Epic', 'createEpic schema validates subject');
      assert(createResult.description === 'Test epic description', 'createEpic schema validates description');
      assert(createResult.color === '#FF5733', 'createEpic schema validates color');
      assert(Array.isArray(createResult.tags) && createResult.tags.length === 2, 'createEpic schema validates tags');
    } catch (error) {
      assert(false, `createEpic schema validation failed: ${error.message}`);
    }
    
    // Test listEpics schema
    try {
      const listResult = listEpicsTool.inputSchema.parse({
        project: 456
      });
      assert(listResult.project === 456, 'listEpics schema validates project');
    } catch (error) {
      assert(false, `listEpics schema validation failed: ${error.message}`);
    }
    
    // Test getEpic schema
    try {
      const getResult = getEpicTool.inputSchema.parse({
        epicId: 789
      });
      assert(getResult.epicId === 789, 'getEpic schema validates epicId');
    } catch (error) {
      assert(false, `getEpic schema validation failed: ${error.message}`);
    }
    
    // Test updateEpic schema
    try {
      const updateResult = updateEpicTool.inputSchema.parse({
        epicId: 999,
        subject: 'Updated Epic',
        description: 'Updated description',
        color: '#00FF00',
        tags: ['frontend'],
        status: 2
      });
      assert(updateResult.epicId === 999, 'updateEpic schema validates epicId');
      assert(updateResult.subject === 'Updated Epic', 'updateEpic schema validates subject');
      assert(updateResult.status === 2, 'updateEpic schema validates status');
    } catch (error) {
      assert(false, `updateEpic schema validation failed: ${error.message}`);
    }
    
    // Test linkStoryToEpic schema
    try {
      const linkResult = linkStoryToEpicTool.inputSchema.parse({
        userStoryId: 111,
        epicId: 222
      });
      assert(linkResult.userStoryId === 111, 'linkStoryToEpic schema validates userStoryId');
      assert(linkResult.epicId === 222, 'linkStoryToEpic schema validates epicId');
    } catch (error) {
      assert(false, `linkStoryToEpic schema validation failed: ${error.message}`);
    }
    
    // Test unlinkStoryFromEpic schema
    try {
      const unlinkResult = unlinkStoryFromEpicTool.inputSchema.parse({
        userStoryId: 333
      });
      assert(unlinkResult.userStoryId === 333, 'unlinkStoryFromEpic schema validates userStoryId');
    } catch (error) {
      assert(false, `unlinkStoryFromEpic schema validation failed: ${error.message}`);
    }
  });

  // Test 4: Test Epic schema validation errors
  await test('Test Epic schema validation errors', async () => {
    const { createEpicTool, listEpicsTool, getEpicTool, linkStoryToEpicTool } = 
      await import('../src/tools/epicTools.js');
    
    // Test missing required fields for createEpic
    try {
      createEpicTool.inputSchema.parse({
        project: 123
        // missing subject
      });
      assert(false, 'Should reject missing subject');
    } catch (error) {
      assert(true, 'createEpic correctly rejects missing subject');
    }
    
    // Test invalid project type for listEpics
    try {
      listEpicsTool.inputSchema.parse({
        project: 'not_a_number'
      });
      assert(false, 'Should reject invalid project type');
    } catch (error) {
      assert(true, 'listEpics correctly rejects invalid project type');
    }
    
    // Test invalid epicId type for getEpic
    try {
      getEpicTool.inputSchema.parse({
        epicId: 'not_a_number'
      });
      assert(false, 'Should reject non-number epicId');
    } catch (error) {
      assert(true, 'getEpic correctly rejects invalid epicId type');
    }
    
    // Test missing epicId for linkStoryToEpic
    try {
      linkStoryToEpicTool.inputSchema.parse({
        userStoryId: 111
        // missing epicId
      });
      assert(false, 'Should reject missing epicId');
    } catch (error) {
      assert(true, 'linkStoryToEpic correctly rejects missing epicId');
    }
  });

  // Test 5: Check Epic constants
  await test('Check Epic constants', async () => {
    const { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } = await import('../src/constants.js');
    
    // Check API endpoints
    assert(API_ENDPOINTS.EPICS === '/epics', 'EPICS endpoint defined');
    
    // Check error messages
    assert(typeof ERROR_MESSAGES.FAILED_TO_CREATE_EPIC === 'string', 'FAILED_TO_CREATE_EPIC message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_LIST_EPICS === 'string', 'FAILED_TO_LIST_EPICS message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_GET_EPIC === 'string', 'FAILED_TO_GET_EPIC message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_UPDATE_EPIC === 'string', 'FAILED_TO_UPDATE_EPIC message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_LINK_STORY === 'string', 'FAILED_TO_LINK_STORY message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_UNLINK_STORY === 'string', 'FAILED_TO_UNLINK_STORY message defined');
    assert(typeof ERROR_MESSAGES.EPIC_NOT_FOUND === 'string', 'EPIC_NOT_FOUND message defined');
    assert(typeof ERROR_MESSAGES.USER_STORY_NOT_FOUND === 'string', 'USER_STORY_NOT_FOUND message defined');
    
    // Check success messages
    assert(typeof SUCCESS_MESSAGES.EPIC_CREATED === 'string', 'EPIC_CREATED message defined');
    assert(typeof SUCCESS_MESSAGES.EPIC_UPDATED === 'string', 'EPIC_UPDATED message defined');
    assert(typeof SUCCESS_MESSAGES.STORY_LINKED_TO_EPIC === 'string', 'STORY_LINKED_TO_EPIC message defined');
    assert(typeof SUCCESS_MESSAGES.STORY_UNLINKED_FROM_EPIC === 'string', 'STORY_UNLINKED_FROM_EPIC message defined');
  });

  // Test 6: Check TaigaService Epic methods
  await test('Check TaigaService Epic methods', async () => {
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    assert(typeof service.createEpic === 'function', 'TaigaService has createEpic method');
    assert(typeof service.listEpics === 'function', 'TaigaService has listEpics method');
    assert(typeof service.getEpic === 'function', 'TaigaService has getEpic method');
    assert(typeof service.updateEpic === 'function', 'TaigaService has updateEpic method');
    assert(typeof service.linkStoryToEpic === 'function', 'TaigaService has linkStoryToEpic method');
    assert(typeof service.unlinkStoryFromEpic === 'function', 'TaigaService has unlinkStoryFromEpic method');
  });

  // Test 7: Check Epic tool registration
  await test('Check Epic tool registration', async () => {
    const { toolRegistry } = await import('../src/tools/index.js');
    
    assert(toolRegistry.epics, 'Epics category exists in tool registry');
    assert(Array.isArray(toolRegistry.epics), 'Epics category is an array');
    assert(toolRegistry.epics.length === 6, 'Epics category has 6 tools');
    
    const toolNames = toolRegistry.epics.map(tool => tool.name);
    assert(toolNames.includes('createEpic'), 'createEpic tool registered');
    assert(toolNames.includes('listEpics'), 'listEpics tool registered');
    assert(toolNames.includes('getEpic'), 'getEpic tool registered');
    assert(toolNames.includes('updateEpic'), 'updateEpic tool registered');
    assert(toolNames.includes('linkStoryToEpic'), 'linkStoryToEpic tool registered');
    assert(toolNames.includes('unlinkStoryFromEpic'), 'unlinkStoryFromEpic tool registered');
  });

  // Test 8: Test createEpic minimal requirements
  await test('Test createEpic minimal requirements', async () => {
    const { createEpicTool } = await import('../src/tools/epicTools.js');
    
    // Test minimal valid input
    try {
      const minimalResult = createEpicTool.inputSchema.parse({
        project: 123,
        subject: 'Minimal Epic'
      });
      assert(minimalResult.project === 123, 'Minimal createEpic validates project');
      assert(minimalResult.subject === 'Minimal Epic', 'Minimal createEpic validates subject');
      assert(minimalResult.description === undefined, 'Optional description can be undefined');
      assert(minimalResult.color === undefined, 'Optional color can be undefined');
      assert(minimalResult.tags === undefined, 'Optional tags can be undefined');
    } catch (error) {
      assert(false, `Minimal createEpic validation failed: ${error.message}`);
    }
  });

  // Test 9: Test updateEpic partial updates
  await test('Test updateEpic partial updates', async () => {
    const { updateEpicTool } = await import('../src/tools/epicTools.js');
    
    // Test partial update (only subject)
    try {
      const partialResult = updateEpicTool.inputSchema.parse({
        epicId: 123,
        subject: 'Updated Subject Only'
      });
      assert(partialResult.epicId === 123, 'Partial update validates epicId');
      assert(partialResult.subject === 'Updated Subject Only', 'Partial update validates subject');
      assert(partialResult.description === undefined, 'Unused fields remain undefined');
    } catch (error) {
      assert(false, `Partial update validation failed: ${error.message}`);
    }
    
    // Test update with empty optional fields
    try {
      const emptyResult = updateEpicTool.inputSchema.parse({
        epicId: 456
      });
      assert(emptyResult.epicId === 456, 'Update with only epicId validates');
    } catch (error) {
      assert(false, `Update with only epicId validation failed: ${error.message}`);
    }
  });

  // Test 10: Test authentication requirement
  await test('Test authentication requirement for Epic tools', async () => {
    const { createEpicTool, listEpicsTool, getEpicTool, updateEpicTool, linkStoryToEpicTool, unlinkStoryFromEpicTool } = 
      await import('../src/tools/epicTools.js');
    
    // For now, just check that the handlers exist and can be called
    // Real authentication testing would require integration tests
    assert(typeof createEpicTool.handler === 'function', 'createEpic handler is callable');
    assert(typeof listEpicsTool.handler === 'function', 'listEpics handler is callable');
    assert(typeof getEpicTool.handler === 'function', 'getEpic handler is callable');
    assert(typeof updateEpicTool.handler === 'function', 'updateEpic handler is callable');
    assert(typeof linkStoryToEpicTool.handler === 'function', 'linkStoryToEpic handler is callable');
    assert(typeof unlinkStoryFromEpicTool.handler === 'function', 'unlinkStoryFromEpic handler is callable');
  });

  // Print results
  console.log('\n📊 Epic Test Results:');
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed tests:');
    results.errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All Epic tests passed!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEpicTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}