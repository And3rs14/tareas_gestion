#!/usr/bin/env node

/**
 * Base64 File Upload Test
 * Tests the new base64-based file upload mechanism
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
 * Create a sample base64 encoded file data
 */
function createTestFileData() {
  // Simple 1x1 pixel PNG image in base64
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  return {
    fileData: testImageBase64,
    fileName: 'test_image.png',
    mimeType: 'image/png'
  };
}

/**
 * Create test text file data
 */
function createTestTextData() {
  const testText = 'This is a test file for Taiga MCP Server upload functionality.';
  const base64Text = Buffer.from(testText, 'utf-8').toString('base64');
  
  return {
    fileData: base64Text,
    fileName: 'test_document.txt',
    mimeType: 'text/plain'
  };
}

/**
 * Main test execution
 */
async function runBase64UploadTests() {
  console.log('🚀 Starting Base64 File Upload Tests...\n');

  // Test 1: Import updated attachment tools
  await test('Import updated attachment tools', async () => {
    const { uploadAttachmentTool } = await import('../src/tools/attachmentTools.js');
    
    assert(uploadAttachmentTool, 'uploadAttachmentTool imported successfully');
    assert(uploadAttachmentTool.schema.fileData, 'uploadAttachmentTool has fileData schema');
    assert(uploadAttachmentTool.schema.fileName, 'uploadAttachmentTool has fileName schema');
    assert(uploadAttachmentTool.schema.mimeType, 'uploadAttachmentTool has mimeType schema');
    assert(uploadAttachmentTool.schema.filePath, 'uploadAttachmentTool still has filePath schema for backward compatibility');
  });

  // Test 2: Validate new schema structure
  await test('Validate new schema structure', async () => {
    const { uploadAttachmentTool } = await import('../src/tools/attachmentTools.js');
    const { z } = await import('zod');
    
    try {
      const schema = z.object(uploadAttachmentTool.schema);
      const testData = createTestFileData();
      
      const validationResult = schema.parse({
        itemType: 'issue',
        itemId: 123,
        projectIdentifier: 'test-project',
        ...testData,
        description: 'Test upload'
      });
      
      assert(validationResult.itemType === 'issue', 'Schema validates itemType correctly');
      assert(validationResult.fileData === testData.fileData, 'Schema validates fileData correctly');
      assert(validationResult.fileName === testData.fileName, 'Schema validates fileName correctly');
      assert(validationResult.mimeType === testData.mimeType, 'Schema validates mimeType correctly');
    } catch (error) {
      assert(false, `Schema validation failed: ${error.message}`);
    }
  });

  // Test 3: Test schema validation - backward compatibility
  await test('Test schema validation - backward compatibility', async () => {
    const { uploadAttachmentTool } = await import('../src/tools/attachmentTools.js');
    const { z } = await import('zod');
    
    const schema = z.object(uploadAttachmentTool.schema);
    
    // Test new method (fileData + fileName) - should be valid
    try {
      const result = schema.parse({
        itemType: 'issue',
        itemId: 123,
        fileData: 'dGVzdA==',
        fileName: 'test.txt'
      });
      assert(true, 'Accepts new method with fileData + fileName');
    } catch (error) {
      assert(false, `Should accept new method: ${error.message}`);
    }
    
    // Test legacy method (filePath) - should be valid
    try {
      const result = schema.parse({
        itemType: 'issue',
        itemId: 123,
        filePath: 'test.txt'
      });
      assert(true, 'Accepts legacy method with filePath');
    } catch (error) {
      assert(false, `Should accept legacy method: ${error.message}`);
    }
    
    // Test invalid itemType
    try {
      schema.parse({
        itemType: 'invalid',
        itemId: 123,
        fileData: 'dGVzdA==',
        fileName: 'test.txt'
      });
      assert(false, 'Should reject invalid itemType');
    } catch (error) {
      assert(true, 'Correctly rejects invalid itemType');
    }
  });

  // Test 4: Test TaigaService uploadAttachment method signature
  await test('Test TaigaService uploadAttachment method signature', async () => {
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    assert(typeof service.uploadAttachment === 'function', 'TaigaService has uploadAttachment method');
    
    // Test method parameters (this would normally require authentication, so we just check the method exists)
    const methodString = service.uploadAttachment.toString();
    assert(methodString.includes('fileData'), 'uploadAttachment method accepts fileData parameter');
    assert(methodString.includes('fileName'), 'uploadAttachment method accepts fileName parameter');
    assert(methodString.includes('mimeType'), 'uploadAttachment method accepts mimeType parameter');
  });

  // Test 5: Test backward compatibility methods
  await test('Test backward compatibility methods', async () => {
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    // Test that uploadAttachmentFromPath method exists
    assert(typeof service.uploadAttachmentFromPath === 'function', 'TaigaService has uploadAttachmentFromPath method');
    
    // Test with valid parameters (would fail on authentication or file not found)
    try {
      await service.uploadAttachmentFromPath('issue', 123, 'nonexistent.txt', 'test');
      assert(false, 'Should fail on file not found or authentication');
    } catch (error) {
      // Should fail on authentication or file not found, not method signature
      const isExpectedError = error.message.includes('authenticated') || 
                             error.message.includes('File not found') ||
                             error.message.includes('environment');
      assert(isExpectedError, 'Fails on expected issues (auth/file), not method problems');
    }
    
    // Test detectMimeType method
    assert(typeof service.detectMimeType === 'function', 'TaigaService has detectMimeType method');
    const mimeType = service.detectMimeType('test.jpg');
    assert(mimeType === 'image/jpeg', 'detectMimeType correctly identifies JPG files');
  });

  // Test 6: Test different file types
  await test('Test different file types', async () => {
    const imageData = createTestFileData();
    const textData = createTestTextData();
    
    // Verify base64 encoding for different types
    assert(imageData.fileData.length > 0, 'Image data encoded to base64');
    assert(imageData.mimeType === 'image/png', 'Image MIME type set correctly');
    assert(textData.fileData.length > 0, 'Text data encoded to base64');
    assert(textData.mimeType === 'text/plain', 'Text MIME type set correctly');
    
    // Test base64 decoding
    const decodedText = Buffer.from(textData.fileData, 'base64').toString('utf-8');
    assert(decodedText.includes('test file'), 'Text data can be decoded correctly');
  });

  // Test 7: Test data URI handling
  await test('Test data URI handling', async () => {
    const testData = 'Hello, World!';
    const base64Data = Buffer.from(testData, 'utf-8').toString('base64');
    const dataURI = `data:text/plain;base64,${base64Data}`;
    
    // Test that the service can handle data URIs (extracts base64 part)
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    try {
      await service.uploadAttachment('issue', 123, dataURI, 'test.txt', 'text/plain', 'test');
      assert(false, 'Should fail on authentication');
    } catch (error) {
      // Should not fail on data URI parsing
      const isNotDataURIError = !error.message.includes('Invalid base64');
      assert(isNotDataURIError, 'Handles data URI format correctly');
    }
  });

  // Test 8: Test documentation and guide
  await test('Check documentation exists', async () => {
    const fs = await import('fs');
    const guidePath = join(__dirname, '..', 'FILE_UPLOAD_GUIDE.md');
    
    const guideExists = fs.existsSync(guidePath);
    assert(guideExists, 'FILE_UPLOAD_GUIDE.md exists');
    
    if (guideExists) {
      const guideContent = fs.readFileSync(guidePath, 'utf-8');
      assert(guideContent.includes('Base64'), 'Guide mentions Base64');
      assert(guideContent.includes('fileData'), 'Guide mentions fileData parameter');
      assert(guideContent.includes('fileName'), 'Guide mentions fileName parameter');
      assert(guideContent.includes('mimeType'), 'Guide mentions mimeType parameter');
    }
  });

  // Print results
  console.log('\n📊 Base64 Upload Test Results:');
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed tests:');
    results.errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  } else {
    console.log('\n🎉 All base64 upload tests passed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your MCP client to use the new base64 format');
    console.log('2. Replace filePath with fileData, fileName, and mimeType');
    console.log('3. Test with real Taiga instance using proper authentication');
    console.log('4. Check FILE_UPLOAD_GUIDE.md for detailed migration instructions');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBase64UploadTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}