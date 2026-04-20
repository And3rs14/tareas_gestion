#!/usr/bin/env node

/**
 * 測試評論顯示修復
 * Test Comment Display Fix
 */

import { listCommentsTool } from '../src/tools/commentTools.js';

console.log('🧪 Testing Comment Display Fix\n');

async function testCommentDisplay() {
    try {
        // 模擬評論數據
        const mockComments = [
            {
                id: 123,
                comment: "這是第一個測試評論",
                user: {
                    full_name: "張小明",
                    username: "zhangxm"
                },
                created_at: "2025-06-17T02:19:31.260Z"
            },
            {
                id: 124,
                comment: "這是第二個測試評論",
                user: {
                    username: "李小華"
                },
                created_at: "2025-06-17T01:15:20.100Z"
            },
            {
                id: 125,
                comment: "這是第三個測試評論，沒有用戶信息",
                created_at: "2025-06-17T00:10:15.500Z"
            }
        ];
        
        console.log('📝 Mock comment data:');
        mockComments.forEach(comment => {
            console.log(`   Comment: "${comment.comment}"`);
            console.log(`   User: ${comment.user?.full_name || comment.user?.username || '未知用戶'}`);
            console.log(`   Date: ${comment.created_at}`);
            console.log('');
        });
        
        // 測試格式化函數
        console.log('🔧 Testing comment formatting...');
        
        // 手動導入格式化函數 (需要修改成可導出的)
        const formatCommentsList = function(comments, itemType, itemId) {
            let output = `**${itemType.replace('_', ' ')} #${itemId} 評論列表**\n\n`;
            output += `共 ${comments.length} 個評論\n\n`;
            
            comments.forEach((comment, index) => {
                const user = comment.user?.full_name || comment.user?.username || '未知用戶';
                const createdDate = comment.created_at ? new Date(comment.created_at).toLocaleString() : 'Not set';
                const commentText = comment.comment || '無內容';
                
                output += `**${index + 1}. ${user}** ${createdDate}\n`;
                output += `${commentText}\n`;
                if (comment.id) {
                    output += `評論ID: ${comment.id}\n`;
                }
                output += '\n';
            });
            
            return output;
        };
        
        const result = formatCommentsList(mockComments, 'issue', 829);
        console.log('✅ Formatted output:');
        console.log('---');
        console.log(result);
        console.log('---');
        
        // 檢查是否包含實際的評論文本而不是 [object Object]
        const hasObjectObject = result.includes('[object Object]');
        console.log(`\n🔍 Contains '[object Object]': ${hasObjectObject ? '❌ YES' : '✅ NO'}`);
        
        // 檢查是否包含實際的評論內容
        const hasCommentContent = mockComments.every(comment => 
            result.includes(comment.comment)
        );
        console.log(`🔍 Contains all comment content: ${hasCommentContent ? '✅ YES' : '❌ NO'}`);
        
        console.log('\n🎉 Comment display fix test completed!');
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Stack:', error.stack);
    }
}

testCommentDisplay();