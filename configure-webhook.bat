@echo off
REM Billplz Webhook 配置助手 (Windows 版本)
echo ========================================
echo   Billplz Webhook 配置助手
echo ========================================
echo.
echo 📋 配置信息（已准备好，直接复制使用）
echo.
echo 🔗 Webhook URL:
echo https://uziseller-uzi-seller.vercel.app/api/billplz-webhook
echo.
echo ========================================
echo.
echo 🚀 配置步骤（3 分钟完成）
echo.
echo 1️⃣  打开 Billplz 配置页面
echo    按任意键将自动打开浏览器...
pause >nul
start https://www.billplz.com/enterprise/settings/webhooks
echo.
echo 2️⃣  点击 'Add Webhook' 或 'Create New Webhook'
echo.
echo 3️⃣  复制以下 URL 到 Webhook URL 字段:
echo.
echo    https://uziseller-uzi-seller.vercel.app/api/billplz-webhook
echo.
echo    （按任意键复制到剪贴板）
pause >nul
echo https://uziseller-uzi-seller.vercel.app/api/billplz-webhook | clip
echo    ✅ URL 已复制到剪贴板！直接粘贴即可（Ctrl+V）
echo.
echo 4️⃣  填写其他信息:
echo    • Signature Method: 选择 'X Signature'
echo    • Events: 勾选 'bill.paid' 和 'bill.failed'
echo    • Collection (可选): 0uklil7m
echo.
echo 5️⃣  点击 'Test Webhook'
echo    ✅ 返回 200 或 401 都是正常的
echo.
echo 6️⃣  点击 'Save' 保存配置
echo.
echo ========================================
echo.
echo ✅ 配置完成后:
echo.
echo 按任意键打开你的网站测试...
pause >nul
start https://uziseller.com
echo.
echo 提交测试订单并完成支付
echo 检查订单状态是否自动更新
echo.
echo ========================================
echo.
echo 📞 需要帮助？
echo 查看详细文档: WEBHOOK-CONFIG.md
echo.
pause
