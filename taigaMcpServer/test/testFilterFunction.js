/**
 * 测试过滤函数
 */

export function filterCommentsFromHistory(history) {
  if (!Array.isArray(history)) return [];
  
  console.log(`🔍 filterCommentsFromHistory called with ${history.length} entries`);
  
  const result = history.filter(entry => {
    const matchesType = entry.type === 1;
    const hasComment = !!entry.comment;
    const hasNonEmptyComment = entry.comment && entry.comment.trim().length > 0;
    const shouldInclude = matchesType && hasComment && hasNonEmptyComment;
    
    console.log(`   Entry type: ${entry.type}, has comment: ${hasComment}, non-empty: ${hasNonEmptyComment}, include: ${shouldInclude}`);
    
    return shouldInclude;
  });
  
  console.log(`🔍 Filter returning ${result.length} results`);
  return result;
}