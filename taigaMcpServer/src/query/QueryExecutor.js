/**
 * 查詢執行器
 * Query Executor for Advanced Search
 */

import { OPERATORS, TIME_KEYWORDS } from './queryGrammar.js';

export class QueryExecutor {
  constructor(taigaService) {
    this.taigaService = taigaService;
  }

  /**
   * 執行查詢
   * @param {Object} query - 解析後的查詢對象
   * @param {string} projectId - 項目ID
   * @returns {Array} 過濾後的結果
   */
  async execute(query, projectId) {
    try {
      // 根據查詢類型獲取數據
      let data = await this.fetchData(query.type, projectId);
      
      // 應用過濾器
      if (query.filters && query.filters.length > 0) {
        data = this.applyFilters(data, query.filters, query.logic);
      }
      
      // 應用排序
      if (query.orderBy) {
        data = this.applySorting(data, query.orderBy);
      }
      
      // 應用分組
      if (query.groupBy) {
        data = this.applyGrouping(data, query.groupBy);
      }
      
      // 應用限制
      if (query.limit) {
        data = data.slice(0, query.limit);
      }
      
      return {
        results: data,
        total: data.length,
        query: query,
        executionTime: Date.now()
      };
      
    } catch (error) {
      throw new Error(`查詢執行失敗: ${error.message}`);
    }
  }

  /**
   * 根據類型獲取數據
   */
  async fetchData(type, projectId) {
    switch (type) {
      case 'ISSUE':
        return await this.taigaService.listIssues(projectId);
      case 'USER_STORY':
        return await this.taigaService.listUserStories(projectId);
      case 'TASK':
        // 獲取所有任務（需要遍歷用戶故事）
        return await this.fetchAllTasks(projectId);
      default:
        throw new Error(`不支持的數據類型: ${type}`);
    }
  }

  /**
   * 獲取所有任務
   */
  async fetchAllTasks(projectId) {
    const userStories = await this.taigaService.listUserStories(projectId);
    const allTasks = [];
    
    for (const story of userStories) {
      try {
        const tasks = await this.taigaService.listTasks(story.id);
        allTasks.push(...tasks);
      } catch (error) {
        console.warn(`無法獲取用戶故事 ${story.id} 的任務:`, error.message);
      }
    }
    
    return allTasks;
  }

  /**
   * 應用過濾器
   */
  applyFilters(data, filters, logic = 'AND') {
    return data.filter(item => {
      if (logic === 'OR') {
        return filters.some(filter => this.evaluateFilter(item, filter));
      } else {
        return filters.every(filter => this.evaluateFilter(item, filter));
      }
    });
  }

  /**
   * 評估單個過濾條件
   */
  evaluateFilter(item, filter) {
    const { field, operator, value } = filter;
    const itemValue = this.getFieldValue(item, field);

    switch (operator) {
      case OPERATORS.EQUAL:
        return this.compareEqual(itemValue, value);
      
      case OPERATORS.NOT_EQUAL:
        return !this.compareEqual(itemValue, value);
      
      case OPERATORS.GREATER_THAN:
        return this.compareGreater(itemValue, value, false);
      
      case OPERATORS.GREATER_EQUAL:
        return this.compareGreater(itemValue, value, true);
      
      case OPERATORS.LESS_THAN:
        return this.compareLess(itemValue, value, false);
      
      case OPERATORS.LESS_EQUAL:
        return this.compareLess(itemValue, value, true);
      
      case OPERATORS.CONTAINS:
        return this.compareContains(itemValue, value);
      
      case OPERATORS.STARTS_WITH:
        return this.compareStartsWith(itemValue, value);
      
      case OPERATORS.ENDS_WITH:
        return this.compareEndsWith(itemValue, value);
      
      case OPERATORS.FUZZY:
        return this.compareFuzzy(itemValue, value);
      
      case OPERATORS.IN:
        return this.compareIn(itemValue, value);
      
      case OPERATORS.NOT_IN:
        return !this.compareIn(itemValue, value);
      
      case OPERATORS.EXISTS:
        return itemValue !== null && itemValue !== undefined;
      
      case OPERATORS.NULL:
        return itemValue === null || itemValue === undefined;
      
      case OPERATORS.EMPTY:
        return this.isEmpty(itemValue);
      
      default:
        console.warn(`不支持的操作符: ${operator}`);
        return true;
    }
  }

