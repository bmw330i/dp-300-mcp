# DP-300 Performance Views Cheat Sheet (Oracle DBA Edition)

## 🎯 Your Weak Spots (Performance Monitoring)
- Dynamic Management Views (DMVs) and system views
- Resource pools and resource governance
- Query Store usage
- Wait statistics and bottleneck identification

## 📊 Oracle to Azure SQL View Mapping

### Query Performance (Oracle → SQL Server)

| Oracle Concept | Azure SQL Equivalent | What to Query |
|----------------|---------------------|---------------|
| `V$SQL` (SQL in SGA) | `sys.dm_exec_query_stats` | Find expensive queries by CPU, I/O |
| `V$SQL_PLAN` | `sys.dm_exec_query_plan` | Get execution plans |
| `V$SQL_TEXT` | `sys.dm_exec_sql_text` | Get actual SQL text |
| `V$SESSION` | `sys.dm_exec_sessions` | Active sessions |
| `V$SESSION_WAIT` | `sys.dm_os_wait_stats` | Wait events (PAGEIOLATCH, LCK_M_X) |
| `V$SYSTEM_EVENT` | `sys.dm_os_wait_stats` (aggregated) | System-wide waits |
| `DBA_HIST_ACTIVE_SESS_HISTORY` | **Query Store** | Historical query performance |
| `V$LOCK` | `sys.dm_tran_locks` | Lock information |
| `V$LOCKED_OBJECT` | `sys.dm_tran_locks` + joins | Objects being locked |

### Index Statistics (Oracle → SQL Server)

| Oracle View | Azure SQL View | Purpose |
|-------------|----------------|---------|
| `DBA_INDEXES` | `sys.indexes` | Index metadata |
| `DBA_IND_STATISTICS` | `sys.dm_db_index_usage_stats` | Index usage (seeks, scans) |
| `DBA_IND_STATISTICS` | `sys.dm_db_index_physical_stats` | Fragmentation % |
| `DBA_IND_COLUMNS` | `sys.index_columns` | Index column order |

### Storage & I/O (Oracle → SQL Server)

| Oracle View | Azure SQL View | Purpose |
|-------------|----------------|---------|
| `V$DATAFILE` | `sys.database_files` | File sizes, growth |
| `V$FILESTAT` | `sys.dm_io_virtual_file_stats` | I/O stats per file |
| `V$TEMP_SPACE_HEADER` | `sys.dm_db_task_space_usage` | Tempdb usage |
| `DBA_TABLESPACES` | `sys.filegroups` | Storage organization |

### Resource Management (Oracle → SQL Server)

| Oracle Resource Manager | Azure SQL Resource Pools | Purpose |
|------------------------|-------------------------|---------|
| `DBA_RSRC_CONSUMER_GROUPS` | `sys.dm_resource_governor_resource_pools` | Resource pool stats |
| `V$RSRC_CONSUMER_GROUP` | `sys.dm_resource_governor_workload_groups` | Workload group stats |
| `V$RSRCMGRMETRIC` | `sys.dm_resource_governor_resource_pool_affinity` | CPU affinity |

---

## 🔥 TOP 10 DMVs for DP-300 Exam (Memorize These!)

### 1. Find Top CPU Consuming Queries
```sql
-- Oracle: SELECT * FROM V$SQL ORDER BY CPU_TIME DESC
-- Azure SQL:
SELECT TOP 10
    qs.total_worker_time / qs.execution_count AS avg_cpu_time,
    qs.execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY qs.total_worker_time DESC;
```
**Exam Tip**: If question asks "query using most CPU", use `sys.dm_exec_query_stats` + `total_worker_time`

### 2. Find Top I/O Consuming Queries
```sql
-- Oracle: V$SQL.DISK_READS
-- Azure SQL:
SELECT TOP 10
    (qs.total_logical_reads + qs.total_logical_writes) / qs.execution_count AS avg_io,
    qs.execution_count,
    SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(st.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY (qs.total_logical_reads + qs.total_logical_writes) DESC;
```
**Exam Tip**: Logical reads = buffer pool reads (most important metric)

