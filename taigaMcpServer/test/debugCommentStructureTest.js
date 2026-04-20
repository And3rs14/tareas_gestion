#!/usr/bin/env node

/**
 * 調試評論數據結構測試
 * Debug Comment Data Structure Test
 */

import { TaigaService } from '../src/taigaService.js';

console.log('🔍 Debug Comment Data Structure Test\n');

const taigaService = new TaigaService();

async function debugCommentStructure() {
    try {
        // 檢查認證
        if (!taigaService.isAuthenticated()) {
            console.log('❌ Authentication failed - Missing TAIGA_USERNAME or TAIGA_PASSWORD');
            return;
        }
        
        console.log('✅ Authentication configured');
        
        // 獲取項目
        const projects = await taigaService.listProjects();
        if (projects.length === 0) {
            console.log('❌ No projects found');
            return;
        }
        
        const testProject = projects[0];
        console.log(`📁 Using project: ${testProject.name} (ID: ${testProject.id})`);
        
        // 獲取issues
        const issues = await taigaService.listIssues(testProject.id);
        if (issues.length === 0) {
            console.log('❌ No issues found');
            return;
        }
        
        const testIssue = issues[0];
        console.log(`🐛 Using issue: #${testIssue.ref} - ${testIssue.subject}`);
        
        // 獲取歷史記錄
        console.log('\n🔍 Getting item history...');
        const history = await taigaService.getItemHistory('issue', testIssue.id);
        console.log(`📚 Total history entries: ${history.length}`);
        
        // 詳細檢查每個歷史條目
        console.log('\n📋 Analyzing history entries:');
        history.forEach((entry, index) => {
            console.log(`\n📝 Entry ${index + 1}:`);
            console.log(`   Type: ${entry.type} (${typeof entry.type})`);
            console.log(`   Has comment field: ${!!entry.comment}`);
            
            // 檢查所有可能的評論字段
            if (entry.comment) {
                console.log(`   Comment type: ${typeof entry.comment}`);
                console.log(`   Comment value:`, entry.comment);
                console.log(`   Comment JSON:`, JSON.stringify(entry.comment, null, 2));
                
                if (typeof entry.comment === 'string') {
                    console.log(`   Comment length: ${entry.comment.length}`);
                    console.log(`   Comment trimmed length: ${entry.comment.trim().length}`);
                }
            }
            
            if (entry.comment_html) {
                console.log(`   Comment HTML type: ${typeof entry.comment_html}`);
                console.log(`   Comment HTML value:`, entry.comment_html);
            }
            
            if (entry.user) {
                console.log(`   User:`, {
                    full_name: entry.user.full_name,
                    username: entry.user.username,
                    id: entry.user.id
                });
            }
            
            console.log(`   Created at: ${entry.created_at}`);
            console.log(`   Entry keys:`, Object.keys(entry));
        });
        
        // 過濾評論
        console.log('\n🔍 Filtering comments:');
        const comments = history.filter(entry => 
            entry.type === 1 && 
            entry.comment && 
            entry.comment.trim().length > 0
        );
        
        console.log(`💬 Found ${comments.length} comments`);
        
        if (comments.length > 0) {
            console.log('\n📝 Comment details:');
            comments.forEach((comment, index) => {
                console.log(`\nComment ${index + 1}:`);
                console.log(`   Comment content:`, comment.comment);
                console.log(`   Comment type:`, typeof comment.comment);
                console.log(`   User:`, comment.user?.full_name || comment.user?.username);
                console.log(`   Date:`, comment.created_at);
            });
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

debugCommentStructure();