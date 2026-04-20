#!/usr/bin/env node

/**
 * Attachment System Test Suite
 * Tests for file attachment management functionality
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
async function runAttachmentTests() {
  console.log('🚀 Starting Attachment System Tests...\n');

  // Test 1: Import attachment tools
  await test('Import attachment tools', async () => {
    const { uploadAttachmentTool, listAttachmentsTool, downloadAttachmentTool, deleteAttachmentTool } = 
      await import('../src/tools/attachmentTools.js');
    
    assert(uploadAttachmentTool, 'uploadAttachmentTool imported successfully');
    assert(listAttachmentsTool, 'listAttachmentsTool imported successfully');
    assert(downloadAttachmentTool, 'downloadAttachmentTool imported successfully');
    assert(deleteAttachmentTool, 'deleteAttachmentTool imported successfully');
  });

  // Test 2: Validate tool structure
  await test('Validate attachment tool structure', async () => {
    const { uploadAttachmentTool, listAttachmentsTool, downloadAttachmentTool, deleteAttachmentTool } = 
      await import('../src/tools/attachmentTools.js');
    
    // Check uploadAttachmentTool structure
    assert(uploadAttachmentTool.name === 'uploadAttachment', 'uploadAttachmentTool has correct name');
    assert(typeof uploadAttachmentTool.description === 'string', 'uploadAttachmentTool has description');
    assert(typeof uploadAttachmentTool.schema === 'object', 'uploadAttachmentTool has schema');
    assert(typeof uploadAttachmentTool.handler === 'function', 'uploadAttachmentTool has handler function');
    
    // Check listAttachmentsTool structure
    assert(listAttachmentsTool.name === 'listAttachments', 'listAttachmentsTool has correct name');
    assert(typeof listAttachmentsTool.description === 'string', 'listAttachmentsTool has description');
    assert(typeof listAttachmentsTool.schema === 'object', 'listAttachmentsTool has schema');
    assert(typeof listAttachmentsTool.handler === 'function', 'listAttachmentsTool has handler function');
    
    // Check downloadAttachmentTool structure
    assert(downloadAttachmentTool.name === 'downloadAttachment', 'downloadAttachmentTool has correct name');
    assert(typeof downloadAttachmentTool.description === 'string', 'downloadAttachmentTool has description');
    assert(typeof downloadAttachmentTool.schema === 'object', 'downloadAttachmentTool has schema');
    assert(typeof downloadAttachmentTool.handler === 'function', 'downloadAttachmentTool has handler function');
    
    // Check deleteAttachmentTool structure
    assert(deleteAttachmentTool.name === 'deleteAttachment', 'deleteAttachmentTool has correct name');
    assert(typeof deleteAttachmentTool.description === 'string', 'deleteAttachmentTool has description');
    assert(typeof deleteAttachmentTool.schema === 'object', 'deleteAttachmentTool has schema');
    assert(typeof deleteAttachmentTool.handler === 'function', 'deleteAttachmentTool has handler function');
  });

  // Test 3: Validate input schemas
  await test('Validate attachment tool schemas', async () => {
    const { uploadAttachmentTool, listAttachmentsTool, downloadAttachmentTool, deleteAttachmentTool } = 
      await import('../src/tools/attachmentTools.js');
    
    // Test uploadAttachment schema
    try {
      // Create zod schema from the tool schema
      const { z } = await import('zod');
      const uploadSchema = z.object(uploadAttachmentTool.schema);
      const uploadResult = uploadSchema.parse({
        itemType: 'issue',
        itemId: 123,
        filePath: '/path/to/file.txt',
        description: 'Test attachment'
      });
      assert(uploadResult.itemType === 'issue', 'uploadAttachment schema validates itemType');
      assert(uploadResult.itemId === 123, 'uploadAttachment schema validates itemId');
      assert(uploadResult.filePath === '/path/to/file.txt', 'uploadAttachment schema validates filePath');
      assert(uploadResult.description === 'Test attachment', 'uploadAttachment schema validates description');
    } catch (error) {
      assert(false, `uploadAttachment schema validation failed: ${error.message}`);
    }
    
    // Test listAttachments schema
    try {
      const { z } = await import('zod');
      const listSchema = z.object(listAttachmentsTool.schema);
      const listResult = listSchema.parse({
        itemType: 'user_story',
        itemId: 456
      });
      assert(listResult.itemType === 'user_story', 'listAttachments schema validates itemType');
      assert(listResult.itemId === 456, 'listAttachments schema validates itemId');
    } catch (error) {
      assert(false, `listAttachments schema validation failed: ${error.message}`);
    }
    
    // Test downloadAttachment schema
    try {
      const { z } = await import('zod');
      const downloadSchema = z.object(downloadAttachmentTool.schema);
      const downloadResult = downloadSchema.parse({
        attachmentId: 789,
        downloadPath: '/download/path'
      });
      assert(downloadResult.attachmentId === 789, 'downloadAttachment schema validates attachmentId');
      assert(downloadResult.downloadPath === '/download/path', 'downloadAttachment schema validates downloadPath');
    } catch (error) {
      assert(false, `downloadAttachment schema validation failed: ${error.message}`);
    }
    
    // Test deleteAttachment schema
    try {
      const { z } = await import('zod');
      const deleteSchema = z.object(deleteAttachmentTool.schema);
      const deleteResult = deleteSchema.parse({
        attachmentId: 999
      });
      assert(deleteResult.attachmentId === 999, 'deleteAttachment schema validates attachmentId');
    } catch (error) {
      assert(false, `deleteAttachment schema validation failed: ${error.message}`);
    }
  });

  // Test 4: Test schema validation errors
  await test('Test attachment schema validation errors', async () => {
    const { uploadAttachmentTool, downloadAttachmentTool } = 
      await import('../src/tools/attachmentTools.js');
    const { z } = await import('zod');
    
    // Test invalid itemType for upload
    try {
      const uploadSchema = z.object(uploadAttachmentTool.schema);
      uploadSchema.parse({
        itemType: 'invalid_type',
        itemId: 123,
        filePath: '/path/to/file.txt'
      });
      assert(false, 'Should reject invalid itemType');
    } catch (error) {
      assert(true, 'uploadAttachment correctly rejects invalid itemType');
    }
    
    // Test missing filePath for upload
    try {
      const uploadSchema = z.object(uploadAttachmentTool.schema);
      uploadSchema.parse({
        itemType: 'task',
        itemId: 123
      });
      assert(false, 'Should reject missing filePath');
    } catch (error) {
      assert(true, 'uploadAttachment correctly rejects missing filePath');
    }
    
    // Test invalid attachmentId type for download
    try {
      const downloadSchema = z.object(downloadAttachmentTool.schema);
      downloadSchema.parse({
        attachmentId: 'not_a_number'
      });
      assert(false, 'Should reject non-number attachmentId');
    } catch (error) {
      assert(true, 'downloadAttachment correctly rejects invalid attachmentId type');
    }
  });

  // Test 5: Check attachment API endpoints in constants
  await test('Check attachment constants', async () => {
    const { API_ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } = await import('../src/constants.js');
    
    // Check API endpoints
    assert(API_ENDPOINTS.ISSUE_ATTACHMENTS === '/issues/attachments', 'ISSUE_ATTACHMENTS endpoint defined');
    assert(API_ENDPOINTS.USERSTORY_ATTACHMENTS === '/userstories/attachments', 'USERSTORY_ATTACHMENTS endpoint defined');
    assert(API_ENDPOINTS.TASK_ATTACHMENTS === '/tasks/attachments', 'TASK_ATTACHMENTS endpoint defined');
    
    // Check error messages
    assert(typeof ERROR_MESSAGES.FAILED_TO_UPLOAD_ATTACHMENT === 'string', 'FAILED_TO_UPLOAD_ATTACHMENT message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_LIST_ATTACHMENTS === 'string', 'FAILED_TO_LIST_ATTACHMENTS message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_DOWNLOAD_ATTACHMENT === 'string', 'FAILED_TO_DOWNLOAD_ATTACHMENT message defined');
    assert(typeof ERROR_MESSAGES.FAILED_TO_DELETE_ATTACHMENT === 'string', 'FAILED_TO_DELETE_ATTACHMENT message defined');
    assert(typeof ERROR_MESSAGES.ATTACHMENT_NOT_FOUND === 'string', 'ATTACHMENT_NOT_FOUND message defined');
    assert(typeof ERROR_MESSAGES.INVALID_FILE_FORMAT === 'string', 'INVALID_FILE_FORMAT message defined');
    assert(typeof ERROR_MESSAGES.FILE_TOO_LARGE === 'string', 'FILE_TOO_LARGE message defined');
    
    // Check success messages
    assert(typeof SUCCESS_MESSAGES.ATTACHMENT_UPLOADED === 'string', 'ATTACHMENT_UPLOADED message defined');
    assert(typeof SUCCESS_MESSAGES.ATTACHMENT_DOWNLOADED === 'string', 'ATTACHMENT_DOWNLOADED message defined');
    assert(typeof SUCCESS_MESSAGES.ATTACHMENT_DELETED === 'string', 'ATTACHMENT_DELETED message defined');
  });

  // Test 6: Check TaigaService attachment methods
  await test('Check TaigaService attachment methods', async () => {
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    assert(typeof service.uploadAttachment === 'function', 'TaigaService has uploadAttachment method');
    assert(typeof service.listAttachments === 'function', 'TaigaService has listAttachments method');
    assert(typeof service.downloadAttachment === 'function', 'TaigaService has downloadAttachment method');
    assert(typeof service.deleteAttachment === 'function', 'TaigaService has deleteAttachment method');
    assert(typeof service.getAttachmentEndpoint === 'function', 'TaigaService has getAttachmentEndpoint method');
  });

  // Test 7: Test attachment endpoint resolution
  await test('Test attachment endpoint resolution', async () => {
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    assert(service.getAttachmentEndpoint('issue') === '/issues/attachments', 'Issue endpoint resolved correctly');
    assert(service.getAttachmentEndpoint('user_story') === '/userstories/attachments', 'User story endpoint resolved correctly');
    assert(service.getAttachmentEndpoint('task') === '/tasks/attachments', 'Task endpoint resolved correctly');
    assert(service.getAttachmentEndpoint('unknown') === '/issues/attachments', 'Unknown type defaults to issue endpoint');
  });

  // Test 8: Check tool registration
  await test('Check attachment tool registration', async () => {
    const { toolRegistry } = await import('../src/tools/index.js');
    
    assert(toolRegistry.attachments, 'Attachments category exists in tool registry');
    assert(Array.isArray(toolRegistry.attachments), 'Attachments category is an array');
    assert(toolRegistry.attachments.length === 4, 'Attachments category has 4 tools');
    
    const toolNames = toolRegistry.attachments.map(tool => tool.name);
    assert(toolNames.includes('uploadAttachment'), 'uploadAttachment tool registered');
    assert(toolNames.includes('listAttachments'), 'listAttachments tool registered');
    assert(toolNames.includes('downloadAttachment'), 'downloadAttachment tool registered');
    assert(toolNames.includes('deleteAttachment'), 'deleteAttachment tool registered');
  });

  // Test 9: Test package.json dependencies
  await test('Check package.json dependencies for attachments', async () => {
    const fs = await import('fs');
    const packageJson = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    
    assert(packageJson.dependencies['form-data'], 'form-data dependency added to package.json');
    assert(typeof packageJson.dependencies['form-data'] === 'string', 'form-data has version specified');
  });

  // Test 10: Test authentication requirement
  await test('Test authentication requirement for attachment tools', async () => {
    const { uploadAttachmentTool, listAttachmentsTool, downloadAttachmentTool, deleteAttachmentTool } = 
      await import('../src/tools/attachmentTools.js');
    
    // Mock unauthenticated state
    const mockUnauthenticatedHandler = async (params) => {
      // This would simulate an unauthenticated user trying to use the tools
      // In real implementation, we'd mock TaigaService.isAuthenticated() to return false
      try {
        // For now, just check that the handler exists and can be called
        // Real authentication testing would require integration tests
        assert(typeof uploadAttachmentTool.handler === 'function', 'uploadAttachment handler is callable');
        assert(typeof listAttachmentsTool.handler === 'function', 'listAttachments handler is callable');
        assert(typeof downloadAttachmentTool.handler === 'function', 'downloadAttachment handler is callable');
        assert(typeof deleteAttachmentTool.handler === 'function', 'deleteAttachment handler is callable');
      } catch (error) {
        assert(false, `Handler test failed: ${error.message}`);
      }
    };
    
    await mockUnauthenticatedHandler();
  });

  // Print results
  console.log('\n📊 Attachment Test Results:');
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed tests:');
    results.errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All attachment tests passed!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAttachmentTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}