### 3. Identify Wait Statistics (Bottlenecks)
```sql
-- Oracle: V$SESSION_WAIT, V$SYSTEM_EVENT
-- Azure SQL:
SELECT TOP 20
    wait_type,
    wait_time_ms / 1000.0 AS wait_time_sec,
    (wait_time_ms / SUM(wait_time_ms) OVER()) * 100 AS pct,
    waiting_tasks_count
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN (
    'CLR_SEMAPHORE', 'LAZYWRITER_SLEEP', 'RESOURCE_QUEUE',
    'SLEEP_TASK', 'SLEEP_SYSTEMTASK', 'SQLTRACE_BUFFER_FLUSH', 'WAITFOR'
)
ORDER BY wait_time_ms DESC;
```

**Common Wait Types (Exam Favorites):**
| Wait Type | Meaning | Solution |
|-----------|---------|----------|
| `PAGEIOLATCH_*` | Disk I/O waits | Add indexes, scale storage |
| `LCK_M_X` | Exclusive lock waits | Tune queries, reduce transaction time |
| `CXPACKET` | Parallel query waits | Adjust MAXDOP |
| `ASYNC_NETWORK_IO` | Client not consuming results | Fix application |
| `WRITELOG` | Log write waits | Faster storage, batch commits |
| `SOS_SCHEDULER_YIELD` | CPU pressure | Add CPUs, tune queries |

**Exam Tip**: If question mentions "blocking", look for `LCK_M_*` waits

### 4. Find Missing Indexes
```sql
-- Oracle: Advisor recommendations
-- Azure SQL:
SELECT TOP 10
    ROUND(s.avg_total_user_cost * s.avg_user_impact * (s.user_seeks + s.user_scans), 0) AS improvement_measure,
    'CREATE INDEX IX_' + 
        OBJECT_NAME(d.object_id, d.database_id) + '_' +
        REPLACE(REPLACE(REPLACE(ISNULL(d.equality_columns,''), ', ', '_'), '[', ''), ']', '') +
        CASE WHEN d.equality_columns IS NOT NULL AND d.inequality_columns IS NOT NULL THEN '_' ELSE '' END +
        REPLACE(REPLACE(REPLACE(ISNULL(d.inequality_columns,''), ', ', '_'), '[', ''), ']', '') +
        ' ON ' + d.statement +
        ' (' + ISNULL(d.equality_columns,'') +
        CASE WHEN d.equality_columns IS NOT NULL AND d.inequality_columns IS NOT NULL THEN ',' ELSE '' END +
        ISNULL(d.inequality_columns, '') + ')' +
        ISNULL(' INCLUDE (' + d.included_columns + ')', '') AS create_index_statement
FROM sys.dm_db_missing_index_details d
INNER JOIN sys.dm_db_missing_index_groups g ON d.index_handle = g.index_handle
INNER JOIN sys.dm_db_missing_index_group_stats s ON g.index_group_handle = s.group_handle
ORDER BY improvement_measure DESC;
```
**Exam Tip**: `sys.dm_db_missing_index_*` views = Database Engine Tuning Advisor recommendations

### 5. Find Unused Indexes (Candidates for Removal)
```sql
-- Oracle: Monitor index usage with V$SEGMENT_STATISTICS
-- Azure SQL:
SELECT 
    OBJECT_NAME(i.object_id) AS table_name,
    i.name AS index_name,
    i.type_desc,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s 
    ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
    AND s.database_id = DB_ID()
    AND (s.user_seeks + s.user_scans + s.user_lookups) = 0
    AND s.user_updates > 0
ORDER BY s.user_updates DESC;
```
**Exam Tip**: If `user_updates > 0` but `user_seeks = 0`, index is hurting performance

