/**
 * 高級搜索MCP工具
 * Advanced Search MCP Tools for Taiga
 */

import { z } from 'zod';
import { TaigaService } from '../taigaService.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants.js';
import { 
  resolveProjectId,
  createErrorResponse,
  createSuccessResponse,
  formatDateTime,
  getSafeValue
} from '../utils.js';

import { QueryParser } from '../query/QueryParser.js';
import { QueryExecutor } from '../query/QueryExecutor.js';
import { QUERY_EXAMPLES } from '../query/queryGrammar.js';

const taigaService = new TaigaService();

/**
 * 高級搜索工具
 */
export const advancedSearchTool = {
  name: 'advancedSearch',
  schema: {
    projectIdentifier: z.string().describe('Project ID, slug, or name'),
    query: z.string().describe('Advanced search query using special syntax'),
    type: z.enum(['issues', 'user_stories', 'tasks']).optional().default('issues').describe('Type of items to search')
  },
  handler: async ({ projectIdentifier, query, type = 'issues' }) => {
    try {
      const projectId = await resolveProjectId(projectIdentifier);
      const parser = new QueryParser();
      const executor = new QueryExecutor(taigaService);
      
      // 映射類型
      const dataType = type === 'issues' ? 'ISSUE' : 
                       type === 'user_stories' ? 'USER_STORY' : 'TASK';
      
      // 解析查詢
      const parsedQuery = parser.parse(query, dataType);
      
      // 執行查詢
      const startTime = Date.now();
      const result = await executor.execute(parsedQuery, projectId);
      const endTime = Date.now();
      
      // 格式化結果
      const formattedResults = formatAdvancedSearchResults(
        result.results, 
        type, 
        query, 
        endTime - startTime
      );
      
      return createSuccessResponse(formattedResults);
      
    } catch (error) {
      if (error.message.includes('查詢解析錯誤') || error.message.includes('查詢執行失敗')) {
        return createErrorResponse(`${error.message}\n\n💡 查詢語法示例:\n${getQueryExamples()}`);
      }
      return createErrorResponse(`${ERROR_MESSAGES.FAILED_TO_LIST_ISSUES}: ${error.message}`);
    }
  }
};

/**
 * 查詢語法幫助工具
 */
export const queryHelpTool = {
  name: 'queryHelp',
  schema: {
    topic: z.enum(['syntax', 'operators', 'examples', 'fields']).optional().describe('Help topic to show')
  },
  handler: async ({ topic }) => {
    try {
      let helpContent = '';
      
      switch (topic) {
        case 'syntax':
          helpContent = getQuerySyntaxHelp();
          break;
        case 'operators':
          helpContent = getOperatorsHelp();
          break;
        case 'examples':
          helpContent = getQueryExamplesHelp();
          break;
        case 'fields':
          helpContent = getFieldsHelp();
          break;
        default:
          helpContent = getGeneralHelp();
          break;
      }
      
      return createSuccessResponse(helpContent);
      
    } catch (error) {
      return createErrorResponse(`無法獲取幫助信息: ${error.message}`);
    }
  }
};

/**
 * 查詢語法驗證工具
 */
export const validateQueryTool = {
  name: 'validateQuery',
  schema: {
    query: z.string().describe('Query string to validate'),
    type: z.enum(['issues', 'user_stories', 'tasks']).optional().default('issues').describe('Type of items to validate against')
  },
  handler: async ({ query, type = 'issues' }) => {
    try {
      const parser = new QueryParser();
      const dataType = type === 'issues' ? 'ISSUE' : 
                       type === 'user_stories' ? 'USER_STORY' : 'TASK';
      
      // 解析查詢（這會驗證語法）
      const parsedQuery = parser.parse(query, dataType);
      const stats = parser.getQueryStats(parsedQuery);
      
      const validationResult = `
✅ **查詢語法驗證通過**

🔍 **解析結果:**
- 過濾條件數量: ${stats.filterCount}
- 邏輯操作符: ${parsedQuery.logic}
- 排序: ${stats.hasOrderBy ? `${parsedQuery.orderBy.field} ${parsedQuery.orderBy.direction}` : '無'}
- 限制: ${stats.hasLimit ? parsedQuery.limit : '無'}
- 分組: ${stats.hasGroupBy ? parsedQuery.groupBy : '無'}
- 複雜度: ${stats.complexity}

📋 **過濾條件詳情:**
${parsedQuery.filters.map((filter, index) => 
  `${index + 1}. ${filter.field} ${filter.operator} ${JSON.stringify(filter.value)}`
).join('\n')}

🎯 **查詢類型:** ${type}
`;
      
      return createSuccessResponse(validationResult);
      
    } catch (error) {
      return createErrorResponse(`❌ **查詢語法驗證失敗**\n\n${error.message}\n\n💡 使用 queryHelp 獲取語法幫助`);
    }
  }
};

