@echo off

rmdir /s /q ..\dist

cd ..\src
call npm run build

cd ..
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/.vscode"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/akam"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/api"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/common"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/components"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/ipc"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/lib"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/res/img"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/utils"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/view"
REM rmdir /s /q "./dist/SNKRS Bot KR-win32-x64/resources/app/node_modules"
REM del ".\dist\SNKRS Bot KR-win32-x64\resources\app\app.js"
REM del ".\dist\SNKRS Bot KR-win32-x64\resources\app\index.css"
REM del ".\dist\SNKRS Bot KR-win32-x64\resources\app\index.html"
REM del ".\dist\SNKRS Bot KR-win32-x64\resources\app\index.js"
REM del ".\dist\SNKRS Bot KR-win32-x64\resources\app\package.json"
REM del ".\dist\SNKRS Bot KR-win32-x64\resources\app\preload.js"