### 6. Check Index Fragmentation
```sql
-- Oracle: ANALYZE INDEX ... VALIDATE STRUCTURE
-- Azure SQL:
SELECT 
    OBJECT_NAME(ips.object_id) AS table_name,
    i.name AS index_name,
    ips.index_type_desc,
    ips.avg_fragmentation_in_percent,
    ips.page_count
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE ips.avg_fragmentation_in_percent > 10
    AND ips.page_count > 1000
ORDER BY ips.avg_fragmentation_in_percent DESC;
```

**Fragmentation Rules (Exam Loves These):**
- **< 10%**: No action needed
- **10-30%**: REORGANIZE (online, slower)
- **> 30%**: REBUILD (faster, offline unless ONLINE=ON)

**Exam Tip**: Question will ask "fragmentation is 45%, what do you do?" → **REBUILD**

### 7. Query Store - Top Resource Consuming Queries
```sql
-- Oracle: DBA_HIST_ACTIVE_SESS_HISTORY
-- Azure SQL Query Store:
SELECT TOP 10
    q.query_id,
    qt.query_sql_text,
    SUM(rs.count_executions) AS total_executions,
    AVG(rs.avg_duration) / 1000.0 AS avg_duration_ms,
    AVG(rs.avg_cpu_time) / 1000.0 AS avg_cpu_ms,
    AVG(rs.avg_logical_io_reads) AS avg_logical_reads
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
GROUP BY q.query_id, qt.query_sql_text
ORDER BY AVG(rs.avg_cpu_time) DESC;
```

**Query Store Key Views:**
- `sys.query_store_query` - Query metadata
- `sys.query_store_query_text` - SQL text
- `sys.query_store_plan` - Execution plans
- `sys.query_store_runtime_stats` - Performance metrics
- `sys.query_store_runtime_stats_interval` - Time intervals

**Exam Tip**: Query Store = historical performance data (replaces AWR/ADDM in Oracle)

### 8. Find Blocking Sessions
```sql
-- Oracle: V$LOCK, V$SESSION
-- Azure SQL:
SELECT 
    blocking.session_id AS blocking_session_id,
    blocked.session_id AS blocked_session_id,
    blocked.wait_type,
    blocked.wait_time,
    blocked.wait_resource,
    blocking_sql.text AS blocking_query,
    blocked_sql.text AS blocked_query
FROM sys.dm_exec_requests blocked
JOIN sys.dm_exec_sessions blocking ON blocked.blocking_session_id = blocking.session_id
CROSS APPLY sys.dm_exec_sql_text(blocking.most_recent_sql_handle) blocking_sql
CROSS APPLY sys.dm_exec_sql_text(blocked.sql_handle) blocked_sql
WHERE blocked.blocking_session_id > 0;
```
**Exam Tip**: `blocking_session_id > 0` = session is blocked

### 9. Resource Governor - Pool Statistics
```sql
-- Oracle: DBA_RSRC_CONSUMER_GROUPS
-- Azure SQL:
SELECT 
    rp.name AS pool_name,
    rps.used_memory_kb / 1024.0 AS used_memory_mb,
    rps.active_memory_grant_amount_kb / 1024.0 AS active_grants_mb,
    rps.total_cpu_usage_ms,
    rps.used_memory_kb * 100.0 / (SELECT SUM(used_memory_kb) FROM sys.dm_resource_governor_resource_pools) AS memory_pct
FROM sys.dm_resource_governor_resource_pools rp
JOIN sys.dm_resource_governor_resource_pool_volumes rps 
    ON rp.pool_id = rps.pool_id;
```

**Resource Governor Components:**
- **Resource Pool**: CPU/Memory limits (like Oracle Resource Manager)
- **Workload Group**: Maps users to pools
- **Classifier Function**: Routes requests to workload groups

**Exam Tip**: If question asks "limit CPU for reporting users", use **Resource Governor**

