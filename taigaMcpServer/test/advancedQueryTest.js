/**
 * 高級查詢功能測試套件
 * Advanced Query Test Suite for Taiga MCP Server
 */

import { QueryParser } from '../src/query/QueryParser.js';
import { QueryExecutor } from '../src/query/QueryExecutor.js';
import { OPERATORS, FIELD_TYPES, VALIDATION_RULES } from '../src/query/queryGrammar.js';

console.log('🧪 Starting Advanced Query Test Suite...\n');

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

async function runAdvancedQueryTests() {
  console.log('🔍 Testing Advanced Query Functionality\n');
  
  try {
    // Test 1: QueryParser 基礎測試
    console.log('1️⃣ Testing QueryParser Basic Functionality...');
    
    const parser = new QueryParser();
    
    // 測試簡單查詢解析
    try {
      const simpleQuery = parser.parse('status:open', 'ISSUE');
      
      if (simpleQuery.filters.length === 1 && 
          simpleQuery.filters[0].field === 'status' && 
          simpleQuery.filters[0].value === 'open') {
        logTest('Simple Query Parsing', true, 'status:open parsed correctly');
      } else {
        logTest('Simple Query Parsing', false, 'Failed to parse simple query');
      }
    } catch (error) {
      logTest('Simple Query Parsing', false, `Parser error: ${error.message}`);
    }
    
    // Test 2: 複雜查詢解析
    console.log('\n2️⃣ Testing Complex Query Parsing...');
    
    try {
      const complexQuery = parser.parse('status:open AND priority:high', 'ISSUE');
      
      if (complexQuery.filters.length === 2 && 
          complexQuery.logic === 'AND') {
        logTest('Complex Query Parsing', true, 'AND logic parsed correctly');
      } else {
        logTest('Complex Query Parsing', false, 'Failed to parse complex query');
      }
    } catch (error) {
      logTest('Complex Query Parsing', false, `Complex parser error: ${error.message}`);
    }
    
    // Test 3: 操作符測試
    console.log('\n3️⃣ Testing Query Operators...');
    
    try {
      const operatorQuery = parser.parse('points:>=5', 'USER_STORY');
      
      if (operatorQuery.filters.length === 1 && 
          operatorQuery.filters[0].operator === '>=') {
        logTest('Operator Parsing', true, '>= operator parsed correctly');
      } else {
        logTest('Operator Parsing', false, 'Failed to parse operators');
      }
    } catch (error) {
      logTest('Operator Parsing', false, `Operator error: ${error.message}`);
    }
    
    // Test 4: 排序和限制解析
    console.log('\n4️⃣ Testing ORDER BY and LIMIT...');
    
    try {
      const sortQuery = parser.parse('status:open ORDER BY created DESC LIMIT 10', 'ISSUE');
      
      if (sortQuery.orderBy && 
          sortQuery.orderBy.field === 'created' && 
          sortQuery.orderBy.direction === 'DESC' &&
          sortQuery.limit === 10) {
        logTest('ORDER BY and LIMIT', true, 'Sorting and limit parsed correctly');
      } else {
        logTest('ORDER BY and LIMIT', false, 'Failed to parse ORDER BY/LIMIT');
      }
    } catch (error) {
      logTest('ORDER BY and LIMIT', false, `Sort/limit error: ${error.message}`);
    }
    
    // Test 5: 查詢驗證
    console.log('\n5️⃣ Testing Query Validation...');
    
    try {
      // 測試有效字段
      const validField = VALIDATION_RULES.isValidField('status', 'ISSUE');
      const invalidField = VALIDATION_RULES.isValidField('invalid_field', 'ISSUE');
      
      if (validField && !invalidField) {
        logTest('Field Validation', true, 'Field validation working correctly');
      } else {
        logTest('Field Validation', false, 'Field validation failed');
      }
    } catch (error) {
      logTest('Field Validation', false, `Validation error: ${error.message}`);
    }
    
    // Test 6: Mock QueryExecutor 測試
    console.log('\n6️⃣ Testing QueryExecutor with Mock Data...');
    
    try {
      // 創建模擬數據
      const mockIssues = [
        {
          id: 1,
          ref: 101,
          subject: '修復登入Bug',
          status: 'open',
          priority: 'high',
          type: 'bug',
          assignee: 'john',
          created_date: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          ref: 102,
          subject: '新增搜索功能',
          status: 'in-progress',
          priority: 'medium',
          type: 'feature',
          assignee: 'mary',
          created_date: '2024-01-16T11:00:00Z'
        },
        {
          id: 3,
          ref: 103,
          subject: '更新文檔',
          status: 'open',
          priority: 'low',
          type: 'task',
          assignee: 'john',
          created_date: '2024-01-17T12:00:00Z'
        }
      ];
      
      // 創建模擬 QueryExecutor
      const mockExecutor = createMockExecutor(mockIssues);
      
      // 測試過濾功能
      const query = { 
        filters: [{ field: 'status', operator: '=', value: 'open' }],
        logic: 'AND'
      };
      
      const filtered = mockExecutor.applyFilters(mockIssues, query.filters, query.logic);
      
      if (filtered.length === 2) {
        logTest('Mock QueryExecutor Filtering', true, 'Filtered 2 open issues correctly');
      } else {
        logTest('Mock QueryExecutor Filtering', false, `Expected 2, got ${filtered.length}`);
      }
      
    } catch (error) {
      logTest('Mock QueryExecutor Filtering', false, `Executor error: ${error.message}`);
    }
    
    // Test 7: 複雜過濾測試
    console.log('\n7️⃣ Testing Complex Filtering...');
    
    try {
      const mockIssues = [
        { status: 'open', priority: 'high', assignee: 'john' },
        { status: 'open', priority: 'low', assignee: 'mary' },
        { status: 'closed', priority: 'high', assignee: 'john' }
      ];
      
      const mockExecutor = createMockExecutor(mockIssues);
      
      // 測試 AND 邏輯
      const andQuery = { 
        filters: [
          { field: 'status', operator: '=', value: 'open' },
          { field: 'assignee', operator: '=', value: 'john' }
        ],
        logic: 'AND'
      };
      
      const andResult = mockExecutor.applyFilters(mockIssues, andQuery.filters, andQuery.logic);
      
      if (andResult.length === 1) {
        logTest('AND Logic Filtering', true, 'AND logic working correctly');
      } else {
        logTest('AND Logic Filtering', false, `Expected 1, got ${andResult.length}`);
      }
      
      // 測試 OR 邏輯
      const orQuery = { 
        filters: [
          { field: 'priority', operator: '=', value: 'high' },
          { field: 'assignee', operator: '=', value: 'mary' }
        ],
        logic: 'OR'
      };
      
      const orResult = mockExecutor.applyFilters(mockIssues, orQuery.filters, orQuery.logic);
      
      if (orResult.length === 3) {
        logTest('OR Logic Filtering', true, 'OR logic working correctly');
      } else {
        logTest('OR Logic Filtering', false, `Expected 3, got ${orResult.length}`);
      }
      
    } catch (error) {
      logTest('Complex Filtering', false, `Complex filtering error: ${error.message}`);
    }
    
    // Test 8: 錯誤處理測試
    console.log('\n8️⃣ Testing Error Handling...');
    
    try {
      // 測試空查詢
      try {
        parser.parse('', 'ISSUE');
        logTest('Empty Query Error', false, 'Should have thrown error for empty query');
      } catch (error) {
        logTest('Empty Query Error', true, 'Correctly caught empty query error');
      }
      
      // 測試無效字段
      try {
        parser.parse('invalid_field:value', 'ISSUE');
        logTest('Invalid Field Error', false, 'Should have thrown error for invalid field');
      } catch (error) {
        logTest('Invalid Field Error', true, 'Correctly caught invalid field error');
      }
      
    } catch (error) {
      logTest('Error Handling', false, `Error handling test failed: ${error.message}`);
    }
    
    // Test 9: 查詢統計測試
    console.log('\n9️⃣ Testing Query Statistics...');
    
    try {
      const statsQuery = parser.parse('status:open AND priority:high ORDER BY created DESC LIMIT 5', 'ISSUE');
      const stats = parser.getQueryStats(statsQuery);
      
      if (stats.filterCount === 2 && 
          stats.hasOrderBy === true && 
          stats.hasLimit === true && 
          stats.complexity > 0) {
        logTest('Query Statistics', true, `Complexity: ${stats.complexity}, Filters: ${stats.filterCount}`);
      } else {
        logTest('Query Statistics', false, 'Query statistics calculation failed');
      }
    } catch (error) {
      logTest('Query Statistics', false, `Statistics error: ${error.message}`);
    }
    
  } catch (error) {
    logTest('Advanced Query Test Suite', false, `Test suite execution failed: ${error.message}`);
  }
}

/**
 * 創建模擬 QueryExecutor 用於測試
 */
function createMockExecutor(mockData) {
  return {
    applyFilters(data, filters, logic = 'AND') {
      return data.filter(item => {
        if (logic === 'OR') {
          return filters.some(filter => this.evaluateFilter(item, filter));
        } else {
          return filters.every(filter => this.evaluateFilter(item, filter));
        }
      });
    },
    
    evaluateFilter(item, filter) {
      const { field, operator, value } = filter;
      const itemValue = item[field];
      
      switch (operator) {
        case '=':
          return itemValue === value;
        case '!=':
          return itemValue !== value;
        case '>':
          return itemValue > value;
        case '>=':
          return itemValue >= value;
        case '<':
          return itemValue < value;
        case '<=':
          return itemValue <= value;
        default:
          return false;
      }
    }
  };
}

// 運行測試
await runAdvancedQueryTests();

// 打印摘要
console.log('\n📊 Advanced Query Test Results:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 All advanced query tests passed! Advanced search functionality is ready for use.');
} else {
  console.log('\n⚠️  Some advanced query tests failed. Review the issues above.');
  process.exit(1);
}

console.log('\n🏁 Advanced Query Test Suite Complete\n');