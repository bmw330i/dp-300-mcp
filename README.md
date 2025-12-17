# Azure MCP Server for DP-300 Certification Practice

A Model Context Protocol (MCP) server that enables AI assistants like Claude to manage Azure SQL resources programmatically. Designed specifically for hands-on practice while studying for the Microsoft DP-300 certification exam.

## 🎯 Features

- **Resource Management**: Create, list, and delete Azure resource groups
- **SQL Server Operations**: Deploy and manage Azure SQL logical servers
- **Database Management**: Create databases with sample data (AdventureWorksLT)
- **Security Configuration**: Set up firewall rules for secure access
- **Cost Monitoring**: Estimate monthly costs for your resources
- **Performance Metrics**: Query database performance statistics

## 📚 Study Materials Included

- **Performance Views Cheat Sheet**: Oracle DBA → Azure SQL DMV mapping
- **Flashcard Drills**: 33 rapid-fire practice questions
- **Complete Study Plan**: 8-week DP-300 preparation guide
- **Hands-on Labs**: Practical exercises for all exam domains

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **Azure Account** with free $200 credit
- **Azure CLI** installed (`brew install azure-cli` on macOS)
- **VS Code** with MCP support

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/dp-300-mcp.git
cd dp-300-mcp/azure-mcp-server
npm install
```

### 2. Create Azure Service Principal

```bash
# Login to Azure
az login

# Get your subscription ID and tenant ID
az account show --query "{subscriptionId:id, tenantId:tenantId}" -o json

# Create service principal with Contributor role
az ad sp create-for-rbac --name "dp300-mcp-server" \
  --role Contributor \
  --scopes "/subscriptions/YOUR_SUBSCRIPTION_ID" \
  --output json
```

Save the output:
- `appId` → `AZURE_CLIENT_ID`
- `password` → `AZURE_CLIENT_SECRET`
- `tenant` → `AZURE_TENANT_ID`

### 3. Configure Environment Variables

**Option A: VS Code MCP Configuration (Recommended)**

Add to your `~/.vscode/mcp.json` or workspace settings:

```json
{
  "mcpServers": {
    "azure-mcp-server": {
      "command": "node",
      "args": ["path/to/dp-300-mcp/azure-mcp-server/index.js"],
      "cwd": "/path/to/dp-300-mcp",
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

**Option B: Shell Environment Variables**

Add to `~/.zshrc` (macOS) or `~/.bashrc` (Linux):

```bash
# Azure MCP Server Credentials
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

Then reload: `source ~/.zshrc`

**Option C: Local .env File**

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Test the Server

```bash
cd azure-mcp-server
node index.js
```

You should see: `Azure MCP server running on stdio`

Press Ctrl+C to stop.

### 5. Use with VS Code

1. Restart VS Code to load MCP server
2. Open a chat with your AI assistant
3. Ask: "List all my Azure resource groups"

## 🎓 DP-300 Study Workflow

### Deploy Your First Lab Environment

```
You: "Create a practice environment with AdventureWorksLT database"
```

The AI assistant will:
1. Create resource group `dp300-practice-rg`
2. Deploy SQL logical server
3. Configure firewall rule for your IP
4. Create database with sample data

### Practice Performance Monitoring

```
You: "Show me the top CPU-consuming queries in AdventureWorksLT"
```

The AI will connect and run the appropriate DMV queries.

### Clean Up Resources

```
You: "Delete all my DP-300 practice resources"
```

Removes everything to stop costs!

## 📖 Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_resource_groups` | List all resource groups |
| `create_resource_group` | Create new resource group |
| `delete_resource_group` | Delete resource group and all resources |
| `list_sql_servers` | List SQL servers in resource group |
| `create_sql_server` | Deploy Azure SQL logical server |
| `list_sql_databases` | List databases on a server |
| `create_sql_database` | Create database (with optional sample) |
| `create_firewall_rule` | Add IP firewall rule |
| `get_database_metrics` | Get performance metrics |
| `get_cost_estimate` | Estimate monthly costs |

## 💰 Cost Management

- **Basic SQL Database**: ~$5/month (free tier eligible)
- **Always delete resources** after practice sessions
- **Monitor spending**: Check Azure Cost Management
- **$200 free credit**: Valid for 30 days

### Daily Practice Routine

1. **Morning**: Deploy resources for today's domain
2. **Practice**: Run through labs
3. **Evening**: Delete resource group
4. **Check**: Verify no resources running

## 🔐 Security Best Practices

✅ **DO:**
- Use service principal (not personal credentials)
- Store credentials in environment variables
- Never commit `.env` or `mcp.json` to git
- Rotate client secret every 90 days
- Use least-privilege permissions

❌ **DON'T:**
- Commit credentials to version control
- Share your service principal with others
- Use production subscriptions for practice
- Leave resources running unnecessarily

## 🐛 Troubleshooting

### Authentication Failed

```bash
# Test service principal login
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID
```

### MCP Server Won't Start

```bash
# Check environment variables
echo $AZURE_SUBSCRIPTION_ID
echo $AZURE_TENANT_ID
echo $AZURE_CLIENT_ID

# Test directly
cd azure-mcp-server
node index.js
```

### Permissions Error

Ensure service principal has **Contributor** role:

```bash
az role assignment list --assignee $AZURE_CLIENT_ID --output table
```

## 📚 Study Resources

### Included Documentation

- `docs/DP-300_Performance_Views_Cheat_Sheet.md` - DMV reference for Oracle DBAs
- `docs/DP-300_Performance_Flashcards.md` - Practice drills
- `docs/DP-300_Azure_Study_Plan.md` - 8-week study schedule

### External Links

- [Microsoft DP-300 Exam](https://learn.microsoft.com/certifications/exams/dp-300)
- [Azure SQL Documentation](https://learn.microsoft.com/azure/azure-sql/)
- [Query Store Guide](https://learn.microsoft.com/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This project is for educational purposes only. Always follow your organization's security policies and Azure best practices. The authors are not responsible for any Azure charges incurred.

## 🙏 Acknowledgments

Created for DP-300 certification candidates, especially Oracle DBAs transitioning to Azure SQL. Built with the Model Context Protocol SDK.

---

**Star this repo** if it helps you pass the DP-300 exam! 🌟

**Questions?** Open an issue or discussion.

**Need help?** Check the `docs/` folder for detailed guides.
