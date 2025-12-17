# DP-300 MCP Setup Instructions

Complete setup guide for the Azure MCP Server and study environment.

## Prerequisites

- macOS, Linux, or Windows with WSL
- Node.js 18+ installed
- Azure CLI installed
- VS Code (optional, but recommended)
- Active Azure subscription

## Step-by-Step Setup

### 1. Install Node.js (if needed)

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify:**
```bash
node --version  # Should be 18.x or higher
npm --version
```

### 2. Install Azure CLI

**macOS:**
```bash
brew install azure-cli
```

**Linux:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Verify:**
```bash
az --version
```

### 3. Clone the Repository

```bash
cd ~/Documents
git clone https://github.com/yourusername/dp-300-mcp.git
cd dp-300-mcp
```

### 4. Install Dependencies

```bash
cd azure-mcp-server
npm install
cd ..
```

### 5. Create Azure Service Principal

```bash
# Login to Azure
az login

# Get your subscription and tenant IDs
az account show --query "{subscriptionId:id, tenantId:tenantId}" -o json

# Create service principal (replace YOUR_SUBSCRIPTION_ID)
az ad sp create-for-rbac \
  --name "dp300-mcp-server" \
  --role Contributor \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID" \
  --output json
```

**Save the output!** You'll need:
- `appId` → `AZURE_CLIENT_ID`
- `password` → `AZURE_CLIENT_SECRET`
- `tenant` → `AZURE_TENANT_ID`

### 6. Configure Environment Variables

**Option A: Shell Environment (Recommended)**

Edit `~/.zshrc` (macOS) or `~/.bashrc` (Linux):

```bash
nano ~/.zshrc
```

Add these lines (replace with your actual values):

```bash
# Azure DP-300 MCP Server Credentials
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Save and reload:

```bash
source ~/.zshrc
```

**Option B: Local .env File**

```bash
cp .env.example .env
nano .env
```

Fill in your credentials, save the file.

### 7. Test the MCP Server

```bash
cd azure-mcp-server
node index.js
```

You should see:
```
Azure MCP server running on stdio
```

Press Ctrl+C to stop.

### 8. Configure VS Code

**Create or edit** `~/.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "azure-dp300": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Documents/dp-300-mcp/azure-mcp-server/index.js"],
      "cwd": "/Users/YOUR_USERNAME/Documents/dp-300-mcp",
      "env": {
        "AZURE_SUBSCRIPTION_ID": "your-subscription-id",
        "AZURE_TENANT_ID": "your-tenant-id",
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Important**: Use absolute paths!

### 9. Restart VS Code

Quit and reopen VS Code to load the MCP server.

### 10. Test the Integration

Open VS Code chat and ask:

```
List all my Azure resource groups
```

You should see JSON output with your resource groups (or empty array if none exist).

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Azure CLI installed and working
- [ ] Service principal created
- [ ] Environment variables set in `~/.zshrc`
- [ ] `.zshrc` reloaded with `source`
- [ ] MCP server runs without errors
- [ ] `mcp.json` configured with absolute paths
- [ ] VS Code restarted
- [ ] AI assistant can list resource groups

## Troubleshooting

### "Missing required environment variables"

Check that variables are set:
```bash
echo $AZURE_SUBSCRIPTION_ID
echo $AZURE_TENANT_ID
echo $AZURE_CLIENT_ID
```

If empty, reload your shell config:
```bash
source ~/.zshrc
```

### "Authentication failed"

Test service principal directly:
```bash
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID
```

### "MCP server not found in VS Code"

- Check that paths in `mcp.json` are absolute (start with `/`)
- Verify file exists: `ls -la /path/to/azure-mcp-server/index.js`
- Check VS Code output panel for errors
- Try restarting VS Code again

### "npm install fails"

Clear cache and retry:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## Security Best Practices

1. **Never commit credentials** to git
2. **Use restrictive permissions**: `chmod 600 ~/.zshrc`
3. **Rotate secrets** every 90 days:
   ```bash
   az ad sp credential reset --id $AZURE_CLIENT_ID
   ```
4. **Delete service principal** when done with DP-300:
   ```bash
   az ad sp delete --id $AZURE_CLIENT_ID
   ```

## Next Steps

1. Read `CLAUDE.md` for AI assistant prompt
2. Review `docs/DP-300_Azure_Study_Plan.md`
3. Try example prompts from `prompts/practice-prompts.md`
4. Deploy your first practice environment!

## Getting Help

- **Documentation**: Check `README.md` and docs folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Join discussions for Q&A

## Cost Management

- Set up spending alerts in Azure Portal
- Review costs daily: `az account show --query name` then check portal
- Delete resources after each practice session
- Use Basic tier when possible
- Monitor free credit balance

---

**Ready to practice?** Open VS Code and say:

```
Deploy a practice environment with AdventureWorksLT database
```

Good luck with DP-300! 🚀
