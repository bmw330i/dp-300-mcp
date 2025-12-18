# SQL Agent Jobs - Complete DP-300 Study Guide

## Overview

**SQL Agent** is the built-in job scheduling and automation service in SQL Server. It's critical for DP-300 exam Domain 4: "Configure and manage automation of tasks".

### Platform Availability
- ✅ **SQL Server on-premises** - Full support
- ✅ **SQL Server on Azure VMs** - Full support
- ✅ **Azure SQL Managed Instance** - Full support
- ❌ **Azure SQL Database** - NOT supported (use Elastic Jobs, Azure Automation, or Logic Apps)

### Oracle Equivalent
```sql
-- Oracle: DBMS_SCHEDULER
BEGIN
  DBMS_SCHEDULER.CREATE_JOB (
    job_name        => 'NIGHTLY_STATS_UPDATE',
    job_type        => 'PLSQL_BLOCK',
    job_action      => 'BEGIN DBMS_STATS.GATHER_SCHEMA_STATS(''HR''); END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY; BYHOUR=2',
    enabled         => TRUE
  );
END;
```

---

## 1. SQL Agent Jobs

### Create a Simple Job (T-SQL)

```sql
USE msdb;
GO

-- Create a job
EXEC sp_add_job 
    @job_name = 'DailyStatsUpdate',
    @enabled = 1,
    @description = 'Updates statistics on all user tables daily',
    @category_name = 'Database Maintenance';
GO

-- Add a job step
EXEC sp_add_jobstep
    @job_name = 'DailyStatsUpdate',
    @step_name = 'Update Statistics',
    @subsystem = 'TSQL',
    @command = 'EXEC sp_updatestats;',
    @database_name = 'AdventureWorks',
    @retry_attempts = 3,
    @retry_interval = 5,  -- minutes
    @on_success_action = 1,  -- Quit with success
    @on_fail_action = 2;     -- Quit with failure
GO

-- Create a schedule
EXEC sp_add_schedule
    @schedule_name = 'EveryDayAt2AM',
    @freq_type = 4,  -- Daily
    @freq_interval = 1,  -- Every 1 day
    @active_start_time = 020000;  -- 2:00 AM
GO

-- Attach schedule to job
EXEC sp_attach_schedule
    @job_name = 'DailyStatsUpdate',
    @schedule_name = 'EveryDayAt2AM';
GO

-- Assign job to local server
EXEC sp_add_jobserver
    @job_name = 'DailyStatsUpdate',
    @server_name = N'(local)';
GO
```

### Multi-Step Job Example

```sql
-- Create maintenance job with multiple steps
EXEC sp_add_job 
    @job_name = 'NightlyMaintenance',
    @enabled = 1,
    @description = 'Complete database maintenance workflow';
GO

-- Step 1: Backup databases
EXEC sp_add_jobstep
    @job_name = 'NightlyMaintenance',
    @step_name = 'Backup All Databases',
    @step_id = 1,
    @subsystem = 'TSQL',
    @command = '
        DECLARE @name VARCHAR(50);
        DECLARE @path VARCHAR(256);
        DECLARE db_cursor CURSOR FOR  
        SELECT name FROM sys.databases 
        WHERE name NOT IN (''master'',''tempdb'',''model'',''msdb'');

        OPEN db_cursor;
        FETCH NEXT FROM db_cursor INTO @name;

        WHILE @@FETCH_STATUS = 0  
        BEGIN  
            SET @path = ''C:\Backup\'' + @name + ''.bak'';
            BACKUP DATABASE @name TO DISK = @path WITH COMPRESSION;
            FETCH NEXT FROM db_cursor INTO @name;
        END;

        CLOSE db_cursor;
        DEALLOCATE db_cursor;
    ',
    @on_success_action = 3;  -- Go to next step
GO

-- Step 2: Rebuild indexes
EXEC sp_add_jobstep
    @job_name = 'NightlyMaintenance',
    @step_name = 'Rebuild Fragmented Indexes',
    @step_id = 2,
    @subsystem = 'TSQL',
    @command = '
        DECLARE @TableName VARCHAR(255);
        DECLARE @IndexName VARCHAR(255);
        DECLARE @FragPercent FLOAT;

        DECLARE index_cursor CURSOR FOR
        SELECT 
            OBJECT_NAME(ips.object_id) AS TableName,
            i.name AS IndexName,
            ips.avg_fragmentation_in_percent
        FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, ''LIMITED'') ips
        INNER JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
        WHERE ips.avg_fragmentation_in_percent > 30
          AND i.name IS NOT NULL;

        OPEN index_cursor;
        FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @FragPercent;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC(''ALTER INDEX '' + @IndexName + '' ON '' + @TableName + '' REBUILD'');
            FETCH NEXT FROM index_cursor INTO @TableName, @IndexName, @FragPercent;
        END;

        CLOSE index_cursor;
        DEALLOCATE index_cursor;
    ',
    @on_success_action = 3;  -- Go to next step
GO

-- Step 3: Update statistics
EXEC sp_add_jobstep
    @job_name = 'NightlyMaintenance',
    @step_name = 'Update Statistics',
    @step_id = 3,
    @subsystem = 'TSQL',
    @command = 'EXEC sp_updatestats;',
    @on_success_action = 1;  -- Quit with success
GO
```

