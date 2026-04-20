/**
 * 高級查詢語法解析器
 * Advanced Query Parser for Taiga MCP Server
 */

import { 
  OPERATORS, 
  LOGIC_OPERATORS, 
  SORT_DIRECTIONS,
  TIME_KEYWORDS,
  VALIDATION_RULES,
  FIELD_TYPES
} from './queryGrammar.js';

export class QueryParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  /**
   * 解析查詢字符串
   * @param {string} queryString - 查詢字符串
   * @param {string} type - 數據類型 (ISSUE, USER_STORY, TASK)
   * @returns {Object} 解析後的查詢對象
   */
  parse(queryString, type = 'ISSUE') {
    if (!queryString || typeof queryString !== 'string') {
      throw new Error('查詢字符串不能為空');
    }

    this.tokens = this.tokenize(queryString);
    this.position = 0;
    this.dataType = type;

    const query = {
      filters: [],
      logic: 'AND',
      orderBy: null,
      limit: null,
      groupBy: null,
      type: type
    };

    try {
      this.parseExpression(query);
      return query;
    } catch (error) {
      throw new Error(`查詢解析錯誤: ${error.message}`);
    }
  }

  /**
   * 分詞器 - 將查詢字符串分解為標記
   */
  tokenize(queryString) {
    const tokens = [];
    const regex = /([A-Za-z_][A-Za-z0-9_]*):([><=!~]*)([^:\s()]+|\([^)]+\)|"[^"]*")|(\bAND\b|\bOR\b|\bNOT\b|\bORDER\s+BY\b|\bLIMIT\b|\bGROUP\s+BY\b)|([()])|(\S+)/gi;
    
    let match;
    while ((match = regex.exec(queryString)) !== null) {
      if (match[1] && match[3]) {
        // 字段查詢: field:operator:value
        tokens.push({
          type: 'FIELD_QUERY',
          field: match[1].toLowerCase(),
          operator: match[2] || '=',
          value: this.parseValue(match[3])
        });
      } else if (match[4]) {
        // 邏輯操作符或關鍵字
        const keyword = match[4].toUpperCase().replace(/\s+/g, '_');
        if (keyword === 'ORDER_BY') {
          tokens.push({ type: 'ORDER_BY' });
        } else if (keyword === 'GROUP_BY') {
          tokens.push({ type: 'GROUP_BY' });
        } else if (keyword === 'LIMIT') {
          tokens.push({ type: 'LIMIT' });
        } else {
          tokens.push({ type: 'LOGIC', operator: keyword });
        }
      } else if (match[5]) {
        // 括號
        tokens.push({ type: 'PAREN', value: match[5] });
      } else if (match[6]) {
        // 其他標記
        tokens.push({ type: 'VALUE', value: match[6] });
      }
    }

    return tokens;
  }

  /**
   * 解析值並處理特殊格式
   */
  parseValue(valueString) {
    // 移除引號
    if ((valueString.startsWith('"') && valueString.endsWith('"')) ||
        (valueString.startsWith("'") && valueString.endsWith("'"))) {
      return valueString.slice(1, -1);
    }

    // 處理括號內的數組 [item1,item2,item3]
    if (valueString.startsWith('(') && valueString.endsWith(')')) {
      const arrayContent = valueString.slice(1, -1);
      return arrayContent.split(',').map(item => item.trim());
    }

    // 處理範圍查詢 3..8
    if (valueString.includes('..')) {
      const [start, end] = valueString.split('..');
      return { range: [this.parseNumericValue(start), this.parseNumericValue(end)] };
    }

    // 處理數值
    if (!isNaN(valueString)) {
      return this.parseNumericValue(valueString);
    }

    // 處理時間關鍵字
    if (TIME_KEYWORDS[valueString]) {
      return TIME_KEYWORDS[valueString]();
    }

    // 處理相對時間 <7d, >30d
    const timeMatch = valueString.match(/^([<>]=?)(\d+)([dwmy])$/);
    if (timeMatch) {
      const operator = timeMatch[1];
      const value = parseInt(timeMatch[2]);
      const unit = timeMatch[3];
      
      let milliseconds;
      switch (unit) {
        case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
        case 'w': milliseconds = value * 7 * 24 * 60 * 60 * 1000; break;
        case 'm': milliseconds = value * 30 * 24 * 60 * 60 * 1000; break;
        case 'y': milliseconds = value * 365 * 24 * 60 * 60 * 1000; break;
      }
      
      const targetDate = new Date(Date.now() - milliseconds);
      return { relativeTime: operator, date: targetDate };
    }

    return valueString;
  }

  /**
   * 解析數值
   */
  parseNumericValue(value) {
    const num = Number(value);
    return isNaN(num) ? value : num;
  }

  /**
   * 解析表達式
   */
  parseExpression(query) {
    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position];

      switch (token.type) {
        case 'FIELD_QUERY':
          this.parseFieldQuery(query, token);
          break;
        case 'LOGIC':
          this.parseLogicOperator(query, token);
          break;
        case 'ORDER_BY':
          this.parseOrderBy(query);
          break;
        case 'LIMIT':
          this.parseLimit(query);
          break;
        case 'GROUP_BY':
          this.parseGroupBy(query);
          break;
        case 'PAREN':
          this.parseParentheses(query, token);
          break;
        default:
          this.position++;
          break;
      }
    }
  }

  /**
   * 解析字段查詢
   */
  parseFieldQuery(query, token) {
    const { field, operator, value } = token;

    // 驗證字段
    if (!VALIDATION_RULES.isValidField(field, this.dataType)) {
      throw new Error(`無效的字段: ${field}`);
    }

    // 標準化操作符
    let normalizedOperator = this.normalizeOperator(operator);
    
    // 驗證操作符
    if (!VALIDATION_RULES.isValidOperator(normalizedOperator)) {
      throw new Error(`無效的操作符: ${operator}`);
    }

    // 驗證值
    if (!VALIDATION_RULES.isValidValue(field, value, this.dataType)) {
      console.warn(`字段 ${field} 的值可能無效: ${value}`);
    }

    query.filters.push({
      field,
      operator: normalizedOperator,
      value,
      originalOperator: operator
    });

    this.position++;
  }

  /**
   * 標準化操作符
   */
  normalizeOperator(operator) {
    switch (operator) {
      case '':
      case '=':
        return OPERATORS.EQUAL;
      case '!=':
        return OPERATORS.NOT_EQUAL;
      case '>':
        return OPERATORS.GREATER_THAN;
      case '>=':
        return OPERATORS.GREATER_EQUAL;
      case '<':
        return OPERATORS.LESS_THAN;
      case '<=':
        return OPERATORS.LESS_EQUAL;
      case '~':
        return OPERATORS.FUZZY;
      default:
        return operator;
    }
  }

  /**
   * 解析邏輯操作符
   */
  parseLogicOperator(query, token) {
    if (token.operator === 'AND' || token.operator === 'OR') {
      query.logic = token.operator;
    }
    this.position++;
  }

  /**
   * 解析排序子句
   */
  parseOrderBy(query) {
    this.position++; // 跳過 ORDER BY
    
    if (this.position < this.tokens.length) {
      const fieldToken = this.tokens[this.position];
      const field = fieldToken.value || fieldToken.field;
      
      let direction = SORT_DIRECTIONS.ASC;
      if (this.position + 1 < this.tokens.length) {
        const directionToken = this.tokens[this.position + 1];
        if (directionToken.value && 
            (directionToken.value.toUpperCase() === 'DESC' || 
             directionToken.value.toUpperCase() === 'ASC')) {
          direction = directionToken.value.toUpperCase();
          this.position++;
        }
      }

      query.orderBy = { field, direction };
      this.position++;
    }
  }

  /**
   * 解析限制子句
   */
  parseLimit(query) {
    this.position++; // 跳過 LIMIT
    
    if (this.position < this.tokens.length) {
      const limitToken = this.tokens[this.position];
      const limit = parseInt(limitToken.value);
      
      if (!isNaN(limit) && limit > 0) {
        query.limit = limit;
      }
      
      this.position++;
    }
  }

  /**
   * 解析分組子句
   */
  parseGroupBy(query) {
    this.position++; // 跳過 GROUP BY
    
    if (this.position < this.tokens.length) {
      const fieldToken = this.tokens[this.position];
      query.groupBy = fieldToken.value || fieldToken.field;
      this.position++;
    }
  }

  /**
   * 解析括號（用於邏輯分組）
   */
  parseParentheses(query, token) {
    // 簡化處理，暫時跳過括號
    // 完整實現需要處理嵌套邏輯表達式
    this.position++;
  }

  /**
   * 驗證查詢對象
   */
  validateQuery(query) {
    if (!query.filters || query.filters.length === 0) {
      throw new Error('查詢必須至少包含一個過濾條件');
    }

    // 驗證每個過濾條件
    for (const filter of query.filters) {
      if (!filter.field || !filter.operator) {
        throw new Error('過濾條件必須包含字段和操作符');
      }
    }

    return true;
  }

  /**
   * 獲取查詢統計信息
   */
  getQueryStats(query) {
    return {
      filterCount: query.filters.length,
      hasOrderBy: !!query.orderBy,
      hasLimit: !!query.limit,
      hasGroupBy: !!query.groupBy,
      complexity: this.calculateComplexity(query)
    };
  }

  /**
   * 計算查詢複雜度
   */
  calculateComplexity(query) {
    let complexity = query.filters.length;
    
    if (query.orderBy) complexity += 1;
    if (query.limit) complexity += 0.5;
    if (query.groupBy) complexity += 2;
    
    return Math.round(complexity * 10) / 10;
  }
}

export default QueryParser;