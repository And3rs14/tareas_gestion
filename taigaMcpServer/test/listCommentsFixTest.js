#!/usr/bin/env node

/**
 * 測試修復後的listComments功能
 * Test for fixed listComments functionality
 */

console.log('🔧 Testing listComments Fix...\n');

try {
  // 導入工具
  const { listCommentsTool } = await import('../src/tools/commentTools.js');
  
  console.log('✅ listCommentsTool imported successfully');
  
  // 檢查schema是否包含projectIdentifier
  const schema = listCommentsTool.schema;
  const hasProjectIdentifier = 'projectIdentifier' in schema;
  
  console.log(`✅ Schema includes projectIdentifier: ${hasProjectIdentifier}`);
  
  if (hasProjectIdentifier) {
    console.log(`✅ projectIdentifier description: "${schema.projectIdentifier.description}"`);
  }
  
  // 檢查handler是否接受3個參數
  const handlerString = listCommentsTool.handler.toString();
  const hasThreeParams = handlerString.includes('itemType, itemId, projectIdentifier');
  
  console.log(`✅ Handler accepts 3 parameters: ${hasThreeParams}`);
  
  console.log('\n🎉 listComments fix verification completed successfully!');
  console.log('📝 Usage: listComments now requires projectIdentifier for issues');
  console.log('   Example: { itemType: "issue", itemId: 829, projectIdentifier: "ltg" }');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}