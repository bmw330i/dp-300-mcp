# DP-300: Administering Microsoft Azure SQL Solutions
## Hands-On Study Plan

**Exam Focus:** Azure SQL Database, SQL Managed Instance, SQL Server on Azure VMs  
**Your Environment:** Free Azure account + local practice environment  
**Target:** Pass DP-300 certification

---

## Azure Free Account Setup

### What You Get Free:
- **12 months free:** 750 hours Azure SQL Database (S0), 100 GB storage
- **Always free:** 250 GB SQL Database storage, Azure Monitor logs (5 GB)
- **$200 credit:** First 30 days for any Azure service
- **No automatic charges:** Must explicitly upgrade to pay-as-you-go

### Setup Steps:
1. Go to https://azure.microsoft.com/free/
2. Sign in with Microsoft account (or create one)
3. Verify identity (credit card required but won't be charged)
4. Choose free tier resources only to avoid charges

### Cost Management Tips:
- **Set spending alerts** at $10, $50, $100
- **Use B-series burstable VMs** (cheapest option)
- **Delete resources after practice** (automation script below)
- **Use SQL Database serverless** (auto-pause when idle)
- **Tag all resources** with "DP300-Practice" for easy cleanup

---

## DP-300 Exam Domains & Hands-On Labs

### Domain 1: Plan and Implement Data Platform Resources (15-20%)

#### Lab 1.1: Deploy Azure SQL Database
```bash
# Create resource group
az group create --name dp300-practice-rg --location eastus

# Create Azure SQL logical server
az sql server create \
  --name dp300-server-$(date +%s) \
  --resource-group dp300-practice-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password 'P@ssw0rd123!'

# Create SQL Database (Basic tier - free eligible)
az sql db create \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AdventureWorksLT \
  --sample-name AdventureWorksLT \
  --edition Basic

# Configure firewall for your IP
az sql server firewall-rule create \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AllowMyIP \
  --start-ip-address $(curl -s ifconfig.me) \
  --end-ip-address $(curl -s ifconfig.me)
```

**Practice Tasks:**
- [ ] Create SQL Database using Portal, CLI, and ARM template
- [ ] Deploy AdventureWorksLT sample database
- [ ] Configure server-level firewall rules
- [ ] Set up Azure AD authentication
- [ ] Configure private endpoint (preview in free tier)

#### Lab 1.2: Deploy SQL Managed Instance
```bash
# NOTE: Managed Instance is EXPENSIVE (~$700/month)
# Use FREE TRIAL CREDITS for this (delete after 1-2 hours of practice)

# Create virtual network
az network vnet create \
  --name dp300-vnet \
  --resource-group dp300-practice-rg \
  --address-prefix 10.0.0.0/16 \
  --subnet-name ManagedInstance \
  --subnet-prefix 10.0.0.0/24

# Deploy Managed Instance (takes 4-6 hours!)
az sql mi create \
  --name dp300-mi-$(date +%s) \
  --resource-group dp300-practice-rg \
  --location eastus \
  --admin-user sqladmin \
  --admin-password 'P@ssw0rd123!' \
  --subnet $(az network vnet subnet show --name ManagedInstance --vnet-name dp300-vnet --resource-group dp300-practice-rg --query id -o tsv) \
  --capacity 4 \
  --storage 32 \
  --edition GeneralPurpose \
  --family Gen5

# IMPORTANT: Delete immediately after practice!
```

**Practice Tasks:**
- [ ] Deploy Managed Instance (use trial credits)
- [ ] Configure NSG rules for MI subnet
- [ ] Set up point-to-site VPN for access
- [ ] Restore database from URL (Azure Blob)
- [ ] Configure instance collation

#### Lab 1.3: SQL Server on Azure VM
```bash
# Create SQL Server VM (Use B2s - cheapest, ~$30/month)
az vm create \
  --resource-group dp300-practice-rg \
  --name dp300-sqlvm \
  --image MicrosoftSQLServer:sql2022-ws2022:sqldev-gen2:latest \
  --size Standard_B2s \
  --admin-username azureuser \
  --admin-password 'P@ssw0rd123!' \
  --public-ip-sku Standard \
  --storage-sku StandardSSD_LRS

# Configure SQL VM resource provider
az sql vm create \
  --name dp300-sqlvm \
  --resource-group dp300-practice-rg \
  --sql-mgmt-type Full \
  --license-type PAYG \
  --connectivity-type PUBLIC \
  --port 1433 \
  --sql-auth-update-username sqladmin \
  --sql-auth-update-pwd 'P@ssw0rd123!'
```

**Practice Tasks:**
- [ ] Deploy SQL Server 2022 on Windows Server VM
- [ ] Configure SQL Server using Azure extension
- [ ] Set up automated backups to Azure Blob
- [ ] Configure Azure Key Vault for TDE
- [ ] Enable SQL IaaS Agent Extension features

---

### Domain 2: Implement a Secure Environment (15-20%)

#### Lab 2.1: Authentication & Authorization
**Practice Tasks:**
- [ ] Configure Azure AD authentication for SQL Database
- [ ] Create contained database users
- [ ] Implement row-level security (RLS)
- [ ] Configure dynamic data masking
- [ ] Set up SQL Database auditing to Log Analytics

```sql
-- Create Azure AD admin user
CREATE USER [user@yourdomain.com] FROM EXTERNAL PROVIDER;
ALTER ROLE db_owner ADD MEMBER [user@yourdomain.com];

-- Row-Level Security example
CREATE SCHEMA Security;
GO

CREATE FUNCTION Security.fn_securitypredicate(@SalesPersonID int)
RETURNS TABLE
WITH SCHEMABINDING
AS
    RETURN SELECT 1 AS fn_securitypredicate_result
    WHERE @SalesPersonID = CAST(SESSION_CONTEXT(N'SalesPersonID') AS int);
GO

CREATE SECURITY POLICY SalesFilter
ADD FILTER PREDICATE Security.fn_securitypredicate(SalesPersonID)
ON Sales.SalesOrderHeader
WITH (STATE = ON);

-- Dynamic Data Masking
ALTER TABLE Customers
ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');

ALTER TABLE Customers
ALTER COLUMN CreditCard ADD MASKED WITH (FUNCTION = 'partial(0,"XXXX-XXXX-XXXX-",4)');
```

#### Lab 2.2: Encryption & Key Management
**Practice Tasks:**
- [ ] Enable Transparent Data Encryption (TDE)
- [ ] Configure Always Encrypted with Azure Key Vault
- [ ] Set up customer-managed keys for TDE
- [ ] Implement SSL/TLS connections
- [ ] Configure Azure Private Link

```bash
# Enable TDE with service-managed key
az sql db tde set \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --database AdventureWorksLT \
  --status Enabled

# Create Key Vault for customer-managed keys
az keyvault create \
  --name dp300-kv-$(date +%s) \
  --resource-group dp300-practice-rg \
  --location eastus \
  --enable-soft-delete true \
  --enable-purge-protection true
```

#### Lab 2.3: Network Security
**Practice Tasks:**
- [ ] Configure VNet service endpoints
- [ ] Set up Azure Private Link for SQL Database
- [ ] Implement VNet rules
- [ ] Configure public network access deny
- [ ] Set up Azure Firewall rules

---

### Domain 3: Monitor, Configure, and Optimize (30-35%)

#### Lab 3.1: Performance Monitoring
**Practice Tasks:**
- [ ] Set up Azure Monitor for SQL Database
- [ ] Configure Query Performance Insight
- [ ] Use Database Advisor recommendations
- [ ] Implement Intelligent Insights
- [ ] Set up custom alerts for DTU/vCore usage

```bash
# Create Log Analytics workspace
az monitor log-analytics workspace create \
  --resource-group dp300-practice-rg \
  --workspace-name dp300-logs

# Enable diagnostic settings
az monitor diagnostic-settings create \
  --name SQLDiagnostics \
  --resource $(az sql db show --name AdventureWorksLT --server dp300-server-XXXXX --resource-group dp300-practice-rg --query id -o tsv) \
  --logs '[{"category":"QueryStoreRuntimeStatistics","enabled":true},{"category":"Errors","enabled":true},{"category":"DatabaseWaitStatistics","enabled":true}]' \
  --metrics '[{"category":"Basic","enabled":true}]' \
  --workspace $(az monitor log-analytics workspace show --resource-group dp300-practice-rg --workspace-name dp300-logs --query id -o tsv)
```

#### Lab 3.2: Query Store & Tuning
**Practice Tasks:**
- [ ] Enable and configure Query Store
- [ ] Analyze query performance regression
- [ ] Force query plans
- [ ] Use Automatic Tuning
- [ ] Implement index recommendations

```sql
-- Enable Query Store
ALTER DATABASE AdventureWorksLT SET QUERY_STORE = ON;

ALTER DATABASE AdventureWorksLT SET QUERY_STORE (
    OPERATION_MODE = READ_WRITE,
    CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30),
    DATA_FLUSH_INTERVAL_SECONDS = 900,
    MAX_STORAGE_SIZE_MB = 1000,
    INTERVAL_LENGTH_MINUTES = 60
);

-- Find top queries by CPU
SELECT TOP 10
    q.query_id,
    qt.query_sql_text,
    SUM(rs.count_executions) AS total_executions,
    AVG(rs.avg_cpu_time) AS avg_cpu_time,
    MAX(rs.max_cpu_time) AS max_cpu_time
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
GROUP BY q.query_id, qt.query_sql_text
ORDER BY AVG(rs.avg_cpu_time) DESC;

-- Enable Automatic Tuning
ALTER DATABASE AdventureWorksLT
SET AUTOMATIC_TUNING (FORCE_LAST_GOOD_PLAN = ON);
```

#### Lab 3.3: Scaling & Resource Management
**Practice Tasks:**
- [ ] Scale up/down SQL Database (Basic→Standard→Premium)
- [ ] Configure auto-pause for serverless
- [ ] Implement elastic pools
- [ ] Monitor DTU/vCore consumption
- [ ] Use read replicas for read-scale out

```bash
# Scale database to Standard tier
az sql db update \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AdventureWorksLT \
  --edition Standard \
  --capacity 10

# Create elastic pool
az sql elastic-pool create \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name dp300-pool \
  --edition Standard \
  --capacity 100 \
  --db-dtu-min 0 \
  --db-dtu-max 10

# Move database to pool
az sql db update \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AdventureWorksLT \
  --elastic-pool dp300-pool
```

---

### Domain 4: Optimize Query Performance (15-20%)

#### Lab 4.1: Indexing Strategies
**Practice Tasks:**
- [ ] Create clustered and non-clustered indexes
- [ ] Implement filtered indexes
- [ ] Use columnstore indexes
- [ ] Analyze index usage DMVs
- [ ] Implement missing index recommendations

```sql
-- Create filtered index
CREATE NONCLUSTERED INDEX IX_Orders_RecentActive
ON Sales.SalesOrderHeader (OrderDate, TotalDue)
WHERE Status = 5 AND OrderDate > '2023-01-01';

-- Create columnstore index for analytics
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_Sales_Columnstore
ON Sales.SalesOrderDetail (
    SalesOrderID, ProductID, OrderQty, UnitPrice, LineTotal
);

-- Find missing indexes
SELECT 
    migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) AS improvement_measure,
    'CREATE INDEX IX_' + OBJECT_NAME(mid.object_id) + '_' + REPLACE(REPLACE(REPLACE(mid.equality_columns, ', ', '_'), '[', ''), ']', '') +
    ' ON ' + SCHEMA_NAME(o.schema_id) + '.' + OBJECT_NAME(mid.object_id) +
    ' (' + mid.equality_columns + ')' + 
    CASE WHEN mid.inequality_columns IS NOT NULL THEN ' INCLUDE (' + mid.inequality_columns + ')' ELSE '' END AS create_index_statement
FROM sys.dm_db_missing_index_groups mig
JOIN sys.dm_db_missing_index_group_stats migs ON migs.group_handle = mig.index_group_handle
JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
JOIN sys.objects o ON mid.object_id = o.object_id
ORDER BY improvement_measure DESC;
```

#### Lab 4.2: Query Optimization
**Practice Tasks:**
- [ ] Analyze query execution plans
- [ ] Use parameter sniffing detection
- [ ] Implement query hints
- [ ] Optimize JOIN operations
- [ ] Use batch mode vs row mode

```sql
-- Enable actual execution plan
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Example: Parameter sniffing issue
CREATE PROCEDURE GetOrdersByCustomer
    @CustomerID INT
AS
BEGIN
    -- Force recompile to avoid parameter sniffing
    SELECT *
    FROM Sales.SalesOrderHeader
    WHERE CustomerID = @CustomerID
    OPTION (RECOMPILE);
END;

-- Use query hint to force index
SELECT *
FROM Sales.SalesOrderHeader WITH (INDEX(IX_CustomerID))
WHERE CustomerID = 12345;
```

---

### Domain 5: Automate Tasks (10-15%)

#### Lab 5.1: Backup & Restore Automation
**Practice Tasks:**
- [ ] Configure automated backups
- [ ] Perform point-in-time restore
- [ ] Implement long-term retention (LTR)
- [ ] Copy database to another region
- [ ] Restore from geo-replica

```bash
# Configure long-term retention (weekly backup for 12 weeks)
az sql db ltr-policy set \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --database AdventureWorksLT \
  --weekly-retention P12W

# Point-in-time restore
az sql db restore \
  --dest-name AdventureWorksLT-Restored \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AdventureWorksLT \
  --time "2025-12-17T10:00:00"

# Copy database to another server
az sql db copy \
  --name AdventureWorksLT \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --dest-name AdventureWorksLT-Copy \
  --dest-resource-group dp300-practice-rg \
  --dest-server dp300-server2-XXXXX
```

#### Lab 5.2: Azure Automation & Runbooks
**Practice Tasks:**
- [ ] Create Automation Account
- [ ] Write PowerShell runbook for index maintenance
- [ ] Schedule automated tasks
- [ ] Implement SQL Agent jobs on Azure VM
- [ ] Use Azure Logic Apps for workflows

```powershell
# PowerShell runbook example: Index maintenance
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerName,
    
    [Parameter(Mandatory=$true)]
    [string]$DatabaseName
)

$connectionName = "AzureRunAsConnection"
$servicePrincipalConnection = Get-AutomationConnection -Name $connectionName

Connect-AzAccount -ServicePrincipal `
    -Tenant $servicePrincipalConnection.TenantId `
    -ApplicationId $servicePrincipalConnection.ApplicationId `
    -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint

# Rebuild fragmented indexes
$Query = @"
DECLARE @TableName NVARCHAR(255)
DECLARE @IndexName NVARCHAR(255)
DECLARE @Fragmentation FLOAT

DECLARE index_cursor CURSOR FOR
SELECT 
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 30

OPEN index_cursor
FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @Fragmentation

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @Fragmentation > 30
    BEGIN
        EXEC('ALTER INDEX ' + @IndexName + ' ON ' + @TableName + ' REBUILD')
    END
    
    FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @Fragmentation
END

CLOSE index_cursor
DEALLOCATE index_cursor
"@

Invoke-Sqlcmd -ServerInstance "$ServerName.database.windows.net" `
    -Database $DatabaseName `
    -Query $Query `
    -AccessToken (Get-AzAccessToken -ResourceUrl "https://database.windows.net/").Token
```

---

### Domain 6: High Availability & Disaster Recovery (15-20%)

#### Lab 6.1: Geo-Replication
**Practice Tasks:**
- [ ] Configure active geo-replication
- [ ] Perform planned failover
- [ ] Test unplanned failover
- [ ] Set up auto-failover groups
- [ ] Configure read-only routing

```bash
# Create secondary database (geo-replica)
az sql db replica create \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AdventureWorksLT \
  --partner-resource-group dp300-practice-rg \
  --partner-server dp300-server2-westus \
  --service-objective S0

# Create auto-failover group
az sql failover-group create \
  --name dp300-failover-group \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --partner-resource-group dp300-practice-rg \
  --partner-server dp300-server2-westus \
  --failover-policy Automatic \
  --grace-period 1 \
  --add-db AdventureWorksLT

# Initiate failover
az sql failover-group set-primary \
  --name dp300-failover-group \
  --resource-group dp300-practice-rg \
  --server dp300-server2-westus
```

#### Lab 6.2: Backup/Restore Strategies
**Practice Tasks:**
- [ ] Configure geo-redundant backup storage
- [ ] Restore deleted database
- [ ] Perform geo-restore to different region
- [ ] Test backup encryption
- [ ] Implement custom backup schedule on VM

```bash
# Geo-restore database to different region
az sql db restore \
  --dest-name AdventureWorksLT-GeoRestore \
  --resource-group dp300-practice-rg \
  --server dp300-server-westus \
  --name AdventureWorksLT \
  --geo-backup-id $(az sql db show --name AdventureWorksLT --server dp300-server-XXXXX --resource-group dp300-practice-rg --query id -o tsv)

# Restore deleted database
az sql db restore \
  --dest-name AdventureWorksLT-Recovered \
  --resource-group dp300-practice-rg \
  --server dp300-server-XXXXX \
  --name AdventureWorksLT \
  --deleted-time "2025-12-17T15:30:00"
```

---

## Local Practice Environment Setup

### Option 1: Docker SQL Server (Recommended for Mac)
```bash
# Run SQL Server 2022 in Docker
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=P@ssw0rd123!" \
  -p 1433:1433 --name dp300-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Connect using Azure Data Studio
# Server: localhost,1433
# Auth: SQL Login
# User: sa
# Password: P@ssw0rd123!
```

### Option 2: Azure Data Studio Extensions
Install these extensions:
- SQL Database Projects
- Azure SQL Migration
- Query Plan Viewer
- SQL Server Profiler
- Admin Pack for SQL Server

---

## Weekly Study Schedule (8-week plan)

### Week 1-2: Core Azure SQL Fundamentals
- Deploy all three platforms (Database, MI, VM)
- Practice using Portal, CLI, PowerShell, ARM templates
- Configure authentication and firewall rules
- Set up monitoring and alerts

### Week 3-4: Security & Compliance
- Implement all encryption methods (TDE, Always Encrypted)
- Configure RLS and DDM
- Set up auditing and threat detection
- Practice Azure AD integration

### Week 5-6: Performance Tuning
- Work with Query Store extensively
- Practice index optimization
- Analyze execution plans
- Configure automatic tuning

### Week 7: High Availability & DR
- Set up geo-replication
- Practice failover scenarios
- Test backup/restore operations
- Configure LTR policies

### Week 8: Automation & Review
- Create PowerShell/CLI scripts for common tasks
- Build automation runbooks
- Practice exam questions
- Review weak areas

---

## Cost Management Script

Save this as `cleanup-dp300-resources.sh`:

```bash
#!/bin/bash
# Cleanup script - run daily to avoid charges

echo "🧹 Cleaning up DP-300 practice resources..."

# Delete all resource groups with dp300 tag
az group list --tag Purpose=DP300-Practice --query "[].name" -o tsv | while read rg; do
    echo "Deleting resource group: $rg"
    az group delete --name $rg --yes --no-wait
done

# Stop/deallocate VMs (if keeping for tomorrow)
az vm list --query "[?tags.Purpose=='DP300-Practice'].{Name:name, RG:resourceGroup}" -o table | while read vm rg; do
    echo "Stopping VM: $vm in $rg"
    az vm deallocate --name $vm --resource-group $rg --no-wait
done

# Delete SQL Managed Instances immediately (expensive!)
az sql mi list --query "[].{Name:name, RG:resourceGroup}" -o table | while read mi rg; do
    echo "⚠️  DELETING EXPENSIVE Managed Instance: $mi"
    az sql mi delete --name $mi --resource-group $rg --yes --no-wait
done

echo "✅ Cleanup initiated. Resources will be deleted in background."
```

---

## Exam Preparation Resources

### Official Microsoft Learning Paths:
1. **MS Learn:** https://learn.microsoft.com/certifications/exams/dp-300
2. **Microsoft Virtual Training Days** (free)
3. **Microsoft Official Courseware:** DP-300T00

### Practice Exams:
- MeasureUp (official practice tests)
- Whizlabs DP-300 practice exams
- Udemy practice tests

### Books:
- "Exam Ref DP-300 Administering Microsoft Azure SQL Solutions"
- Microsoft documentation (primary resource)

### Video Training:
- Pluralsight: Azure SQL Database courses
- A Cloud Guru: DP-300 course
- YouTube: Microsoft Azure channel

---

## Exam Day Tips

1. **Focus Areas** (based on exam weight):
   - Performance monitoring & optimization (30-35%)
   - High availability & DR (15-20%)
   - Security implementation (15-20%)

2. **Common Gotchas:**
   - Difference between SQL Database vs Managed Instance features
   - Azure AD authentication configuration
   - Geo-replication setup and failover groups
   - Query Store configuration options
   - Automatic tuning capabilities

3. **Hands-On is Critical:**
   - You CANNOT pass without actual Azure experience
   - Set up labs every day, even if just for 30 minutes
   - Break things and fix them - this is how you learn

4. **Time Management:**
   - 180 minutes for ~50-60 questions
   - Mark unclear questions and return later
   - Case study questions take longest - do last

---

## Next Steps

1. **Today:** Create Azure free account
2. **Tomorrow:** Deploy first SQL Database with AdventureWorks
3. **This Week:** Complete Domain 1 labs (deployment)
4. **Week 2:** Start security labs
5. **Schedule Exam:** 6-8 weeks from now

**Let me know when you're ready to start, and I'll guide you through the first Azure deployment step-by-step!**
