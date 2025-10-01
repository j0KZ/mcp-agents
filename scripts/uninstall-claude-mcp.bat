@echo off
echo Uninstalling My Claude Agents from Claude Code...
echo.

echo Removing smart-reviewer...
claude mcp remove smart-reviewer
echo ✅ smart-reviewer removed
echo.

echo Removing test-generator...
claude mcp remove test-generator
echo ✅ test-generator removed
echo.

echo Removing architecture-analyzer...
claude mcp remove architecture-analyzer
echo ✅ architecture-analyzer removed
echo.

echo ✨ Uninstallation complete!
echo.
echo Verifying...
claude mcp list
echo.
pause
