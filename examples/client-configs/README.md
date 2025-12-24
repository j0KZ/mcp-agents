# Client Configuration Examples

Example configurations for connecting AI clients to the Docker MCP Gateway.

## Prerequisites

1. Docker Desktop 4.50+ installed
2. MCP Gateway running:
   ```bash
   docker compose -f docker-compose.mcp.yml up -d
   ```

## Claude Desktop

Copy `claude-desktop.json` to your Claude Desktop config directory:

**macOS:**
```bash
cp claude-desktop.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```powershell
copy claude-desktop.json %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
cp claude-desktop.json ~/.config/Claude/claude_desktop_config.json
```

Update the config path to match your `mcp-agents` installation:
```json
"--config", "/path/to/mcp-agents/docker/mcp-config/servers.json"
```

## VS Code with Copilot

Copy `vscode-mcp.json` to your project:
```bash
mkdir -p .vscode
cp vscode-mcp.json .vscode/mcp.json
```

## Token Savings

| Mode | Initial Context | Per-Call | Savings |
|------|-----------------|----------|---------|
| Standard (all tools) | ~10,000 tokens | ~500 | 0% |
| Docker Gateway | ~500 tokens | ~200 | **95%** |
| Code-mode | ~500 tokens | ~100 | **97%** |

## Verifying Connection

After configuration, test the connection:

1. **Claude Desktop**: Ask "What MCP tools are available?"
2. **VS Code**: Run "MCP: List Available Tools" from command palette

## Troubleshooting

### Gateway not responding

```bash
# Check if gateway is running
docker compose -f docker-compose.mcp.yml ps

# View gateway logs
docker compose -f docker-compose.mcp.yml logs mcp-gateway

# Restart gateway
docker compose -f docker-compose.mcp.yml restart mcp-gateway
```

### Tools not loading

```bash
# Check server health
curl http://localhost:8811/health

# List available servers
curl http://localhost:8811/servers
```

### Permission issues

Ensure Docker socket is accessible:
```bash
# Linux/macOS
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group
sudo usermod -aG docker $USER
```
