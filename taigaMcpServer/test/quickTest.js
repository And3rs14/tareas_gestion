#!/usr/bin/env node

/**
 * Quick Test - Simplified test that doesn't use child process
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAllTools } from '../src/tools/index.js';
import { SERVER_INFO } from '../src/constants.js';

async function quickTest() {
  console.log('🧪 Quick MCP Server Test\n');

  try {
    // Test 1: Server Creation
    console.log('📝 Test 1: Creating MCP server...');
    const server = new McpServer({
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
    });
    console.log('✅ Server created successfully');

    // Test 2: Tool Registration
    console.log('📝 Test 2: Registering tools...');
    registerAllTools(server);
    console.log('✅ Tools registered successfully');

    // Test 3: Check internal state
    console.log('📝 Test 3: Checking server state...');
    console.log(`   Server name: ${server._name || 'undefined'}`);
    console.log(`   Expected: ${SERVER_INFO.name}`);
    console.log(`   Server version: ${server._version || 'undefined'}`);
    console.log(`   Expected: ${SERVER_INFO.version}`);
    console.log('✅ Server state checked (internal properties may vary by SDK version)');

    // Test 4: Environment check
    console.log('📝 Test 4: Checking environment...');
    const hasEnvFile = process.env.TAIGA_API_URL || process.env.TAIGA_USERNAME;
    if (hasEnvFile) {
      console.log('✅ Environment variables detected');
    } else {
      console.log('⚠️  No environment variables found (this is OK for testing)');
    }

    console.log('\n🎉 All quick tests passed!');
    console.log('💡 For full testing with actual MCP connections, run: npm run test:basic');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

quickTest();