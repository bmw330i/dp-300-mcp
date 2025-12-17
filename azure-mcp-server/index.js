#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DefaultAzureCredential, ClientSecretCredential } from '@azure/identity';
import { ResourceManagementClient } from '@azure/arm-resources';
import { SqlManagementClient } from '@azure/arm-sql';
import { MonitorClient } from '@azure/arm-monitor';

// Environment variables
const SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID;
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

if (!SUBSCRIPTION_ID || !TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing required environment variables:');
  console.error('AZURE_SUBSCRIPTION_ID, AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET');
  process.exit(1);
}

// Azure clients
const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
const resourceClient = new ResourceManagementClient(credential, SUBSCRIPTION_ID);
const sqlClient = new SqlManagementClient(credential, SUBSCRIPTION_ID);
const monitorClient = new MonitorClient(credential, SUBSCRIPTION_ID);

const server = new Server(
  {
    name: 'azure-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_resource_groups',
        description: 'List all resource groups in the subscription',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_resource_group',
        description: 'Create a new resource group for DP-300 practice',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Resource group name (e.g., dp300-practice-rg)',
            },
            location: {
              type: 'string',
              description: 'Azure region (e.g., eastus, westus2)',
              default: 'eastus',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'delete_resource_group',
        description: 'Delete a resource group and all its resources (cleanup)',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Resource group name to delete',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'list_sql_servers',
        description: 'List all SQL servers in a resource group',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
          },
          required: ['resourceGroup'],
        },
      },
      {
        name: 'create_sql_server',
        description: 'Create an Azure SQL logical server',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
            serverName: {
              type: 'string',
              description: 'SQL server name (must be globally unique)',
            },
            location: {
              type: 'string',
              description: 'Azure region',
              default: 'eastus',
            },
            adminUser: {
              type: 'string',
              description: 'Administrator username',
              default: 'sqladmin',
            },
            adminPassword: {
              type: 'string',
              description: 'Administrator password (min 8 chars, complex)',
            },
          },
          required: ['resourceGroup', 'serverName', 'adminPassword'],
        },
      },
      {
        name: 'list_sql_databases',
        description: 'List all databases on a SQL server',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
            serverName: {
              type: 'string',
              description: 'SQL server name',
            },
          },
          required: ['resourceGroup', 'serverName'],
        },
      },
      {
        name: 'create_sql_database',
        description: 'Create an Azure SQL Database',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
            serverName: {
              type: 'string',
              description: 'SQL server name',
            },
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
            edition: {
              type: 'string',
              description: 'Service tier (Basic, Standard, Premium)',
              default: 'Basic',
            },
            sampleName: {
              type: 'string',
              description: 'Sample database (AdventureWorksLT or empty)',
              default: '',
            },
          },
          required: ['resourceGroup', 'serverName', 'databaseName'],
        },
      },
      {
        name: 'create_firewall_rule',
        description: 'Add firewall rule to SQL server',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
            serverName: {
              type: 'string',
              description: 'SQL server name',
            },
            ruleName: {
              type: 'string',
              description: 'Firewall rule name',
            },
            startIpAddress: {
              type: 'string',
              description: 'Start IP address',
            },
            endIpAddress: {
              type: 'string',
              description: 'End IP address',
            },
          },
          required: ['resourceGroup', 'serverName', 'ruleName', 'startIpAddress', 'endIpAddress'],
        },
      },
      {
        name: 'get_database_metrics',
        description: 'Get performance metrics for a SQL database',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
            serverName: {
              type: 'string',
              description: 'SQL server name',
            },
            databaseName: {
              type: 'string',
              description: 'Database name',
            },
          },
          required: ['resourceGroup', 'serverName', 'databaseName'],
        },
      },
      {
        name: 'get_cost_estimate',
        description: 'Estimate costs for current resources in resource group',
        inputSchema: {
          type: 'object',
          properties: {
            resourceGroup: {
              type: 'string',
              description: 'Resource group name',
            },
          },
          required: ['resourceGroup'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'list_resource_groups': {
        const groups = [];
        for await (const group of resourceClient.resourceGroups.list()) {
          groups.push({
            name: group.name,
            location: group.location,
            tags: group.tags || {},
          });
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(groups, null, 2),
            },
          ],
        };
      }

      case 'create_resource_group': {
        const { name, location = 'eastus' } = args;
        const result = await resourceClient.resourceGroups.createOrUpdate(name, {
          location,
          tags: { purpose: 'DP-300-Practice', createdBy: 'MCP' },
        });
        return {
          content: [
            {
              type: 'text',
              text: `✓ Resource group '${name}' created in ${location}\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'delete_resource_group': {
        const { name } = args;
        await resourceClient.resourceGroups.beginDeleteAndWait(name);
        return {
          content: [
            {
              type: 'text',
              text: `✓ Resource group '${name}' and all resources deleted`,
            },
          ],
        };
      }

      case 'list_sql_servers': {
        const { resourceGroup } = args;
        const servers = [];
        for await (const server of sqlClient.servers.listByResourceGroup(resourceGroup)) {
          servers.push({
            name: server.name,
            location: server.location,
            fullyQualifiedDomainName: server.fullyQualifiedDomainName,
            version: server.version,
            state: server.state,
          });
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(servers, null, 2),
            },
          ],
        };
      }

      case 'create_sql_server': {
        const { resourceGroup, serverName, location = 'eastus', adminUser = 'sqladmin', adminPassword } = args;
        const result = await sqlClient.servers.beginCreateOrUpdateAndWait(resourceGroup, serverName, {
          location,
          administratorLogin: adminUser,
          administratorLoginPassword: adminPassword,
          version: '12.0',
        });
        return {
          content: [
            {
              type: 'text',
              text: `✓ SQL Server '${serverName}' created\nFQDN: ${result.fullyQualifiedDomainName}\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'list_sql_databases': {
        const { resourceGroup, serverName } = args;
        const databases = [];
        for await (const db of sqlClient.databases.listByServer(resourceGroup, serverName)) {
          databases.push({
            name: db.name,
            status: db.status,
            edition: db.sku?.tier,
            maxSizeBytes: db.maxSizeBytes,
            collation: db.collation,
          });
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(databases, null, 2),
            },
          ],
        };
      }

      case 'create_sql_database': {
        const { resourceGroup, serverName, databaseName, edition = 'Basic', sampleName } = args;
        const dbParams = {
          location: (await sqlClient.servers.get(resourceGroup, serverName)).location,
          sku: {
            name: edition === 'Basic' ? 'Basic' : 'S0',
            tier: edition,
          },
        };
        if (sampleName) {
          dbParams.sampleName = sampleName;
        }
        const result = await sqlClient.databases.beginCreateOrUpdateAndWait(
          resourceGroup,
          serverName,
          databaseName,
          dbParams
        );
        return {
          content: [
            {
              type: 'text',
              text: `✓ Database '${databaseName}' created on ${serverName}\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      case 'create_firewall_rule': {
        const { resourceGroup, serverName, ruleName, startIpAddress, endIpAddress } = args;
        const result = await sqlClient.firewallRules.createOrUpdate(
          resourceGroup,
          serverName,
          ruleName,
          {
            startIpAddress,
            endIpAddress,
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: `✓ Firewall rule '${ruleName}' created: ${startIpAddress} - ${endIpAddress}`,
            },
          ],
        };
      }

      case 'get_database_metrics': {
        const { resourceGroup, serverName, databaseName } = args;
        const database = await sqlClient.databases.get(resourceGroup, serverName, databaseName);
        return {
          content: [
            {
              type: 'text',
              text: `Database Metrics for ${databaseName}:\n${JSON.stringify({
                status: database.status,
                tier: database.sku?.tier,
                capacity: database.sku?.capacity,
                maxSizeGB: database.maxSizeBytes ? (database.maxSizeBytes / 1024 / 1024 / 1024).toFixed(2) : 'N/A',
                collation: database.collation,
                creationDate: database.creationDate,
              }, null, 2)}`,
            },
          ],
        };
      }

      case 'get_cost_estimate': {
        const { resourceGroup } = args;
        const resources = [];
        let estimatedCost = 0;
        
        for await (const resource of resourceClient.resources.listByResourceGroup(resourceGroup)) {
          resources.push({
            name: resource.name,
            type: resource.type,
            location: resource.location,
          });
          
          // Basic cost estimates
          if (resource.type === 'Microsoft.Sql/servers/databases') {
            estimatedCost += 5; // Basic tier ~$5/month
          }
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Resources in '${resourceGroup}':\n${JSON.stringify(resources, null, 2)}\n\nEstimated Monthly Cost: $${estimatedCost.toFixed(2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n${error.stack}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Azure MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