---

## 2. Job Schedules

### Schedule Types

```sql
-- Daily at 2 AM
EXEC sp_add_schedule
    @schedule_name = 'EveryDayAt2AM',
    @freq_type = 4,  -- Daily
    @freq_interval = 1,
    @active_start_time = 020000;

-- Weekly on Sunday at midnight
EXEC sp_add_schedule
    @schedule_name = 'SundayMidnight',
    @freq_type = 8,  -- Weekly
    @freq_interval = 1,  -- Sunday (1=Sunday, 2=Monday, etc.)
    @freq_recurrence_factor = 1,  -- Every week
    @active_start_time = 000000;

-- Monthly on 15th at 6 PM
EXEC sp_add_schedule
    @schedule_name = 'MonthlyOn15th',
    @freq_type = 16,  -- Monthly
    @freq_interval = 15,  -- Day of month
    @active_start_time = 180000;

-- Every 30 minutes
EXEC sp_add_schedule
    @schedule_name = 'Every30Minutes',
    @freq_type = 4,  -- Daily
    @freq_interval = 1,
    @freq_subday_type = 4,  -- Minutes
    @freq_subday_interval = 30,
    @active_start_time = 000000,
    @active_end_time = 235959;

-- On SQL Server startup
EXEC sp_add_schedule
    @schedule_name = 'OnStartup',
    @freq_type = 64;  -- When SQL Server Agent starts
```

### Schedule Frequency Type Reference

| @freq_type | Description |
|------------|-------------|
| 1 | Once (one-time execution) |
| 4 | Daily |
| 8 | Weekly |
| 16 | Monthly |
| 32 | Monthly, relative to @freq_interval |
| 64 | When SQL Server Agent starts |
| 128 | When computer is idle |

---

## 3. Operators (Notification Recipients)

```sql
-- Create an operator
EXEC sp_add_operator
    @name = 'DBA_OnCall',
    @enabled = 1,
    @email_address = 'dba@company.com',
    @pager_address = 'dba_pager@company.com',
    @weekday_pager_start_time = 090000,  -- 9 AM
    @weekday_pager_end_time = 180000,    -- 6 PM
    @pager_days = 62;  -- Monday-Friday (2+4+8+16+32)
GO

-- Add notification to job
EXEC sp_add_notification
    @job_name = 'DailyStatsUpdate',
    @operator_name = 'DBA_OnCall',
    @notification_method = 1;  -- 1=Email, 2=Pager, 4=Net send, 7=All
GO

-- Configure failure notification
EXEC sp_update_job
    @job_name = 'DailyStatsUpdate',
    @notify_level_email = 2;  -- 0=Never, 1=On success, 2=On failure, 3=Always
GO
```

---

## 4. Alerts

### Alert on Error Severity

```sql
-- Alert on fatal errors (severity 21+)
EXEC sp_add_alert
    @name = 'Severity21_FatalError',
    @message_id = 0,
    @severity = 21,
    @enabled = 1,
    @delay_between_responses = 60,  -- seconds
    @include_event_description_in = 1;  -- Email
GO

-- Notify operator
EXEC sp_add_notification
    @alert_name = 'Severity21_FatalError',
    @operator_name = 'DBA_OnCall',
    @notification_method = 1;  -- Email
GO
```

### Alert on Specific Error

```sql
-- Alert on error 823 (I/O error)
EXEC sp_add_alert
    @name = 'IOError_823',
    @message_id = 823,
    @enabled = 1,
    @delay_between_responses = 60,
    @include_event_description_in = 1;
GO
```

### Performance Condition Alert

```sql
-- Alert when CPU > 80%
EXEC sp_add_alert
    @name = 'HighCPU_80Percent',
    @performance_condition = 'Processor|% Processor Time|_Total|>|80',
    @enabled = 1,
    @delay_between_responses = 300;  -- 5 minutes
GO
```

---

## 5. Proxies (Security Context)

