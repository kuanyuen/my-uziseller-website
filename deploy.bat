@echo off
chcp 65001 >nul
title UziSeller 自动化部署脚本
echo ===================================================
echo   正在准备部署 UziSeller 到 GitHub 与 Vercel...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] 添加更新文件...
git add .

echo [2/3] 提交代码...
git commit -m "feat: upgrade AI subscriptions store with AppMMO category layout, dark theme, and WeChat copy fix"

echo [3/3] 推送到 GitHub (自动触发 Vercel 生产环境部署)...
git push origin main

echo.
echo ===================================================
echo   🎉 部署已成功推送！
echo   Vercel 正在自动构建并发布至 www.uziseller.com
echo   稍等 30-60 秒后刷新网页即可看到全新界面！
echo ===================================================
echo.
pause
