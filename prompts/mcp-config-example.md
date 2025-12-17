# Example MCP Configuration for VS Code

Example configuration for connecting the Azure MCP Server to VS Code or Claude Desktop.

## VS Code Configuration

Add to `~/.vscode/mcp.json` or workspace `.vscode/settings.json`:

```json
{
  "mcpServers": {
    "azure-mcp-server": {
      "command": "node",
      "args": ["azure-mcp-server/index.js"],
      "cwd": "/path/to/dp-300-mcp",
      "env": {
        "AZURE_SUBSCRIPTION_ID": "your-subscription-id-here",
        "AZURE_TENANT_ID": "your-tenant-id-here",
        "AZURE_CLIENT_ID": "your-client-id-here",
        "AZURE_CLIENT_SECRET": "your-client-secret-here",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Claude Desktop Configuration (macOS)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "azure-dp300": {
      "command": "node",
      "args": ["/Users/yourusername/Documents/dp-300-mcp/azure-mcp-server/index.js"],
      "env": {
        "AZURE_SUBSCRIPTION_ID": "your-subscription-id-here",
        "AZURE_TENANT_ID": "your-tenant-id-here",
        "AZURE_CLIENT_ID": "your-client-id-here",
        "AZURE_CLIENT_SECRET": "your-client-secret-here"
      }
    }
  }
}
```

## Using Environment Variables from Shell

If you've added Azure credentials to `~/.zshrc` or `~/.bashrc`, you can reference them:

```json
{
  "mcpServers": {
    "azure-mcp-server": {
      "command": "zsh",
      "args": ["-c", "source ~/.zshrc && node /path/to/dp-300-mcp/azure-mcp-server/index.js"],
      "cwd": "/path/to/dp-300-mcp"
    }
  }
}
```

**Note**: This method sources your shell environment, picking up the `AZURE_*` variables automatically.

## Security Notes

- **Never commit** `mcp.json` or `claude_desktop_config.json` to version control
- Store credentials in environment variables when possible
- Use restrictive file permissions: `chmod 600 ~/.zshrc`
- Rotate service principal secrets every 90 days

## Testing the Configuration

After adding the configuration:

1. Restart VS Code / Claude Desktop
2. Open a new chat
3. Ask: "List all my Azure resource groups"
4. You should see JSON output with your resource groups

If it fails:
- Check that Node.js is in your PATH
- Verify the file paths are absolute
- Test the MCP server directly: `node azure-mcp-server/index.js`