```sql
-- Create credential (stores Windows account)
CREATE CREDENTIAL PowerShellCred
WITH IDENTITY = 'DOMAIN\ServiceAccount',
SECRET = 'P@ssw0rd!';
GO

-- Create proxy using credential
EXEC sp_add_proxy
    @proxy_name = 'PowerShellProxy',
    @credential_name = 'PowerShellCred',
    @enabled = 1,
    @description = 'Proxy for PowerShell job steps';
GO

-- Grant proxy access to PowerShell subsystem
EXEC sp_grant_proxy_to_subsystem
    @proxy_name = 'PowerShellProxy',
    @subsystem_id = 12;  -- 12 = PowerShell
GO

-- Grant proxy to SQL Agent role
EXEC sp_grant_login_to_proxy
    @proxy_name = 'PowerShellProxy',
    @login_name = 'DOMAIN\SQLAgentUser';
GO
```

### Job Step with Proxy

```sql
EXEC sp_add_jobstep
    @job_name = 'PowerShellJob',
    @step_name = 'Run PowerShell Script',
    @subsystem = 'PowerShell',
    @command = 'Get-Process | Where-Object {$_.CPU -gt 100}',
    @proxy_name = 'PowerShellProxy';  -- Use proxy
GO
```

---

## 6. Job Management

### Execute Job Manually

```sql
-- Run job immediately
EXEC sp_start_job @job_name = 'DailyStatsUpdate';
GO
```

### Stop Running Job

```sql
-- Stop job
EXEC sp_stop_job @job_name = 'DailyStatsUpdate';
GO
```

### Enable/Disable Job

```sql
-- Disable job
EXEC sp_update_job
    @job_name = 'DailyStatsUpdate',
    @enabled = 0;
GO

-- Enable job
EXEC sp_update_job
    @job_name = 'DailyStatsUpdate',
    @enabled = 1;
GO
```

### Delete Job

```sql
-- Delete job (and all steps, schedules, history)
EXEC sp_delete_job
    @job_name = 'DailyStatsUpdate',
    @delete_history = 1,
    @delete_unused_schedule = 1;
GO
```

---

## 7. Monitoring and Troubleshooting

### View All Jobs

```sql
-- List all jobs
SELECT 
    j.job_id,
    j.name AS job_name,
    j.enabled,
    j.description,
    j.date_created,
    j.date_modified,
    SUSER_SNAME(j.owner_sid) AS job_owner
FROM msdb.dbo.sysjobs j
ORDER BY j.name;
```

### View Job History

```sql
-- View last 10 job executions
SELECT TOP 10
    j.name AS job_name,
    jh.step_name,
    jh.run_date,
    jh.run_time,
    jh.run_status,  -- 0=Failed, 1=Succeeded, 2=Retry, 3=Canceled
    jh.run_duration,
    jh.message
FROM msdb.dbo.sysjobhistory jh
INNER JOIN msdb.dbo.sysjobs j ON jh.job_id = j.job_id
WHERE jh.step_id = 0  -- Overall job outcome (not individual steps)
ORDER BY jh.run_date DESC, jh.run_time DESC;
```

### Check Job Status

```sql
-- Check if job is currently running
SELECT 
    j.name AS job_name,
    ja.start_execution_date,
    DATEDIFF(MINUTE, ja.start_execution_date, GETDATE()) AS running_minutes,
    ja.last_executed_step_id,
    js.step_name
FROM msdb.dbo.sysjobactivity ja
INNER JOIN msdb.dbo.sysjobs j ON ja.job_id = j.job_id
INNER JOIN msdb.dbo.sysjobsteps js ON ja.job_id = js.job_id 
    AND ja.last_executed_step_id = js.step_id
WHERE ja.start_execution_date IS NOT NULL
  AND ja.stop_execution_date IS NULL  -- Still running
ORDER BY ja.start_execution_date DESC;
```

### View Job Schedules

```sql
-- List job schedules
SELECT 
    j.name AS job_name,
    s.name AS schedule_name,
    s.enabled,
    CASE s.freq_type
        WHEN 1 THEN 'Once'
        WHEN 4 THEN 'Daily'
        WHEN 8 THEN 'Weekly'
        WHEN 16 THEN 'Monthly'
        WHEN 32 THEN 'Monthly relative'
        WHEN 64 THEN 'On SQL Agent startup'
    END AS frequency,
    s.active_start_time
FROM msdb.dbo.sysjobs j
INNER JOIN msdb.dbo.sysjobschedules js ON j.job_id = js.job_id
INNER JOIN msdb.dbo.sysschedules s ON js.schedule_id = s.schedule_id
ORDER BY j.name, s.name;
```

---

## 8. DP-300 Exam Tips

### Common Exam Scenarios

