# Azure MCP Server

Model Context Protocol server for Azure SQL resource management.

## Features

- Resource group management
- SQL Server deployment and configuration
- Database creation with sample data
- Firewall rule configuration
- Performance metrics querying
- Cost estimation

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file (see `.env.example`) or set environment variables:

```bash
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

## Usage

The server communicates via stdio using the Model Context Protocol.

### Test Locally

```bash
node index.js
```

You should see: `Azure MCP server running on stdio`

Press Ctrl+C to stop.

### Use with VS Code

Add to your MCP configuration (see `../prompts/mcp-config-example.md`).

## Available Tools

- `list_resource_groups` - List all resource groups
- `create_resource_group` - Create new resource group
- `delete_resource_group` - Delete resource group and all resources
- `list_sql_servers` - List SQL servers
- `create_sql_server` - Deploy Azure SQL logical server
- `list_sql_databases` - List databases on a server
- `create_sql_database` - Create database (with optional sample)
- `create_firewall_rule` - Add IP firewall rule
- `get_database_metrics` - Get performance metrics
- `get_cost_estimate` - Estimate monthly costs

## Security

- Never commit credentials to version control
- Use service principal authentication (not personal credentials)
- Store credentials in environment variables or secure configuration
- Follow least-privilege principle
- Rotate secrets regularly

## Troubleshooting

### Authentication Failed

Test your service principal:

```bash
az login --service-principal \
  -u $AZURE_CLIENT_ID \
  -p $AZURE_CLIENT_SECRET \
  --tenant $AZURE_TENANT_ID
```

### Missing Environment Variables

Verify all required variables are set:

```bash
echo $AZURE_SUBSCRIPTION_ID
echo $AZURE_TENANT_ID
echo $AZURE_CLIENT_ID
```

## Development

The server is built with:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `@azure/identity` - Azure authentication
- `@azure/arm-resources` - Resource management
- `@azure/arm-sql` - SQL database management
- `@azure/arm-monitor` - Performance monitoring

## License

MIT