/**
 * 格式化高級搜索結果
 */
function formatAdvancedSearchResults(results, type, query, executionTime) {
  if (!results || results.length === 0) {
    return `🔍 **高級搜索結果**\n\n查詢: \`${query}\`\n類型: ${type}\n\n❌ 沒有找到匹配的結果`;
  }
  
  let output = `🔍 **高級搜索結果**\n\n`;
  output += `📊 查詢: \`${query}\`\n`;
  output += `📋 類型: ${type}\n`;
  output += `⚡ 執行時間: ${executionTime}ms\n`;
  output += `🎯 找到 ${results.length} 個結果\n\n`;
  
  // 根據類型格式化結果
  results.forEach((item, index) => {
    output += formatSearchItem(item, type, index + 1);
    output += '\n';
  });
  
  // 如果結果太多，提示使用限制
  if (results.length > 20) {
    output += `\n💡 提示: 結果較多，建議使用 LIMIT 子句限制結果數量，例如: \`${query} LIMIT 10\``;
  }
  
  return output;
}

/**
 * 格式化單個搜索結果項
 */
function formatSearchItem(item, type, index) {
  const ref = getSafeValue(item, 'ref', index);
  const subject = getSafeValue(item, 'subject', '無標題');
  const status = getSafeValue(item, 'status_extra_info.name', item.status || '未知');
  const created = formatDateTime(item.created_date);
  
  let output = `**${index}. #${ref}: ${subject}**\n`;
  output += `   📊 狀態: ${status}\n`;
  
  if (type === 'issues') {
    const priority = getSafeValue(item, 'priority_extra_info.name', item.priority || '普通');
    const type_name = getSafeValue(item, 'type_extra_info.name', item.type || '問題');
    const assignee = getSafeValue(item, 'assigned_to_extra_info.full_name', '未分配');
    
    output += `   🎯 類型: ${type_name} | 優先級: ${priority}\n`;
    output += `   👤 指派: ${assignee}\n`;
  } else if (type === 'user_stories') {
    const points = getSafeValue(item, 'total_points', 0);
    const assignee = getSafeValue(item, 'assigned_to_extra_info.full_name', '未分配');
    
    output += `   ⭐ 點數: ${points} | 👤 指派: ${assignee}\n`;
  } else if (type === 'tasks') {
    const assignee = getSafeValue(item, 'assigned_to_extra_info.full_name', '未分配');
    const userStory = getSafeValue(item, 'user_story_extra_info.subject', '無關聯故事');
    
    output += `   👤 指派: ${assignee}\n`;
    output += `   📋 用戶故事: ${userStory}\n`;
  }
  
  output += `   📅 創建: ${created}`;
  
  return output;
}

/**
 * 獲取查詢示例
 */
function getQueryExamples() {
  return `
基礎查詢:
- status:open
- priority:high  
- assignee:john

比較查詢:
- points:>=5
- created:>2024-01-01
- updated:<7d

文本搜索:
- subject:contains:"登入"
- description:*API*
- tags:frontend

邏輯組合:
- status:open AND priority:high
- type:bug OR type:feature
- NOT status:closed
`;
}

/**
 * 獲取查詢語法幫助
 */
function getQuerySyntaxHelp() {
  return `
🔍 **高級查詢語法指南**

## 基本語法
\`field:value\` - 字段等於值
\`field:operator:value\` - 字段操作符值

## 操作符
- \`=\` 等於 (預設)
- \`!=\` 不等於  
- \`>\`, \`>=\` 大於, 大於等於
- \`<\`, \`<=\` 小於, 小於等於
- \`contains\` 包含文本
- \`~\` 模糊匹配

## 邏輯操作符
- \`AND\` 且條件
- \`OR\` 或條件  
- \`NOT\` 非條件

## 排序和限制
- \`ORDER BY field ASC/DESC\` 排序
- \`LIMIT number\` 限制結果數量

## 時間關鍵字
- \`today\`, \`yesterday\`
- \`this_week\`, \`last_month\`
- \`7d\`, \`30d\` (相對時間)
`;
}

