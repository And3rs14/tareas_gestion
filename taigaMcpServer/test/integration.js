#!/usr/bin/env node

/**
 * Integration Test Suite
 * Tests end-to-end workflows with actual Taiga credentials
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

class IntegrationTestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.client = null;
    this.projectSlug = null;
    this.createdItems = []; // Track items to cleanup
  }

  async setup() {
    console.log('🔄 Starting Integration Tests with Taiga API\n');
    
    // Check if credentials are available
    if (!process.env.TAIGA_USERNAME || !process.env.TAIGA_PASSWORD) {
      console.log('⚠️  TAIGA_USERNAME or TAIGA_PASSWORD not found in .env');
      console.log('   Skipping integration tests (this is OK for CI/testing)');
      return false;
    }

    // Create transport
    const transport = new StdioClientTransport({
      command: 'node',
      args: [join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'index.js')],
    });

    // Create client
    this.client = new Client(
      {
        name: 'Taiga MCP Integration Test',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    try {
      await this.client.connect(transport);
      console.log('✅ Connected to Taiga MCP server');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect:', error.message);
      return false;
    }
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
    const connected = await this.setup();
    if (!connected) {
      console.log('📋 Integration tests skipped (no credentials)\n');
      return;
    }

    try {
      // Test 1: Authentication
      await this.test('Authenticate with Taiga', async () => {
        const result = await this.client.callTool({
          name: 'authenticate',
          arguments: {
            username: process.env.TAIGA_USERNAME,
            password: process.env.TAIGA_PASSWORD
          }
        });
        
        this.assert(result && result.content, 'Should return authentication result');
        const content = result.content[0]?.text || '';
        this.assert(content.includes('successful') || content.includes('authenticated'), 'Should indicate successful authentication');
      });

      // Test 2: List actual projects
      await this.test('List actual projects', async () => {
        const result = await this.client.callTool({
          name: 'listProjects',
          arguments: {}
        });
        
        this.assert(result && result.content, 'Should return projects');
        const content = result.content[0]?.text || '';
        
        if (content.includes('No projects found')) {
          console.log('\n   ℹ️  No projects found in account');
          return;
        }
        
        // Extract first project slug for further tests
        const slugMatch = content.match(/Slug: ([^\)]+)/);
        if (slugMatch) {
          this.projectSlug = slugMatch[1];
          console.log(`\n   📁 Using project: ${this.projectSlug}`);
        }
      });

      // Test 3: Get project details (if we have a project)
      if (this.projectSlug) {
        await this.test('Get project details', async () => {
          const result = await this.client.callTool({
            name: 'getProject',
            arguments: {
              projectIdentifier: this.projectSlug
            }
          });
          
          this.assert(result && result.content, 'Should return project details');
          const content = result.content[0]?.text || '';
          this.assert(content.includes('Project:') || content.includes('Name:'), 'Should contain project information');
        });

        // Test 4: List sprints/milestones
        await this.test('List project sprints', async () => {
          const result = await this.client.callTool({
            name: 'listMilestones',
            arguments: {
              projectIdentifier: this.projectSlug
            }
          });
          
          this.assert(result && result.content, 'Should return milestones list');
          const content = result.content[0]?.text || '';
          this.assert(
            content.includes('Milestones') || content.includes('No milestones') || content.includes('Sprint'),
            'Should contain milestone information'
          );
        });

        // Test 5: List user stories
        await this.test('List user stories', async () => {
          const result = await this.client.callTool({
            name: 'listUserStories',
            arguments: {
              projectIdentifier: this.projectSlug
            }
          });
          
          this.assert(result && result.content, 'Should return user stories');
          const content = result.content[0]?.text || '';
          this.assert(
            content.includes('User Stories') || content.includes('No user stories') || content.includes('Story'),
            'Should contain user story information'
          );
        });

        // Test 6: List issues
        await this.test('List project issues', async () => {
          const result = await this.client.callTool({
            name: 'listIssues',
            arguments: {
              projectIdentifier: this.projectSlug
            }
          });
          
          this.assert(result && result.content, 'Should return issues list');
          const content = result.content[0]?.text || '';
          this.assert(
            content.includes('Issues') || content.includes('No issues') || content.includes('Issue'),
            'Should contain issue information'
          );
        });
      }

      // Test 7: Read projects resource
      await this.test('Read projects resource', async () => {
        const result = await this.client.readResource('projects://list');
        this.assert(result && result.contents, 'Should return resource contents');
        const content = result.contents[0]?.text || '';
        this.assert(content.includes('Projects') || content.includes('project'), 'Should contain project information');
      });

    } catch (error) {
      console.error('\n❌ Integration test suite failed:', error);
      process.exit(1);
    }

    // Print results
    console.log('\n📊 Integration Test Results:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    
    if (this.passed + this.failed > 0) {
      console.log(`📈 Success Rate: ${Math.round((this.passed / (this.passed + this.failed)) * 100)}%`);
    }

    if (this.failed > 0) {
      console.log('\n⚠️  Some integration tests failed.');
      process.exit(1);
    } else if (this.passed > 0) {
      console.log('\n🎉 All integration tests passed!');
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new IntegrationTestRunner();
  runner.run().catch(error => {
    console.error('Integration test runner failed:', error);
    process.exit(1);
  });
}

export default IntegrationTestRunner;