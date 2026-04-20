/**
 * 评论历史记录测试
 * Comment History Test
 */

import { TaigaService } from '../src/taigaService.js';

console.log('📚 Comment History Test - Checking how comments appear in history\n');

const taigaService = new TaigaService();

async function testCommentHistory() {
    try {
        // 获取项目和issue
        const projects = await taigaService.listProjects();
        const testProject = projects[0];
        const issues = await taigaService.listIssues(testProject.id);
        const testIssue = issues[0];
        
        console.log(`🐛 Testing with issue: ${testIssue.subject} (ID: ${testIssue.id})`);
        
        // 获取历史记录
        console.log('\n📚 Getting full history...');
        const history = await taigaService.getItemHistory('issue', testIssue.id);
        
        console.log(`📊 Total history entries: ${history.length}`);
        
        // 详细分析历史记录
        history.forEach((entry, index) => {
            console.log(`\n📝 Entry ${index + 1}:`);
            console.log(`   Type: ${entry.type}`);
            console.log(`   User: ${entry.user?.full_name || entry.user?.username || 'Unknown'}`);
            console.log(`   Date: ${entry.created_at}`);
            
            if (entry.comment) {
                console.log(`   Comment: "${entry.comment}"`);
            }
            
            if (entry.diff) {
                console.log(`   Changes: ${JSON.stringify(entry.diff, null, 4)}`);
            }
            
            if (entry.values_diff) {
                console.log(`   Values diff: ${JSON.stringify(entry.values_diff, null, 4)}`);
            }
        });
        
        // 测试添加一个新评论并查看结果
        console.log('\n➕ Adding a new test comment...');
        const testComment = {
            comment: `History test comment - ${new Date().toISOString()}`
        };
        
        const result = await taigaService.addComment('issue', testIssue.id, testComment);
        console.log(`✅ Comment added, version increased to: ${result.version}`);
        
        // 再次获取历史记录  
        console.log('\n📚 Getting updated history...');
        const updatedHistory = await taigaService.getItemHistory('issue', testIssue.id);
        
        console.log(`📊 Updated history entries: ${updatedHistory.length}`);
        
        if (updatedHistory.length > history.length) {
            console.log('✅ New history entry added!');
            const newEntry = updatedHistory[updatedHistory.length - 1];
            console.log('📝 New entry details:');
            console.log(`   Type: ${newEntry.type}`);
            console.log(`   Comment: "${newEntry.comment || 'No comment field'}"`);
            console.log(`   Full entry: ${JSON.stringify(newEntry, null, 2)}`);
        } else {
            console.log('🤔 No new history entry... Checking latest entry for changes');
            const latestEntry = updatedHistory[updatedHistory.length - 1];
            console.log('📝 Latest entry:', JSON.stringify(latestEntry, null, 2));
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testCommentHistory();