/**
 * 獲取操作符幫助
 */
function getOperatorsHelp() {
  return `
⚙️ **查詢操作符詳解**

## 比較操作符
- \`field:value\` - 等於
- \`field:!=value\` - 不等於
- \`field:>value\` - 大於
- \`field:>=value\` - 大於等於
- \`field:<value\` - 小於
- \`field:<=value\` - 小於等於

## 文本操作符
- \`field:contains:"text"\` - 包含文本
- \`field:~"text"\` - 模糊匹配
- \`field:*text*\` - 通配符匹配

## 特殊操作符
- \`field:null\` - 字段為空
- \`field:exists\` - 字段存在
- \`field:empty\` - 字段為空值

## 範圍查詢
- \`points:3..8\` - 點數在3到8之間
- \`created:2024-01-01..2024-12-31\` - 日期範圍
`;
}

/**
 * 獲取查詢示例幫助
 */
function getQueryExamplesHelp() {
  return `
📚 **查詢示例大全**

## 問題(Issues)查詢
\`\`\`
status:open AND priority:high
type:bug AND assignee:john
created:>7d AND NOT status:closed
priority:urgent OR severity:critical
\`\`\`

## 用戶故事查詢  
\`\`\`
points:>=5 AND status:in-progress
assignee:team-lead AND points:3..8
milestone:"Sprint 3" AND status:!=done
\`\`\`

## 任務查詢
\`\`\`
assignee:developer AND status:open
user_story:contains:"API" ORDER BY created DESC
status:in-progress LIMIT 5
\`\`\`

## 複雜查詢
\`\`\`
(status:open OR status:in-progress) AND priority:high AND updated:this_week
assignee:john AND (type:bug OR priority:urgent) ORDER BY created ASC LIMIT 10
\`\`\`
`;
}

/**
 * 獲取字段幫助  
 */
function getFieldsHelp() {
  return `
📋 **可查詢字段列表**

## Issues 字段
- \`subject\` - 標題
- \`description\` - 描述
- \`status\` - 狀態
- \`priority\` - 優先級
- \`type\` - 類型
- \`assignee\` - 指派人
- \`tags\` - 標籤
- \`created\` - 創建時間
- \`updated\` - 更新時間

## User Stories 字段
- \`subject\` - 標題  
- \`status\` - 狀態
- \`points\` - 故事點數
- \`assignee\` - 指派人
- \`milestone\` - 里程碑
- \`tags\` - 標籤

## Tasks 字段
- \`subject\` - 標題
- \`status\` - 狀態
- \`assignee\` - 指派人
- \`user_story\` - 關聯用戶故事
- \`tags\` - 標籤
`;
}

/**
 * 獲取通用幫助
 */
function getGeneralHelp() {
  return `
🎯 **高級查詢功能概述**

歡迎使用Taiga MCP Server的高級查詢功能！這個強大的搜索引擎讓您能夠用類似SQL的語法精確查找項目數據。

## 🚀 主要功能
- **精確過濾**: 使用多種操作符精確篩選數據
- **邏輯組合**: 使用AND/OR/NOT組合複雜條件  
- **文本搜索**: 模糊匹配和通配符搜索
- **排序限制**: 自定義排序和結果數量限制
- **時間查詢**: 靈活的日期和時間範圍查詢

## 🔧 可用工具
- \`advancedSearch\` - 執行高級查詢
- \`queryHelp\` - 獲取語法幫助
- \`validateQuery\` - 驗證查詢語法

## 💡 快速開始
1. 使用 \`queryHelp syntax\` 學習基本語法
2. 使用 \`queryHelp examples\` 查看示例
3. 使用 \`validateQuery\` 驗證您的查詢
4. 使用 \`advancedSearch\` 執行搜索

開始您的高級查詢之旅吧！🔍
`;
}

/**
 * 註冊高級搜索工具
 */
export function registerAdvancedSearchTools(server) {
  server.tool(advancedSearchTool.name, advancedSearchTool.schema, advancedSearchTool.handler);
  server.tool(queryHelpTool.name, queryHelpTool.schema, queryHelpTool.handler);
  server.tool(validateQueryTool.name, validateQueryTool.schema, validateQueryTool.handler);
}