### 10. Database File I/O Statistics
```sql
-- Oracle: V$FILESTAT
-- Azure SQL:
SELECT 
    DB_NAME(vfs.database_id) AS database_name,
    mf.name AS file_name,
    vfs.num_of_reads,
    vfs.num_of_writes,
    vfs.io_stall_read_ms / NULLIF(vfs.num_of_reads, 0) AS avg_read_latency_ms,
    vfs.io_stall_write_ms / NULLIF(vfs.num_of_writes, 0) AS avg_write_latency_ms,
    (vfs.num_of_bytes_read / 1024.0 / 1024.0) AS mb_read,
    (vfs.num_of_bytes_written / 1024.0 / 1024.0) AS mb_written
FROM sys.dm_io_virtual_file_stats(NULL, NULL) vfs
JOIN sys.master_files mf ON vfs.database_id = mf.database_id AND vfs.file_id = mf.file_id
ORDER BY vfs.io_stall_read_ms + vfs.io_stall_write_ms DESC;
```

**I/O Latency Thresholds (Exam Favorites):**
- **< 10ms**: Excellent (SSD)
- **10-20ms**: Good
- **20-50ms**: Acceptable (HDD)
- **> 50ms**: Problem! Scale storage tier

**Exam Tip**: If latency > 50ms, answer is "scale to Premium storage"

---

## 🎯 Exam Scenario Pattern Recognition

### Scenario: "Database is slow, CPU at 100%"
**Query to run:**
```sql
SELECT TOP 5 query_hash, SUM(total_worker_time) AS cpu
FROM sys.dm_exec_query_stats
GROUP BY query_hash
ORDER BY cpu DESC;
```
**Answer**: Identify top CPU queries, add missing indexes

### Scenario: "Users complaining about locks/blocking"
**Query to run:**
```sql
SELECT blocking_session_id, wait_type, wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id > 0;
```
**Answer**: Check for `LCK_M_X` waits, kill blocking session or tune transaction

### Scenario: "Query was fast yesterday, slow today"
**Query to run:**
```sql
SELECT p.query_id, rs.avg_duration, rs.last_execution_time
FROM sys.query_store_runtime_stats rs
JOIN sys.query_store_plan p ON rs.plan_id = p.plan_id
WHERE p.query_id = <query_id>
ORDER BY rs.last_execution_time DESC;
```
**Answer**: Use Query Store to force last good plan

### Scenario: "Database running out of space"
**Query to run:**
```sql
SELECT name, size * 8.0 / 1024 AS size_mb
FROM sys.database_files;
```
**Answer**: Add data file or enable autogrow

### Scenario: "Need to limit resource usage for report users"
**Solution**: Use **Resource Governor**
```sql
CREATE RESOURCE POOL ReportPool WITH (MAX_CPU_PERCENT = 20);
CREATE WORKLOAD GROUP ReportGroup USING ReportPool;
```

---

## 📝 Quick Reference Card (Print This!)

### DMV Categories
| Category | Key DMV | Use Case |
|----------|---------|----------|
| **Query Performance** | `sys.dm_exec_query_stats` | Top CPU/IO queries |
| **Wait Analysis** | `sys.dm_os_wait_stats` | Bottlenecks |
| **Index Usage** | `sys.dm_db_index_usage_stats` | Unused indexes |
| **Index Physical** | `sys.dm_db_index_physical_stats` | Fragmentation |
| **Missing Indexes** | `sys.dm_db_missing_index_*` | Index recommendations |
| **Blocking** | `sys.dm_exec_requests` | Lock waits |
| **I/O Stats** | `sys.dm_io_virtual_file_stats` | File latency |
| **Resource Pools** | `sys.dm_resource_governor_*` | Resource limits |
| **Query Store** | `sys.query_store_*` | Historical performance |

