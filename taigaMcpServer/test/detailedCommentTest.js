/**
 * 详细评论调试测试
 * Detailed Comment Debug Test
 */

import { TaigaService } from '../src/taigaService.js';

console.log('🔍 Detailed Comment Debug Test\n');

const taigaService = new TaigaService();

async function detailedTest() {
    try {
        const projects = await taigaService.listProjects();
        const testProject = projects[0];
        const issues = await taigaService.listIssues(testProject.id);
        const testIssue = issues[0];
        
        console.log(`🐛 Testing with issue: ${testIssue.subject} (ID: ${testIssue.id})`);
        
        const history = await taigaService.getItemHistory('issue', testIssue.id);
        
        console.log(`📚 Total history entries: ${history.length}\n`);
        
        // 逐个检查每个条目
        history.forEach((entry, index) => {
            console.log(`📝 Entry ${index + 1}:`);
            console.log(`   Type: ${entry.type} (${typeof entry.type})`);
            console.log(`   Has comment field: ${!!entry.comment}`);
            console.log(`   Comment value: "${entry.comment || 'NULL/UNDEFINED'}"`);
            console.log(`   Comment length: ${entry.comment ? entry.comment.length : 0}`);
            console.log(`   Comment trimmed length: ${entry.comment ? entry.comment.trim().length : 0}`);
            
            // 测试我们的过滤条件
            const matchesType = entry.type === 1;
            const hasComment = !!entry.comment;
            const hasNonEmptyComment = entry.comment && entry.comment.trim().length > 0;
            
            console.log(`   Matches type 1: ${matchesType}`);
            console.log(`   Has comment: ${hasComment}`);
            console.log(`   Has non-empty comment: ${hasNonEmptyComment}`);
            console.log(`   Would be included: ${matchesType && hasComment && hasNonEmptyComment}`);
            console.log('');
        });
        
        // 手动应用过滤器
        console.log('\n🔍 Manual filtering:');
        const manualFiltered = history.filter(entry => 
            entry.type === 1 && 
            entry.comment && 
            entry.comment.trim().length > 0
        );
        
        console.log(`📊 Manual filter result: ${manualFiltered.length} comments found`);
        
        if (manualFiltered.length > 0) {
            manualFiltered.forEach((comment, index) => {
                console.log(`💬 Comment ${index + 1}: "${comment.comment}"`);
                console.log(`   User: ${comment.user?.full_name || comment.user?.username}`);
                console.log(`   Date: ${comment.created_at}`);
            });
        } else {
            console.log('❌ No comments found with manual filter');
        }
        
        // 测试我们的函数
        console.log('\n🔍 Testing filterCommentsFromHistory function:');
        
        // 直接导入并测试函数
        const { filterCommentsFromHistory } = await import('./testFilterFunction.js');
        const functionResult = filterCommentsFromHistory(history);
        console.log(`📊 Function result: ${functionResult.length} comments found`);
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

detailedTest();