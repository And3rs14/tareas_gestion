/**
 * 評論系統測試套件
 * Comment System Test Suite for Taiga MCP Server
 */

import { getAllTools } from '../src/tools/index.js';

console.log('🧪 Starting Comment System Test Suite...\n');

let testResults = {
  passed: 0,
  failed: 0,
  details: []
};

function logTest(testName, passed, details = '') {
  const status = passed ? '✅' : '❌';
  const message = `${status} ${testName}`;
  console.log(message);
  
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.details.push({ testName, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function runCommentSystemTests() {
  console.log('💬 Testing Comment System Functionality\n');
  
  try {
    // Test 1: 檢查評論工具是否正確註冊
    console.log('1️⃣ Testing Comment Tools Registration...');
    
    const allTools = getAllTools();
    const commentTools = allTools.filter(tool => 
      ['addComment', 'listComments', 'editComment', 'deleteComment'].includes(tool.name)
    );
    
    if (commentTools.length === 4) {
      logTest('Comment Tools Registration', true, 'All 4 comment tools registered successfully');
    } else {
      logTest('Comment Tools Registration', false, `Expected 4 tools, found ${commentTools.length}`);
    }
    
    // Test 2: 檢查addComment工具結構
    console.log('\n2️⃣ Testing addComment Tool Structure...');
    
    const addCommentTool = commentTools.find(tool => tool.name === 'addComment');
    if (addCommentTool) {
      const hasRequiredFields = addCommentTool.schema && 
                               addCommentTool.schema.itemType &&
                               addCommentTool.schema.itemId &&
                               addCommentTool.schema.comment &&
                               typeof addCommentTool.handler === 'function';
      
      if (hasRequiredFields) {
        logTest('addComment Tool Structure', true, 'Has all required schema fields and handler');
      } else {
        logTest('addComment Tool Structure', false, 'Missing required schema fields or handler');
      }
    } else {
      logTest('addComment Tool Structure', false, 'addComment tool not found');
    }
    
    // Test 3: 檢查listComments工具結構  
    console.log('\n3️⃣ Testing listComments Tool Structure...');
    
    const listCommentsTool = commentTools.find(tool => tool.name === 'listComments');
    if (listCommentsTool) {
      const hasRequiredFields = listCommentsTool.schema &&
                               listCommentsTool.schema.itemType &&
                               listCommentsTool.schema.itemId &&
                               typeof listCommentsTool.handler === 'function';
      
      if (hasRequiredFields) {
        logTest('listComments Tool Structure', true, 'Has all required schema fields and handler');
      } else {
        logTest('listComments Tool Structure', false, 'Missing required schema fields or handler');
      }
    } else {
      logTest('listComments Tool Structure', false, 'listComments tool not found');
    }
    
    // Test 4: 檢查editComment工具結構
    console.log('\n4️⃣ Testing editComment Tool Structure...');
    
    const editCommentTool = commentTools.find(tool => tool.name === 'editComment');
    if (editCommentTool) {
      const hasRequiredFields = editCommentTool.schema &&
                               editCommentTool.schema.commentId &&
                               editCommentTool.schema.newComment &&
                               typeof editCommentTool.handler === 'function';
      
      if (hasRequiredFields) {
        logTest('editComment Tool Structure', true, 'Has all required schema fields and handler');
      } else {
        logTest('editComment Tool Structure', false, 'Missing required schema fields or handler');
      }
    } else {
      logTest('editComment Tool Structure', false, 'editComment tool not found');
    }
    
    // Test 5: 檢查deleteComment工具結構
    console.log('\n5️⃣ Testing deleteComment Tool Structure...');
    
    const deleteCommentTool = commentTools.find(tool => tool.name === 'deleteComment');
    if (deleteCommentTool) {
      const hasRequiredFields = deleteCommentTool.schema &&
                               deleteCommentTool.schema.commentId &&
                               typeof deleteCommentTool.handler === 'function';
      
      if (hasRequiredFields) {
        logTest('deleteComment Tool Structure', true, 'Has all required schema fields and handler');
      } else {
        logTest('deleteComment Tool Structure', false, 'Missing required schema fields or handler');
      }
    } else {
      logTest('deleteComment Tool Structure', false, 'deleteComment tool not found');
    }
    
    // Test 6: 測試工具分類
    console.log('\n6️⃣ Testing Comment Tools Category...');
    
    try {
      const { toolRegistry } = await import('../src/tools/index.js');
      
      if (toolRegistry.comments && Array.isArray(toolRegistry.comments)) {
        const categoryToolCount = toolRegistry.comments.length;
        if (categoryToolCount === 4) {
          logTest('Comment Tools Category', true, 'Comment category has 4 tools');
        } else {
          logTest('Comment Tools Category', false, `Expected 4 tools in category, found ${categoryToolCount}`);
        }
      } else {
        logTest('Comment Tools Category', false, 'Comments category not found in toolRegistry');
      }
    } catch (error) {
      logTest('Comment Tools Category', false, `Category import error: ${error.message}`);
    }
    
    // Test 7: Schema驗證測試
    console.log('\n7️⃣ Testing Schema Validation...');
    
    try {
      // 測試addComment的itemType枚舉驗證
      const addCommentSchema = addCommentTool.schema.itemType;
      const hasValidEnum = addCommentSchema && 
                          addCommentSchema._def && 
                          addCommentSchema._def.values &&
                          addCommentSchema._def.values.includes('issue') &&
                          addCommentSchema._def.values.includes('user_story') &&
                          addCommentSchema._def.values.includes('task');
      
      if (hasValidEnum) {
        logTest('Schema Validation', true, 'itemType enum includes issue, user_story, task');
      } else {
        logTest('Schema Validation', false, 'itemType enum validation failed');
      }
    } catch (error) {
      logTest('Schema Validation', false, `Schema validation error: ${error.message}`);
    }
    
    // Test 8: 常量定義測試
    console.log('\n8️⃣ Testing Comment Constants...');
    
    try {
      const { ERROR_MESSAGES, SUCCESS_MESSAGES } = await import('../src/constants.js');
      
      const hasCommentErrorMessages = ERROR_MESSAGES.FAILED_TO_ADD_COMMENT &&
                                     ERROR_MESSAGES.FAILED_TO_LIST_COMMENTS &&
                                     ERROR_MESSAGES.FAILED_TO_EDIT_COMMENT &&
                                     ERROR_MESSAGES.FAILED_TO_DELETE_COMMENT &&
                                     ERROR_MESSAGES.COMMENT_NOT_FOUND;
      
      const hasCommentSuccessMessages = SUCCESS_MESSAGES.COMMENT_ADDED &&
                                       SUCCESS_MESSAGES.COMMENT_EDITED &&
                                       SUCCESS_MESSAGES.COMMENT_DELETED;
      
      if (hasCommentErrorMessages && hasCommentSuccessMessages) {
        logTest('Comment Constants', true, 'All comment-related constants defined');
      } else {
        logTest('Comment Constants', false, 'Missing comment-related constants');
      }
    } catch (error) {
      logTest('Comment Constants', false, `Constants import error: ${error.message}`);
    }
    
    // Test 9: API端點常量測試
    console.log('\n9️⃣ Testing API Endpoints...');
    
    try {
      const { API_ENDPOINTS } = await import('../src/constants.js');
      
      const hasCommentEndpoints = API_ENDPOINTS.HISTORY && API_ENDPOINTS.COMMENTS;
      
      if (hasCommentEndpoints) {
        logTest('API Endpoints', true, 'Comment-related API endpoints defined');
      } else {
        logTest('API Endpoints', false, 'Missing comment API endpoints');
      }
    } catch (error) {
      logTest('API Endpoints', false, `API endpoints error: ${error.message}`);
    }
    
    // Test 10: 工具總數更新測試
    console.log('\n🔟 Testing Total Tool Count...');
    
    const totalToolCount = allTools.length;
    const expectedMinimumCount = 23; // 最少应该有这么多工具
    
    if (totalToolCount >= expectedMinimumCount) {
      logTest('Total Tool Count', true, `Tool count is ${totalToolCount} (>= ${expectedMinimumCount})`);
    } else {
      logTest('Total Tool Count', false, `Expected at least ${expectedMinimumCount} tools, found ${totalToolCount}`);
    }
    
  } catch (error) {
    logTest('Comment System Test Suite', false, `Test suite execution failed: ${error.message}`);
  }
}

// 運行測試
await runCommentSystemTests();

// 打印摘要
console.log('\n📊 Comment System Test Results:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 All comment system tests passed! Comment functionality is ready for use.');
} else {
  console.log('\n⚠️  Some comment system tests failed. Review the issues above.');
  process.exit(1);
}

console.log('\n🏁 Comment System Test Suite Complete\n');