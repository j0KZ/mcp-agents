@echo off
echo Installing My Claude Agents as MCP servers for Claude Code...
echo.

REM Get the project root directory (parent of scripts folder)
set "PROJECT_ROOT=%~dp0.."

echo Project root: %PROJECT_ROOT%
echo.

echo Adding smart-reviewer...
claude mcp add smart-reviewer node "%PROJECT_ROOT%\packages\smart-reviewer\dist\mcp-server.js"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to add smart-reviewer
    pause
    exit /b 1
)
echo ✅ smart-reviewer added
echo.

echo Adding test-generator...
claude mcp add test-generator node "%PROJECT_ROOT%\packages\test-generator\dist\mcp-server.js"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to add test-generator
    pause
    exit /b 1
)
echo ✅ test-generator added
echo.

echo Adding architecture-analyzer...
claude mcp add architecture-analyzer node "%PROJECT_ROOT%\packages\architecture-analyzer\dist\mcp-server.js"
if %ERRORLEVEL% NEQ 0 (
    echo Failed to add architecture-analyzer
    pause
    exit /b 1
)
echo ✅ architecture-analyzer added
echo.

echo.
echo ✨ Installation complete!
echo.
echo Verifying installation...
claude mcp list
echo.
echo 📚 Usage examples:
echo   claude code "Review src/app.js with smart-reviewer"
echo   claude code "Generate tests for src/utils.js"
echo   claude code "Analyze project architecture"
echo.
pause