  /**
   * 獲取字段值
   */
  getFieldValue(item, field) {
    // 處理嵌套字段訪問
    const fieldPath = field.split('.');
    let value = item;
    
    for (const path of fieldPath) {
      if (value && typeof value === 'object') {
        value = value[path];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * 相等比較
   */
  compareEqual(itemValue, queryValue) {
    if (itemValue === null || itemValue === undefined) {
      return queryValue === null || queryValue === 'null';
    }
    
    // 字符串比較（不區分大小寫）
    if (typeof itemValue === 'string' && typeof queryValue === 'string') {
      return itemValue.toLowerCase() === queryValue.toLowerCase();
    }
    
    return itemValue === queryValue;
  }

  /**
   * 大於比較
   */
  compareGreater(itemValue, queryValue, orEqual = false) {
    const numericItem = this.toNumeric(itemValue);
    const numericQuery = this.toNumeric(queryValue);
    
    if (numericItem !== null && numericQuery !== null) {
      return orEqual ? numericItem >= numericQuery : numericItem > numericQuery;
    }
    
    // 日期比較
    const dateItem = this.toDate(itemValue);
    const dateQuery = this.toDate(queryValue);
    
    if (dateItem && dateQuery) {
      return orEqual ? dateItem >= dateQuery : dateItem > dateQuery;
    }
    
    // 字符串比較
    return orEqual ? itemValue >= queryValue : itemValue > queryValue;
  }

  /**
   * 小於比較
   */
  compareLess(itemValue, queryValue, orEqual = false) {
    const numericItem = this.toNumeric(itemValue);
    const numericQuery = this.toNumeric(queryValue);
    
    if (numericItem !== null && numericQuery !== null) {
      return orEqual ? numericItem <= numericQuery : numericItem < numericQuery;
    }
    
    // 日期比較
    const dateItem = this.toDate(itemValue);
    const dateQuery = this.toDate(queryValue);
    
    if (dateItem && dateQuery) {
      return orEqual ? dateItem <= dateQuery : dateItem < dateQuery;
    }
    
    // 字符串比較
    return orEqual ? itemValue <= queryValue : itemValue < queryValue;
  }

  /**
   * 包含比較
   */
  compareContains(itemValue, queryValue) {
    if (!itemValue || !queryValue) return false;
    
    const itemStr = String(itemValue).toLowerCase();
    const queryStr = String(queryValue).toLowerCase();
    
    return itemStr.includes(queryStr);
  }

  /**
   * 開頭匹配
   */
  compareStartsWith(itemValue, queryValue) {
    if (!itemValue || !queryValue) return false;
    
    const itemStr = String(itemValue).toLowerCase();
    const queryStr = String(queryValue).toLowerCase();
    
    return itemStr.startsWith(queryStr);
  }

  /**
   * 結尾匹配
   */
  compareEndsWith(itemValue, queryValue) {
    if (!itemValue || !queryValue) return false;
    
    const itemStr = String(itemValue).toLowerCase();
    const queryStr = String(queryValue).toLowerCase();
    
    return itemStr.endsWith(queryStr);
  }

  /**
   * 模糊匹配
   */
  compareFuzzy(itemValue, queryValue) {
    if (!itemValue || !queryValue) return false;
    
    const itemStr = String(itemValue).toLowerCase();
    const queryStr = String(queryValue).toLowerCase();
    
    // 簡單的模糊匹配實現
    const words = queryStr.split(/\s+/);
    return words.every(word => itemStr.includes(word));
  }

  /**
   * 包含於數組
   */
  compareIn(itemValue, queryValue) {
    if (!Array.isArray(queryValue)) return false;
    
    if (Array.isArray(itemValue)) {
      return itemValue.some(item => queryValue.includes(item));
    }
    
    return queryValue.includes(itemValue);
  }

  /**
   * 檢查是否為空
   */
  isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }

  /**
   * 轉換為數值
   */
  toNumeric(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = Number(value);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  /**
   * 轉換為日期
   */
  toDate(value) {
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'number') {
      return new Date(value);
    }
    return null;
  }

  /**
   * 應用排序
   */
  applySorting(data, orderBy) {
    const { field, direction } = orderBy;
    
    return data.sort((a, b) => {
      const valueA = this.getFieldValue(a, field);
      const valueB = this.getFieldValue(b, field);
      
      let comparison = 0;
      
      // 處理 null/undefined 值
      if (valueA === null || valueA === undefined) {
        comparison = valueB === null || valueB === undefined ? 0 : -1;
      } else if (valueB === null || valueB === undefined) {
        comparison = 1;
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        comparison = valueA - valueB;
      } else {
        comparison = String(valueA).localeCompare(String(valueB));
      }
      
      return direction === 'DESC' ? -comparison : comparison;
    });
  }

  /**
   * 應用分組
   */
  applyGrouping(data, groupByField) {
    const grouped = {};
    
    data.forEach(item => {
      const groupValue = this.getFieldValue(item, groupByField) || 'undefined';
      const groupKey = String(groupValue);
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      
      grouped[groupKey].push(item);
    });
    
    // 轉換為數組格式，包含統計信息
    return Object.entries(grouped).map(([key, items]) => ({
      groupValue: key,
      count: items.length,
      items: items
    }));
  }

  /**
   * 獲取查詢執行統計
   */
  getExecutionStats(startTime, endTime, originalCount, filteredCount) {
    return {
      executionTime: endTime - startTime,
      originalCount,
      filteredCount,
      reductionPercentage: Math.round((1 - filteredCount / originalCount) * 100)
    };
  }
}

export default QueryExecutor;