### Memorize These Columns
| DMV | Key Columns | What They Mean |
|-----|-------------|----------------|
| `sys.dm_exec_query_stats` | `total_worker_time` | CPU time (microseconds) |
| | `total_logical_reads` | Buffer pool reads |
| | `total_elapsed_time` | Wall clock time |
| `sys.dm_os_wait_stats` | `wait_time_ms` | Time spent waiting |
| | `waiting_tasks_count` | # of waits |
| `sys.dm_db_index_usage_stats` | `user_seeks` | Index seek operations (good) |
| | `user_scans` | Index scan operations (bad if large table) |
| | `user_updates` | Writes to index (cost) |
| `sys.dm_db_index_physical_stats` | `avg_fragmentation_in_percent` | Fragmentation % |
| | `page_count` | Size of index |

---

## 🧪 Hands-On Practice (Use MCP Server!)

### Lab 1: Query Performance Analysis
```sql
-- Deploy AdventureWorksLT, then run:

-- 1. Find most expensive query
SELECT TOP 5 
    total_worker_time/execution_count AS avg_cpu,
    SUBSTRING(text, 1, 100) AS query_text
FROM sys.dm_exec_query_stats
CROSS APPLY sys.dm_exec_sql_text(sql_handle)
ORDER BY avg_cpu DESC;

-- 2. Check wait stats
SELECT TOP 10 wait_type, wait_time_ms
FROM sys.dm_os_wait_stats
ORDER BY wait_time_ms DESC;

-- 3. Find missing indexes
SELECT * FROM sys.dm_db_missing_index_details;
```

### Lab 2: Query Store Exploration
```sql
-- Enable Query Store
ALTER DATABASE AdventureWorksLT SET QUERY_STORE = ON;

-- Run some queries, then analyze
SELECT q.query_id, qt.query_sql_text, 
    AVG(rs.avg_duration) AS avg_ms
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON q.query_text_id = qt.query_text_id
JOIN sys.query_store_plan p ON q.query_id = p.query_id
JOIN sys.query_store_runtime_stats rs ON p.plan_id = rs.plan_id
GROUP BY q.query_id, qt.query_sql_text
ORDER BY avg_ms DESC;
```

### Lab 3: Index Fragmentation & Rebuild
```sql
-- Check fragmentation
SELECT 
    OBJECT_NAME(object_id) AS table_name,
    avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED')
WHERE avg_fragmentation_in_percent > 10;

-- Rebuild fragmented indexes
ALTER INDEX ALL ON SalesLT.Product REBUILD;
```

---

## 🎓 Exam Study Strategy

### Week 1: DMV Basics
- Memorize top 10 DMVs
- Practice each query 5 times
- Understand what each column means

### Week 2: Query Store
- Enable Query Store
- Force good plans
- Analyze query regression

### Week 3: Wait Statistics
- Learn common wait types
- Practice identifying bottlenecks
- Map waits to solutions

### Week 4: Resource Governor
- Create resource pools
- Set up workload groups
- Test CPU/memory limits

### Exam Day Tips
1. If question mentions **"slow query"** → `sys.dm_exec_query_stats`
2. If question mentions **"blocking"** → `sys.dm_exec_requests` + `blocking_session_id`
3. If question mentions **"historical performance"** → **Query Store**
4. If question mentions **"fragmentation"** → `sys.dm_db_index_physical_stats`
5. If question mentions **"missing index"** → `sys.dm_db_missing_index_details`

---

## 🔗 Quick Links
- Query Store: https://learn.microsoft.com/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store
- DMVs: https://learn.microsoft.com/sql/relational-databases/system-dynamic-management-views/
- Wait Types: https://learn.microsoft.com/sql/relational-databases/system-dynamic-management-views/sys-dm-os-wait-stats-transact-sql

**Remember**: You're strong on HA/DR and PowerShell. Focus your last 2 weeks ONLY on DMVs and Query Store, and you'll ace this exam! 🚀
