#!/usr/bin/env node

/**
 * 調試附件上傳 400 錯誤測試
 * 用於診斷真實的 API 調用問題
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugAttachmentUpload() {
  console.log('🔍 調試附件上傳 400 錯誤...\n');
  
  try {
    // 檢查環境變數
    const hasAuth = process.env.TAIGA_USERNAME && process.env.TAIGA_PASSWORD;
    console.log('認證狀態:', hasAuth ? '✅ 有認證' : '❌ 缺少認證');
    
    if (!hasAuth) {
      console.log('❌ 缺少必要的環境變數，無法進行真實 API 測試');
      console.log('請設置 TAIGA_USERNAME 和 TAIGA_PASSWORD');
      return;
    }
    
    // 導入 TaigaService
    const { TaigaService } = await import('../src/taigaService.js');
    const service = new TaigaService();
    
    // 檢查認證
    console.log('🔍 檢查認證狀態...');
    const isAuth = service.isAuthenticated();
    console.log('認證檢查結果:', isAuth ? '✅ 通過' : '❌ 失敗');
    
    // 創建測試文件
    const testFilePath = join(__dirname, 'debug_test.txt');
    const testContent = '這是一個調試測試文件。';
    fs.writeFileSync(testFilePath, testContent);
    console.log(`✅ 測試文件創建: ${testFilePath}`);
    
    // 嘗試獲取用戶資訊
    console.log('🔍 測試 API 連接...');
    try {
      const currentUser = await service.getCurrentUser();
      console.log('✅ API 連接成功, 用戶:', currentUser.username);
    } catch (authError) {
      console.log('❌ API 連接失敗:', authError.message);
      return;
    }
    
    // 獲取項目列表
    console.log('🔍 獲取項目列表...');
    const projects = await service.listProjects();
    if (projects.length === 0) {
      console.log('❌ 沒有可用的項目');
      return;
    }
    
    const firstProject = projects[0];
    console.log(`✅ 找到項目: ${firstProject.name} (ID: ${firstProject.id})`);
    
    // 獲取項目中的 issues
    console.log('🔍 獲取項目 Issues...');
    const issues = await service.listIssues(firstProject.id);
    if (issues.length === 0) {
      console.log('❌ 項目中沒有 Issues');
      return;
    }
    
    const firstIssue = issues[0];
    console.log(`✅ 找到 Issue: #${firstIssue.ref} - ${firstIssue.subject}`);
    
    // 嘗試上傳附件 - 使用文件路徑方式
    console.log('🔍 嘗試使用文件路徑上傳...');
    try {
      const result = await service.uploadAttachmentFromPath(
        'issue',
        firstIssue.id,
        testFilePath,
        '調試測試上傳'
      );
      console.log('✅ 文件路徑上傳成功:', result);
    } catch (uploadError) {
      console.log('❌ 文件路徑上傳失敗:', uploadError.message);
      
      // 詳細錯誤分析
      if (uploadError.message.includes('400')) {
        console.log('\n🔍 400 錯誤詳細分析:');
        console.log('可能的原因:');
        console.log('1. FormData 字段名稱錯誤');
        console.log('2. 缺少必要的參數');
        console.log('3. 認證 header 格式問題');
        console.log('4. API endpoint 路徑錯誤');
        console.log('5. Content-Type header 衝突');
      }
    }
    
    // 嘗試 Base64 方式上傳 
    console.log('\n🔍 嘗試使用 Base64 數據上傳...');
    try {
      const fileBuffer = fs.readFileSync(testFilePath);
      const base64Data = fileBuffer.toString('base64');
      
      const result = await service.uploadAttachment(
        'issue',
        firstIssue.id,
        base64Data,
        'debug_test.txt',
        'text/plain',
        '調試測試 Base64 上傳'
      );
      console.log('✅ Base64 上傳成功:', result);
    } catch (base64Error) {
      console.log('❌ Base64 上傳失敗:', base64Error.message);
    }
    
    // 清理測試文件
    fs.unlinkSync(testFilePath);
    console.log('✅ 測試文件已清理');
    
  } catch (error) {
    console.error('❌ 調試測試執行失敗:', error.message);
    console.error('堆疊:', error.stack);
  }
}

// 運行調試測試
if (import.meta.url === `file://${process.argv[1]}`) {
  debugAttachmentUpload().catch(error => {
    console.error('調試測試失敗:', error);
    process.exit(1);
  });
}