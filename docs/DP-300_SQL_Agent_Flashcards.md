# SQL Agent Jobs - Quick Reference Flashcards

## Component Flashcards

### Q1: What are the 6 main components of SQL Agent?
**A:** Jobs, Job Steps, Schedules, Alerts, Operators, Proxies

---

### Q2: What is a SQL Agent Job?
**A:** A container for automated tasks that can have multiple steps, schedules, and notifications.

---

### Q3: What types of job steps are available?
**A:** T-SQL script, PowerShell, SSIS package, Operating System command, Analysis Services query, Replication tasks

---

### Q4: What is an Operator?
**A:** A person or group who receives notifications (email, pager) when jobs fail or alerts fire.

---

### Q5: What is a Proxy?
**A:** A security credential that allows jobs to run under a different Windows account (not SQL Server service account).

---

## Stored Procedure Flashcards

### Q6: Create a new job?
**A:** `sp_add_job @job_name = 'JobName', @enabled = 1`

---

### Q7: Add a step to a job?
**A:** `sp_add_jobstep @job_name = 'JobName', @step_name = 'Step1', @subsystem = 'TSQL', @command = 'SELECT 1'`

---

### Q8: Create a daily schedule?
**A:** `sp_add_schedule @schedule_name = 'Daily', @freq_type = 4, @freq_interval = 1, @active_start_time = 020000`

---

### Q9: Attach schedule to job?
**A:** `sp_attach_schedule @job_name = 'JobName', @schedule_name = 'Daily'`

---

### Q10: Create an operator?
**A:** `sp_add_operator @name = 'DBA', @enabled = 1, @email_address = 'dba@company.com'`

---

### Q11: Add notification to job?
**A:** `sp_add_notification @job_name = 'JobName', @operator_name = 'DBA', @notification_method = 1`

---

### Q12: Run a job immediately?
**A:** `sp_start_job @job_name = 'JobName'`

---

### Q13: Stop a running job?
**A:** `sp_stop_job @job_name = 'JobName'`

---

### Q14: Delete a job?
**A:** `sp_delete_job @job_name = 'JobName', @delete_history = 1`

---

## Schedule Type Flashcards

### Q15: What does @freq_type = 4 mean?
**A:** Daily

---

### Q16: What does @freq_type = 8 mean?
**A:** Weekly

---

### Q17: What does @freq_type = 16 mean?
**A:** Monthly

---

### Q18: What does @freq_type = 64 mean?
**A:** When SQL Server Agent starts

---

### Q19: How do you schedule a job every 30 minutes?
**A:** `@freq_type = 4` (daily), `@freq_subday_type = 4` (minutes), `@freq_subday_interval = 30`

---

## Alert Flashcards

### Q20: Create alert on severity 21?
**A:** `sp_add_alert @name = 'Sev21', @severity = 21, @enabled = 1`

---

### Q21: Create alert on error 823?
**A:** `sp_add_alert @name = 'Error823', @message_id = 823, @enabled = 1`

---

### Q22: What are the 3 types of SQL Agent alerts?
**A:** SQL Server event alerts, Performance condition alerts, WMI event alerts

---

### Q23: Alert when CPU > 80%?
**A:** `sp_add_alert @name = 'HighCPU', @performance_condition = 'Processor|% Processor Time|_Total|>|80'`

---

## Monitoring Flashcards

### Q24: Which table stores job definitions?
**A:** `msdb.dbo.sysjobs`

---

### Q25: Which table stores job execution history?
**A:** `msdb.dbo.sysjobhistory`

---

### Q26: Which table shows currently running jobs?
**A:** `msdb.dbo.sysjobactivity`

---

### Q27: What does run_status = 0 mean in sysjobhistory?
**A:** Failed

---

### Q28: What does run_status = 1 mean?
**A:** Succeeded

---

### Q29: How to view last 10 job executions?
```sql
SELECT TOP 10 j.name, jh.run_date, jh.run_status, jh.message
FROM msdb.dbo.sysjobhistory jh
INNER JOIN msdb.dbo.sysjobs j ON jh.job_id = j.job_id
WHERE jh.step_id = 0
ORDER BY jh.run_date DESC, jh.run_time DESC;
```

---

## Action Code Flashcards

### Q30: What does @on_success_action = 1 mean?
**A:** Quit the job reporting success

---

### Q31: What does @on_success_action = 3 mean?
**A:** Go to the next step

---

### Q32: What does @on_fail_action = 2 mean?
**A:** Quit the job reporting failure

---

### Q33: What does @notify_level_email = 2 mean?
**A:** Send email notification on failure

---

### Q34: What does @notify_level_email = 3 mean?
**A:** Send email notification always (success or failure)

---

## Platform Flashcards

