# Azure Credentials for DP-300 MCP Server
# Add these lines to your ~/.zshrc file
# 
# SECURITY: These credentials provide full Contributor access to your Azure subscription.
# Keep them secure! Never commit this file to version control.
#
# To apply changes: source ~/.zshrc

# Azure Subscription Details
# Get these from: az account show
export AZURE_SUBSCRIPTION_ID="your-subscription-id-here"
export AZURE_TENANT_ID="your-tenant-id-here"

# Azure Service Principal Credentials
# Get these from: az ad sp create-for-rbac
export AZURE_CLIENT_ID="your-client-id-here"
export AZURE_CLIENT_SECRET="your-client-secret-here"

# Optional: Set default Azure region
export AZURE_LOCATION="eastus"

# Verify credentials are loaded (optional)
# echo "Azure credentials loaded for subscription: $AZURE_SUBSCRIPTION_ID"
