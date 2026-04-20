/**
 * 调试评论功能测试
 * Debug Comment Functionality Test
 */

import { TaigaService } from '../src/taigaService.js';
import { addCommentTool } from '../src/tools/commentTools.js';

console.log('🐛 Debug Comment Test - Checking the "Failed to add comment to Taiga" error\n');

const taigaService = new TaigaService();

async function debugCommentTest() {
    console.log('🔍 Step 1: Check authentication status');
    
    if (!taigaService.isAuthenticated()) {
        console.log('❌ Authentication failed - Missing TAIGA_USERNAME or TAIGA_PASSWORD');
        console.log('Please set up your .env file with:');
        console.log('TAIGA_API_URL=https://api.taiga.io/api/v1');
        console.log('TAIGA_USERNAME=your_username');
        console.log('TAIGA_PASSWORD=your_password');
        return;
    }
    
    console.log('✅ Authentication configured');
    
    console.log('\n🔍 Step 2: Test basic API connectivity');
    
    try {
        const projects = await taigaService.listProjects();
        console.log(`✅ API connectivity OK - Found ${projects.length} projects`);
        
        if (projects.length === 0) {
            console.log('❌ No projects found - Cannot test comment functionality');
            return;
        }
        
        // 使用第一个项目进行测试  
        const testProject = projects[0];
        console.log(`📁 Using project: ${testProject.name} (ID: ${testProject.id})`);
        
        console.log('\n🔍 Step 3: Get project issues for testing');
        
        const issues = await taigaService.listIssues(testProject.id);
        console.log(`📋 Found ${issues.length} issues in project`);
        
        if (issues.length === 0) {
            console.log('❌ No issues found - Cannot test comment functionality');
            console.log('💡 Please create at least one issue in your Taiga project');
            return;
        }
        
        // 使用第一个issue进行测试
        const testIssue = issues[0];
        console.log(`🐛 Using issue: ${testIssue.subject} (ID: ${testIssue.id})`);
        
        console.log('\n🔍 Step 4: Test version retrieval');
        
        const version = await taigaService.getItemVersion('issue', testIssue.id);
        console.log(`📝 Current issue version: ${version}`);
        
        console.log('\n🔍 Step 5: Test comment addition using enhanced error handling');
        
        const testComment = {
            comment: `Test comment added at ${new Date().toISOString()} - Debug test`
        };
        
        const result = await taigaService.addComment('issue', testIssue.id, testComment);
        console.log('✅ Comment added successfully!');
        console.log('📄 Response:', JSON.stringify(result, null, 2));
        
        console.log('\n🔍 Step 6: Test comment retrieval');
        
        const history = await taigaService.getItemHistory('issue', testIssue.id);
        console.log(`📚 Got ${history.length} history entries`);
        
        // 过滤评论
        const comments = history.filter(entry => 
            entry.type === 'change' && 
            entry.comment && 
            entry.comment.trim().length > 0
        );
        console.log(`💬 Found ${comments.length} comments in history`);
        
        if (comments.length > 0) {
            const latestComment = comments[comments.length - 1];
            console.log('📝 Latest comment:', latestComment.comment);
        }
        
    } catch (error) {
        console.log('\n❌ Error occurred during testing:');
        console.log(`🔍 Error type: ${error.constructor.name}`);
        console.log(`📄 Error message: ${error.message}`);
        
        if (error.response) {
            console.log(`🌐 HTTP Status: ${error.response.status}`);
            console.log(`📋 Response data:`, JSON.stringify(error.response.data, null, 2));
        }
        
        if (error.request) {
            console.log('🔧 Request config:', JSON.stringify(error.config, null, 2));
        }
        
        console.log('\n💡 Debugging suggestions:');
        console.log('1. Check if your Taiga credentials are correct');
        console.log('2. Verify the issue ID exists and you have access to it');
        console.log('3. Check if the issue has been modified by another user');
        console.log('4. Ensure you have permission to add comments to this issue');
        console.log('5. Try with a different issue or project');
    }
}

// 运行调试测试
debugCommentTest().then(() => {
    console.log('\n🏁 Debug test completed');
}).catch((error) => {
    console.log('\n💥 Debug test failed:', error.message);
});