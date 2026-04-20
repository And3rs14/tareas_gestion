#!/usr/bin/env node

/**
 * 添加測試評論並調試數據結構
 * Add Test Comment and Debug Data Structure
 */

import { TaigaService } from '../src/taigaService.js';

console.log('📝 Adding Test Comment and Debug Data Structure\n');

const taigaService = new TaigaService();

async function addTestCommentAndDebug() {
    try {
        // 檢查認證
        if (!taigaService.isAuthenticated()) {
            console.log('❌ Authentication failed');
            return;
        }
        
        console.log('✅ Authentication configured');
        
        // 獲取項目
        const projects = await taigaService.listProjects();
        const testProject = projects[0];
        console.log(`📁 Using project: ${testProject.name} (ID: ${testProject.id})`);
        
        // 獲取issues
        const issues = await taigaService.listIssues(testProject.id);
        const testIssue = issues[0];
        console.log(`🐛 Using issue: #${testIssue.ref} - ${testIssue.subject}`);
        
        // 添加測試評論
        console.log('\n📝 Adding test comment...');
        const commentData = {
            comment: `測試評論 - ${new Date().toISOString()}`
        };
        
        try {
            const result = await taigaService.addComment('issue', testIssue.id, commentData);
            console.log('✅ Comment added successfully!');
            console.log('Response:', JSON.stringify(result, null, 2));
        } catch (commentError) {
            console.log('❌ Failed to add comment:', commentError.message);
        }
        
        // 等待一下讓API更新
        console.log('\n⏳ Waiting for API to update...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 獲取更新的歷史記錄
        console.log('\n🔍 Getting updated history...');
        const history = await taigaService.getItemHistory('issue', testIssue.id);
        console.log(`📚 Total history entries: ${history.length}`);
        
        // 查找評論
        console.log('\n💬 Looking for comments:');
        history.forEach((entry, index) => {
            console.log(`\n📝 Entry ${index + 1}:`);
            console.log(`   Type: ${entry.type}`);
            console.log(`   Comment field: ${JSON.stringify(entry.comment)}`);
            console.log(`   Comment HTML field: ${JSON.stringify(entry.comment_html)}`);
            console.log(`   Created at: ${entry.created_at}`);
            
            if (entry.comment && typeof entry.comment === 'string' && entry.comment.trim().length > 0) {
                console.log(`   ✅ Found comment: "${entry.comment}"`);
            }
            
            if (entry.comment_html && typeof entry.comment_html === 'string' && entry.comment_html.trim().length > 0) {
                console.log(`   ✅ Found comment HTML: "${entry.comment_html}"`);
            }
        });
        
        // 測試過濾器
        console.log('\n🔍 Testing comment filter:');
        const filteredComments = history.filter(entry => 
            entry.type === 1 && 
            entry.comment && 
            typeof entry.comment === 'string' &&
            entry.comment.trim().length > 0
        );
        
        console.log(`💬 Filtered comments: ${filteredComments.length}`);
        
        if (filteredComments.length > 0) {
            filteredComments.forEach((comment, index) => {
                console.log(`\nComment ${index + 1}:`);
                console.log(`   Content: "${comment.comment}"`);
                console.log(`   User: ${comment.user?.full_name || comment.user?.username}`);
                console.log(`   Date: ${comment.created_at}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

addTestCommentAndDebug();