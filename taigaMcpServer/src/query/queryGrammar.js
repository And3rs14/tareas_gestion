/**
 * 高級查詢語法規範和操作符定義
 * Advanced Query Grammar and Operators for Taiga MCP Server
 */

// 支持的字段類型
export const FIELD_TYPES = {
  // Issue 字段
  ISSUE: {
    subject: 'string',      // 標題
    description: 'string',  // 描述
    status: 'enum',        // 狀態
    priority: 'enum',      // 優先級
    type: 'enum',          // 類型
    severity: 'enum',      // 嚴重性
    assignee: 'string',    // 指派人
    reporter: 'string',    // 回報人
    tags: 'array',         // 標籤
    created: 'date',       // 創建時間
    updated: 'date',       // 更新時間
    closed: 'date',        // 關閉時間
    due_date: 'date',      // 到期時間
    ref: 'number',         // 引用編號
    milestone: 'string'    // 里程碑/Sprint
  },
  
  // User Story 字段
  USER_STORY: {
    subject: 'string',
    description: 'string', 
    status: 'enum',
    points: 'number',      // 故事點數
    assignee: 'string',
    owner: 'string',       // 所有者
    tags: 'array',
    created: 'date',
    updated: 'date',
    ref: 'number',
    milestone: 'string'
  },
  
  // Task 字段
  TASK: {
    subject: 'string',
    description: 'string',
    status: 'enum', 
    assignee: 'string',
    user_story: 'string',  // 關聯的用戶故事
    tags: 'array',
    created: 'date',
    updated: 'date',
    ref: 'number'
  }
};

// 比較操作符
export const OPERATORS = {
  // 相等比較
  EQUAL: '=',
  NOT_EQUAL: '!=',
  
  // 數值比較
  GREATER_THAN: '>',
  GREATER_EQUAL: '>=', 
  LESS_THAN: '<',
  LESS_EQUAL: '<=',
  
  // 範圍查詢
  RANGE: '..',           // 例如: points:3..8
  
  // 字符串匹配
  CONTAINS: 'contains',  // description:contains:"API"
  STARTS_WITH: 'starts', // subject:starts:"修復"
  ENDS_WITH: 'ends',     // subject:ends:"Bug"
  FUZZY: '~',           // subject:~"登入"
  WILDCARD: '*',        // subject:*登入*
  
  // 數組操作
  IN: 'in',             // tags:in:[frontend,backend]
  NOT_IN: 'not_in',     // tags:not_in:[deprecated]
  
  // 存在性檢查
  EXISTS: 'exists',     // assignee:exists
  NULL: 'null',         // assignee:null
  EMPTY: 'empty'        // tags:empty
};

// 邏輯操作符
export const LOGIC_OPERATORS = {
  AND: 'AND',
  OR: 'OR', 
  NOT: 'NOT'
};

// 排序方向
export const SORT_DIRECTIONS = {
  ASC: 'ASC',
  DESC: 'DESC'
};

// 預定義的時間關鍵字
export const TIME_KEYWORDS = {
  // 相對時間
  today: () => new Date(),
  yesterday: () => new Date(Date.now() - 24 * 60 * 60 * 1000),
  this_week: () => getThisWeekStart(),
  last_week: () => getLastWeekStart(),
  this_month: () => getThisMonthStart(),
  last_month: () => getLastMonthStart(),
  
  // 相對時間範圍
  '1d': () => new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  '3d': () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  '7d': () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  '30d': () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  '90d': () => new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
};

// 狀態枚舉值 (根據 Taiga 實際狀態)
export const STATUS_VALUES = {
  ISSUE: ['new', 'in-progress', 'ready-for-test', 'closed', 'needs-info', 'rejected'],
  USER_STORY: ['new', 'in-progress', 'ready-for-test', 'done'],
  TASK: ['new', 'in-progress', 'ready-for-test', 'closed']
};

// 優先級枚舉值
export const PRIORITY_VALUES = ['low', 'normal', 'high', 'urgent'];

// 類型枚舉值
export const TYPE_VALUES = ['bug', 'feature', 'enhancement', 'task', 'story'];

// 嚴重性枚舉值  
export const SEVERITY_VALUES = ['minor', 'normal', 'important', 'critical'];

// 查詢語法範例
export const QUERY_EXAMPLES = {
  basic: [
    'status:open',
    'priority:high', 
    'assignee:john',
    'type:bug'
  ],
  
  comparison: [
    'points:>=5',
    'created:>2024-01-01',
    'updated:<7d',
    'ref:>100'
  ],
  
  text_search: [
    'subject:contains:"登入"',
    'description:*API*',
    'subject:~"bug"',
    'tags:frontend'
  ],
  
  logical: [
    'status:open AND priority:high',
    'type:bug OR type:feature', 
    'NOT status:closed',
    '(status:open OR status:in-progress) AND assignee:john'
  ],
  
  advanced: [
    'status:open AND priority:high AND created:>7d',
    'assignee:john AND (type:bug OR priority:urgent)',
    'tags:frontend AND points:3..8 AND status:!=done',
    'milestone:"Sprint 3" AND updated:this_week'
  ],
  
  sorting: [
    'status:open ORDER BY priority DESC',
    'assignee:john ORDER BY created ASC',
    'type:bug ORDER BY updated DESC LIMIT 10'
  ]
};

// 輔助函數
function getThisWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 週一開始
  return new Date(now.setDate(diff));
}

function getLastWeekStart() {
  const thisWeek = getThisWeekStart();
  return new Date(thisWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
}

function getThisMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getLastMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

// 語法驗證規則
export const VALIDATION_RULES = {
  // 字段名驗證
  isValidField: (field, type) => {
    return FIELD_TYPES[type] && Object.keys(FIELD_TYPES[type]).includes(field);
  },
  
  // 操作符驗證
  isValidOperator: (operator) => {
    return Object.values(OPERATORS).includes(operator);
  },
  
  // 值類型驗證
  isValidValue: (field, value, type) => {
    const fieldType = FIELD_TYPES[type][field];
    
    switch (fieldType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return !isNaN(Number(value));
      case 'date':
        return !isNaN(Date.parse(value)) || TIME_KEYWORDS[value];
      case 'enum':
        // 根據字段檢查枚舉值
        if (field === 'status') return STATUS_VALUES[type].includes(value);
        if (field === 'priority') return PRIORITY_VALUES.includes(value);
        if (field === 'type') return TYPE_VALUES.includes(value);
        if (field === 'severity') return SEVERITY_VALUES.includes(value);
        return true;
      case 'array':
        return true; // 標籤可以是任意字符串
      default:
        return true;
    }
  }
};

export default {
  FIELD_TYPES,
  OPERATORS,
  LOGIC_OPERATORS,
  SORT_DIRECTIONS,
  TIME_KEYWORDS,
  STATUS_VALUES,
  PRIORITY_VALUES,
  TYPE_VALUES,
  SEVERITY_VALUES,
  QUERY_EXAMPLES,
  VALIDATION_RULES
};