### Q35: Is SQL Agent available in Azure SQL Database?
**A:** NO - Use Elastic Jobs, Azure Automation, or Logic Apps instead

---

### Q36: Is SQL Agent available in Azure SQL Managed Instance?
**A:** YES - Full SQL Agent support

---

### Q37: Is SQL Agent available in SQL Server on Azure VMs?
**A:** YES - Full SQL Agent support

---

### Q38: What's the Azure SQL Database alternative to SQL Agent?
**A:** Elastic Database Jobs, Azure Automation Runbooks, Azure Logic Apps, Azure Data Factory

---

## Proxy Flashcards

### Q39: Why use a proxy?
**A:** To run job steps under a different Windows account (for security or permissions)

---

### Q40: What subsystem uses proxies most often?
**A:** PowerShell (subsystem_id = 12)

---

### Q41: Create a credential for proxy?
```sql
CREATE CREDENTIAL MyCred 
WITH IDENTITY = 'DOMAIN\User', 
SECRET = 'Password';
```

---

### Q42: Create a proxy?
```sql
EXEC sp_add_proxy 
    @proxy_name = 'MyProxy',
    @credential_name = 'MyCred',
    @enabled = 1;
```

---

## Scenario Flashcards

### Q43: Scenario: Rebuild indexes every Sunday at 2 AM
**A:** 
1. Create job with T-SQL step: `ALTER INDEX ALL ON [Table] REBUILD`
2. Create schedule: `@freq_type = 8` (weekly), `@freq_interval = 1` (Sunday), `@active_start_time = 020000`
3. Attach schedule to job

---

### Q44: Scenario: Alert DBA when deadlock occurs
**A:**
1. Create operator with DBA email
2. Create alert: `sp_add_alert @message_id = 1205` (deadlock)
3. Add notification to alert

---

### Q45: Scenario: Multi-step maintenance job
**A:**
- Step 1 (Backup): `@on_success_action = 3` (next step), `@on_fail_action = 2` (quit)
- Step 2 (Rebuild): `@on_success_action = 3`, `@on_fail_action = 2`
- Step 3 (Stats): `@on_success_action = 1` (quit success)

---

### Q46: Scenario: Run PowerShell as service account
**A:**
1. Create credential with service account
2. Create proxy using credential
3. Grant proxy to PowerShell subsystem
4. Job step uses `@proxy_name`

---

## Troubleshooting Flashcards

### Q47: Job runs on demand but not on schedule. Why?
**A:** 
- SQL Server Agent service not running
- Schedule not attached to job
- Schedule disabled
- Job disabled

---

### Q48: How to check if SQL Agent service is running?
```sql
EXEC xp_servicecontrol 'QueryState', 'SQLServerAGENT';
```

---

### Q49: Job fails with "permission denied". What to check?
**A:**
- Job owner has necessary permissions
- If using proxy, proxy has correct permissions
- Database context is correct

---

### Q50: Where are SQL Agent logs?
**A:** SQL Server Error Log (also viewable in SQL Server Management Studio → SQL Server Agent → Error Logs)

---

## Oracle DBA Comparison

### Q51: Oracle DBMS_SCHEDULER equivalent in SQL Server?
**A:** SQL Agent Jobs

---

### Q52: Oracle DBA_SCHEDULER_JOBS equivalent?
**A:** `msdb.dbo.sysjobs`

---

### Q53: Oracle DBA_SCHEDULER_JOB_RUN_DETAILS equivalent?
**A:** `msdb.dbo.sysjobhistory`

---

### Q54: Oracle DBMS_SCHEDULER.RUN_JOB equivalent?
**A:** `sp_start_job`

---

### Q55: Oracle cron job equivalent in Windows/SQL Server?
**A:** SQL Agent Job with schedule or Windows Task Scheduler

---

## Exam Tips

### Q56: Most common exam mistake about SQL Agent?
**A:** Confusing which platforms support it (Remember: NOT Azure SQL Database!)

### Q57: Key exam topics for SQL Agent?
**A:** 
- Creating jobs and schedules
- Configuring alerts (severity, error number, performance)
- Setting up notifications
- Multi-step jobs with success/failure actions
- Using proxies for security

### Q58: How many times is SQL Agent tested on DP-300?
**A:** High frequency - expect 5-10 questions on automation and SQL Agent

### Q59: What's the #1 thing to remember?
**A:** SQL Agent = NOT in Azure SQL Database. Use Elastic Jobs instead!

### Q60: Quick decision tree for exam questions?
```
Question about automation?
  ↓
Platform check:
  • Azure SQL Database → Elastic Jobs, Automation, Logic Apps
  • SQL MI or SQL VM → SQL Agent Jobs
  ↓
Need to run on schedule? → Job + Schedule
Need to alert on event? → Alert + Operator
Need security context? → Proxy
Need notification? → Operator + Notification
```
