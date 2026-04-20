#!/usr/bin/env node

/**
 * Wiki Management System Test Suite
 * Tests for Wiki page creation, management, and collaboration functionality
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
 * Test Suite Setup
 */
async function setupTests() {
  console.log('📖 Wiki Management System Test Suite');
  console.log('=====================================');
  
  // Import modules after logging
  let wikiTools, constants, TaigaService, utils;
  
  try {
    const wikiModule = await import('../src/tools/wikiTools.js');
    wikiTools = wikiModule;
    
    const constantsModule = await import('../src/constants.js');
    constants = constantsModule;
    
    const serviceModule = await import('../src/taigaService.js');
    TaigaService = serviceModule.TaigaService;
    
    const utilsModule = await import('../src/utils.js');
    utils = utilsModule;
    
    console.log('✅ All modules imported successfully\n');
  } catch (error) {
    console.error('❌ Failed to import modules:', error.message);
    process.exit(1);
  }
  
  return { wikiTools, constants, TaigaService, utils };
}

/**
 * Main Test Execution
 */
async function runTests() {
  const { wikiTools, constants, TaigaService, utils } = await setupTests();
  
  // Test Group 1: Wiki Tools Registration
  await test('Wiki Tools Export Verification', async () => {
    const expectedTools = [
      'createWikiPageTool',
      'listWikiPagesTool', 
      'getWikiPageTool',
      'updateWikiPageTool',
      'deleteWikiPageTool',
      'watchWikiPageTool'
    ];
    
    expectedTools.forEach(toolName => {
      assert(
        wikiTools[toolName] && typeof wikiTools[toolName] === 'object',
        `${toolName} is exported and is an object`
      );
      
      if (wikiTools[toolName]) {
        assert(
          typeof wikiTools[toolName].name === 'string',
          `${toolName} has a name property`
        );
        assert(
          typeof wikiTools[toolName].description === 'string',
          `${toolName} has a description property`
        );
        assert(
          wikiTools[toolName].inputSchema !== undefined,
          `${toolName} has an inputSchema property`
        );
        assert(
          typeof wikiTools[toolName].handler === 'function',
          `${toolName} has a handler function`
        );
      }
    });
  });

  // Test Group 2: Wiki Tool Schema Validation
  await test('createWikiPageTool Schema Validation', async () => {
    const tool = wikiTools.createWikiPageTool;
    
    // Test valid input
    const validInput = {
      project: 123,
      slug: 'my-wiki-page',
      content: '# My Wiki Page\n\nThis is content.',
      watchers: []
    };
    
    try {
      const parsed = tool.inputSchema.parse(validInput);
      assert(true, 'Valid input passes schema validation');
      assert(parsed.project === 123, 'Project ID is correctly parsed');
      assert(parsed.slug === 'my-wiki-page', 'Slug is correctly parsed');
      assert(parsed.content === '# My Wiki Page\n\nThis is content.', 'Content is correctly parsed');
    } catch (error) {
      assert(false, `Valid input should pass: ${error.message}`);
    }
    
    // Test invalid input - missing required fields
    try {
      tool.inputSchema.parse({ project: 123 });
      assert(false, 'Missing required fields should fail validation');
    } catch (error) {
      assert(true, 'Missing required fields correctly fails validation');
    }
  });

  await test('listWikiPagesTool Schema Validation', async () => {
    const tool = wikiTools.listWikiPagesTool;
    
    // Test valid inputs
    const validInputs = [
      { project: 123 },
      { project: 'my-project' },
      { project: 'project-slug' }
    ];
    
    validInputs.forEach((input, index) => {
      try {
        const parsed = tool.inputSchema.parse(input);
        assert(true, `Valid input ${index + 1} passes schema validation`);
        assert(parsed.project === input.project, `Project ${index + 1} is correctly parsed`);
      } catch (error) {
        assert(false, `Valid input ${index + 1} should pass: ${error.message}`);
      }
    });
  });

  await test('getWikiPageTool Schema Validation', async () => {
    const tool = wikiTools.getWikiPageTool;
    
    // Test valid inputs
    const validInputs = [
      { project: 123, identifier: 456 },
      { project: 'my-project', identifier: 'wiki-slug' },
      { project: 'project-slug', identifier: 789 }
    ];
    
    validInputs.forEach((input, index) => {
      try {
        const parsed = tool.inputSchema.parse(input);
        assert(true, `Valid input ${index + 1} passes schema validation`);
        assert(parsed.project === input.project, `Project ${index + 1} is correctly parsed`);
        assert(parsed.identifier === input.identifier, `Identifier ${index + 1} is correctly parsed`);
      } catch (error) {
        assert(false, `Valid input ${index + 1} should pass: ${error.message}`);
      }
    });
  });

  await test('updateWikiPageTool Schema Validation', async () => {
    const tool = wikiTools.updateWikiPageTool;
    
    // Test valid input
    const validInput = {
      project: 123,
      identifier: 'my-wiki',
      content: 'Updated content',
      watchers: [1, 2, 3]
    };
    
    try {
      const parsed = tool.inputSchema.parse(validInput);
      assert(true, 'Valid input passes schema validation');
      assert(parsed.project === 123, 'Project is correctly parsed');
      assert(parsed.identifier === 'my-wiki', 'Identifier is correctly parsed');
      assert(parsed.content === 'Updated content', 'Content is correctly parsed');
      assert(Array.isArray(parsed.watchers), 'Watchers array is correctly parsed');
    } catch (error) {
      assert(false, `Valid input should pass: ${error.message}`);
    }
  });

  await test('watchWikiPageTool Schema Validation', async () => {
    const tool = wikiTools.watchWikiPageTool;
    
    // Test valid inputs
    const validInputs = [
      { project: 123, identifier: 456, watch: true },
      { project: 123, identifier: 456, watch: false },
      { project: 123, identifier: 456 } // watch defaults to true
    ];
    
    validInputs.forEach((input, index) => {
      try {
        const parsed = tool.inputSchema.parse(input);
        assert(true, `Valid input ${index + 1} passes schema validation`);
        const expectedWatch = input.watch !== undefined ? input.watch : true;
        assert(parsed.watch === expectedWatch, `Watch boolean ${index + 1} is correctly parsed`);
      } catch (error) {
        assert(false, `Valid input ${index + 1} should pass: ${error.message}`);
      }
    });
  });

  // Test Group 3: Constants Validation
  await test('Wiki Constants Validation', async () => {
    // Check Wiki API endpoints
    assert(
      constants.API_ENDPOINTS.WIKI === '/wiki',
      'WIKI endpoint is correctly defined'
    );
    assert(
      constants.API_ENDPOINTS.WIKI_ATTACHMENTS === '/wiki/attachments',
      'WIKI_ATTACHMENTS endpoint is correctly defined'
    );
    
    // Check Wiki error messages
    const wikiErrorMessages = [
      'FAILED_TO_CREATE_WIKI',
      'FAILED_TO_LIST_WIKI',
      'FAILED_TO_GET_WIKI',
      'FAILED_TO_UPDATE_WIKI',
      'FAILED_TO_DELETE_WIKI',
      'FAILED_TO_WATCH_WIKI',
      'WIKI_PAGE_NOT_FOUND',
      'INVALID_WIKI_SLUG'
    ];
    
    wikiErrorMessages.forEach(msg => {
      assert(
        typeof constants.ERROR_MESSAGES[msg] === 'string',
        `${msg} error message is defined and is a string`
      );
    });
    
    // Check Wiki success messages
    const wikiSuccessMessages = [
      'WIKI_PAGE_CREATED',
      'WIKI_PAGE_UPDATED',
      'WIKI_PAGE_DELETED',
      'WIKI_PAGE_WATCHED'
    ];
    
    wikiSuccessMessages.forEach(msg => {
      assert(
        typeof constants.SUCCESS_MESSAGES[msg] === 'string',
        `${msg} success message is defined and is a string`
      );
    });
    
    // Check Wiki response templates
    assert(
      typeof constants.RESPONSE_TEMPLATES.NO_WIKI_PAGES === 'string',
      'NO_WIKI_PAGES template is defined and is a string'
    );
  });

  // Test Group 4: TaigaService Wiki Methods
  await test('TaigaService Wiki Methods Existence', async () => {
    const service = new TaigaService();
    
    const wikiMethods = [
      'createWikiPage',
      'listWikiPages',
      'getWikiPage',
      'getWikiPageBySlug',
      'updateWikiPage',
      'deleteWikiPage',
      'watchWikiPage'
    ];
    
    wikiMethods.forEach(method => {
      assert(
        typeof service[method] === 'function',
        `TaigaService has ${method} method`
      );
    });
  });

  // Test Group 5: Wiki Tools Integration
  await test('Wiki Tools Registry Integration', async () => {
    const toolsModule = await import('../src/tools/index.js');
    const allTools = toolsModule.getAllTools();
    
    // Check that Wiki tools are included in the registry
    const wikiToolNames = [
      'createWikiPage',
      'listWikiPages',
      'getWikiPage', 
      'updateWikiPage',
      'deleteWikiPage',
      'watchWikiPage'
    ];
    
    wikiToolNames.forEach(toolName => {
      const tool = allTools.find(t => t.name === toolName);
      assert(
        tool !== undefined,
        `${toolName} is registered in the tool registry`
      );
    });
    
    // Check that wiki category exists
    const wikiTools = toolsModule.getToolsByCategory('wiki');
    assert(
      Array.isArray(wikiTools) && wikiTools.length === 6,
      'Wiki category contains 6 tools'
    );
  });

  // Test Group 6: Error Handling Tests
  await test('Wiki Tools Error Handling', async () => {
    // Test unauthenticated access
    const tool = wikiTools.createWikiPageTool;
    
    // Mock TaigaService to return unauthenticated
    const originalService = TaigaService.prototype.isAuthenticated;
    TaigaService.prototype.isAuthenticated = () => false;
    
    try {
      const result = await tool.handler({
        project: 123,
        slug: 'test-wiki',
        content: 'Test content'
      });
      
      assert(
        result.content[0].text.includes('Authentication failed') || 
        result.isError === true,
        'Unauthenticated access returns error'
      );
    } catch (error) {
      // This is also acceptable
      assert(true, 'Unauthenticated access throws error');
    } finally {
      // Restore original method
      TaigaService.prototype.isAuthenticated = originalService;
    }
  });

  // Test Group 7: Utils Integration
  await test('Wiki Tools Utils Integration', async () => {
    // Check that Wiki tools use required utility functions
    const requiredUtils = ['createSuccessResponse', 'createErrorResponse', 'resolveProjectId'];
    
    requiredUtils.forEach(utilName => {
      assert(
        typeof utils[utilName] === 'function',
        `${utilName} utility function is available`
      );
    });
  });

  // Test Group 8: Wiki Tool Names and Descriptions
  await test('Wiki Tool Names and Descriptions Quality', async () => {
    const tools = [
      wikiTools.createWikiPageTool,
      wikiTools.listWikiPagesTool,
      wikiTools.getWikiPageTool,
      wikiTools.updateWikiPageTool,
      wikiTools.deleteWikiPageTool,
      wikiTools.watchWikiPageTool
    ];
    
    tools.forEach(tool => {
      assert(
        tool.name && tool.name.length > 0,
        `${tool.name || 'Tool'} has a non-empty name`
      );
      assert(
        tool.description && tool.description.length > 10,
        `${tool.name || 'Tool'} has a meaningful description`
      );
      assert(
        tool.name.includes('Wiki') || tool.name.includes('wiki'),
        `${tool.name || 'Tool'} name indicates it's a Wiki tool`
      );
    });
  });

  // Test Group 9: Schema Completeness
  await test('Wiki Tool Schema Completeness', async () => {
    const tools = [
      { tool: wikiTools.createWikiPageTool, requiredFields: ['project', 'slug', 'content'] },
      { tool: wikiTools.listWikiPagesTool, requiredFields: ['project'] },
      { tool: wikiTools.getWikiPageTool, requiredFields: ['project', 'identifier'] },
      { tool: wikiTools.updateWikiPageTool, requiredFields: ['project', 'identifier'] },
      { tool: wikiTools.deleteWikiPageTool, requiredFields: ['project', 'identifier'] },
      { tool: wikiTools.watchWikiPageTool, requiredFields: ['project', 'identifier'] }
    ];
    
    tools.forEach(({ tool, requiredFields }) => {
      assert(
        tool.inputSchema && typeof tool.inputSchema.parse === 'function',
        `${tool.name} has a valid Zod schema`
      );
      
      // Test that required fields are actually required
      try {
        tool.inputSchema.parse({});
        assert(false, `${tool.name} should require fields: ${requiredFields.join(', ')}`);
      } catch (error) {
        assert(true, `${tool.name} correctly requires necessary fields`);
      }
    });
  });

  // Test Group 10: Performance and Validation
  await test('Wiki Tools Performance and Validation', async () => {
    const startTime = Date.now();
    
    // Test multiple schema validations
    for (let i = 0; i < 100; i++) {
      try {
        wikiTools.createWikiPageTool.inputSchema.parse({
          project: i,
          slug: `test-wiki-${i}`,
          content: `Test content for wiki ${i}`
        });
      } catch (error) {
        // Expected to pass
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    assert(
      duration < 1000,
      `Schema validation performance is acceptable (${duration}ms for 100 validations)`
    );
    
    // Test large content handling
    const largeContent = 'x'.repeat(10000);
    try {
      const result = wikiTools.createWikiPageTool.inputSchema.parse({
        project: 123,
        slug: 'large-wiki',
        content: largeContent
      });
      assert(true, 'Large content is handled correctly');
    } catch (error) {
      assert(false, `Large content should be handled: ${error.message}`);
    }
  });

  // Final Results
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All Wiki Management System tests passed!');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});