#### Scenario 1: Nightly Maintenance
**Question:** "Run index maintenance every night at 2 AM. Notify DBA on failure."

**Answer:**
1. Create SQL Agent Job
2. Add job step (T-SQL: ALTER INDEX REBUILD)
3. Create schedule (Daily, 2 AM)
4. Create operator (DBA email)
5. Add notification (on failure)

#### Scenario 2: Alert on Corruption
**Question:** "Alert DBA when corruption error 824 occurs."

**Answer:**
1. Create SQL Agent Alert (message_id = 824)
2. Create operator (DBA)
3. Add notification to alert

#### Scenario 3: PowerShell as Service Account
**Question:** "Run PowerShell script as domain service account."

**Answer:**
1. Create credential (domain\serviceaccount)
2. Create proxy (use credential)
3. Grant proxy to PowerShell subsystem
4. Create job step (use proxy)

#### Scenario 4: Multi-Step Workflow
**Question:** "Backup → Rebuild indexes → Update stats. Stop if any step fails."

**Answer:**
1. Create job with 3 steps
2. Step 1: @on_success_action = 3 (next step), @on_fail_action = 2 (quit)
3. Step 2: @on_success_action = 3, @on_fail_action = 2
4. Step 3: @on_success_action = 1 (quit success)

### Key Stored Procedures (Memorize)

| Stored Procedure | Purpose |
|-----------------|---------|
| `sp_add_job` | Create job |
| `sp_add_jobstep` | Add step to job |
| `sp_add_schedule` | Create schedule |
| `sp_attach_schedule` | Attach schedule to job |
| `sp_add_operator` | Create operator |
| `sp_add_notification` | Add notification |
| `sp_add_alert` | Create alert |
| `sp_add_proxy` | Create proxy |
| `sp_start_job` | Execute job |
| `sp_stop_job` | Stop job |
| `sp_delete_job` | Delete job |
| `sp_update_job` | Modify job |

### Important System Tables

| Table | Purpose |
|-------|---------|
| `msdb.dbo.sysjobs` | All jobs |
| `msdb.dbo.sysjobsteps` | Job steps |
| `msdb.dbo.sysjobschedules` | Job-schedule relationships |
| `msdb.dbo.sysschedules` | Schedules |
| `msdb.dbo.sysjobhistory` | Execution history |
| `msdb.dbo.sysoperators` | Operators |
| `msdb.dbo.sysalerts` | Alerts |
| `msdb.dbo.sysproxies` | Proxies |
| `msdb.dbo.sysjobactivity` | Currently running jobs |

---

## 9. Azure SQL Database Alternatives

Since SQL Agent is NOT available in Azure SQL Database, use these alternatives:

### Elastic Database Jobs

```powershell
# Create job agent (alternative to SQL Agent)
$jobAgent = New-AzSqlElasticJobAgent `
    -ResourceGroupName "dp300-practice-rg" `
    -ServerName "dp300-server" `
    -Name "elasticjobs-agent" `
    -DatabaseName "JobsDB"

# Create job
$job = New-AzSqlElasticJob `
    -ResourceGroupName "dp300-practice-rg" `
    -ServerName "dp300-server" `
    -AgentName "elasticjobs-agent" `
    -Name "DailyStatsUpdate"

# Add job step
$jobStep = Add-AzSqlElasticJobStep `
    -ResourceGroupName "dp300-practice-rg" `
    -ServerName "dp300-server" `
    -AgentName "elasticjobs-agent" `
    -JobName "DailyStatsUpdate" `
    -StepName "UpdateStats" `
    -CommandText "EXEC sp_updatestats;"
```

### Azure Automation Runbook

```powershell
# PowerShell runbook to run T-SQL
$connectionName = "AzureRunAsConnection"
$servicePrincipalConnection = Get-AutomationConnection -Name $connectionName

Invoke-Sqlcmd -ServerInstance "dp300-server.database.windows.net" `
              -Database "AdventureWorksLT" `
              -Query "EXEC sp_updatestats;" `
              -Username $servicePrincipalConnection.ApplicationId `
              -Password $servicePrincipalConnection.CertificateThumbprint
```

---

## Summary for DP-300 Exam

**SQL Agent Components:** Jobs, Steps, Schedules, Alerts, Operators, Proxies

**Key Concepts:**
- Jobs contain steps
- Steps execute in sequence
- Schedules trigger jobs
- Alerts respond to events
- Operators receive notifications
- Proxies provide security context

**Platform Availability:**
- ✅ SQL MI, SQL VMs
- ❌ Azure SQL Database (use Elastic Jobs, Automation)

**Exam Frequency:** ⭐⭐⭐⭐⭐ (Very High - Critical topic!)
