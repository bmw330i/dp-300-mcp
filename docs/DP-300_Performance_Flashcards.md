# DP-300 Performance Views - Flashcard Drills

## 🎯 Purpose
Rapid-fire practice to build muscle memory for the exam. Cover the answers and test yourself!

---

## Round 1: Scenario → DMV Mapping

### Q1: "Find queries consuming the most CPU"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_exec_query_stats`  
**Key Column:** `total_worker_time`  
**Pattern:** `ORDER BY total_worker_time DESC`
</details>

### Q2: "Identify why database is slow (bottleneck analysis)"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_os_wait_stats`  
**Key Column:** `wait_time_ms`, `wait_type`  
**Pattern:** `ORDER BY wait_time_ms DESC`
</details>

### Q3: "Users report blocking/lock waits"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_exec_requests`  
**Key Column:** `blocking_session_id > 0`  
**Pattern:** `WHERE blocking_session_id > 0`
</details>

### Q4: "Query was fast last week, now slow (plan regression)"
<details>
<summary>Answer</summary>

**Feature:** Query Store  
**DMV:** `sys.query_store_runtime_stats`  
**Action:** Force last good plan
</details>

### Q5: "Which indexes are never used?"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_db_index_usage_stats`  
**Key Columns:** `user_seeks = 0`, `user_updates > 0`  
**Pattern:** `WHERE (user_seeks + user_scans) = 0`
</details>

### Q6: "Index fragmentation is 45%, what to do?"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_db_index_physical_stats`  
**Key Column:** `avg_fragmentation_in_percent`  
**Action:** `ALTER INDEX ... REBUILD` (>30% = rebuild)
</details>

### Q7: "Database Engine recommends creating indexes"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_db_missing_index_details`  
**Joins:** `sys.dm_db_missing_index_groups`, `sys.dm_db_missing_index_group_stats`  
**Key Column:** `improvement_measure`
</details>

### Q8: "Check storage I/O latency per file"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_io_virtual_file_stats`  
**Key Columns:** `io_stall_read_ms`, `io_stall_write_ms`  
**Threshold:** >50ms = problem
</details>

### Q9: "Limit CPU usage for report users to 20%"
<details>
<summary>Answer</summary>

**Feature:** Resource Governor  
**DMVs:** `sys.dm_resource_governor_resource_pools`  
**Action:** `CREATE RESOURCE POOL ... WITH (MAX_CPU_PERCENT = 20)`
</details>

### Q10: "Get actual SQL text from query hash"
<details>
<summary>Answer</summary>

**DMV:** `sys.dm_exec_sql_text`  
**Parameter:** `sql_handle`  
**Pattern:** `CROSS APPLY sys.dm_exec_sql_text(sql_handle)`
</details>

---

## Round 2: Wait Type → Meaning

### Wait Type: `PAGEIOLATCH_SH` / `PAGEIOLATCH_EX`
<details>
<summary>What does it mean?</summary>

**Meaning:** Waiting for data pages to load from disk  
**Cause:** Disk I/O bottleneck  
**Solution:** Add indexes, scale storage tier, add memory
</details>

### Wait Type: `LCK_M_X` / `LCK_M_U`
<details>
<summary>What does it mean?</summary>

**Meaning:** Waiting for exclusive lock  
**Cause:** Blocking transactions  
**Solution:** Reduce transaction time, tune queries, check deadlocks
</details>

### Wait Type: `CXPACKET`
<details>
<summary>What does it mean?</summary>

**Meaning:** Parallel query coordination waits  
**Cause:** Parallel query imbalance  
**Solution:** Adjust MAXDOP, update statistics, rewrite query
</details>

### Wait Type: `ASYNC_NETWORK_IO`
<details>
<summary>What does it mean?</summary>

**Meaning:** Waiting for client to consume results  
**Cause:** Application not reading data fast enough  
**Solution:** Fix application code, check network
</details>

### Wait Type: `WRITELOG`
<details>
<summary>What does it mean?</summary>

**Meaning:** Waiting for transaction log writes  
**Cause:** Slow storage for log file  
**Solution:** Faster storage, batch commits, check log file size
</details>

### Wait Type: `SOS_SCHEDULER_YIELD`
<details>
<summary>What does it mean?</summary>

**Meaning:** CPU pressure (workers yielding CPU)  
**Cause:** CPU overloaded  
**Solution:** Add vCores, tune expensive queries
</details>

---

## Round 3: Column Name → What It Measures

### Column: `total_worker_time` (sys.dm_exec_query_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Total CPU time in microseconds  
**Divide by:** `execution_count` for average  
**High Value Means:** Query is CPU-intensive
</details>

### Column: `total_logical_reads` (sys.dm_exec_query_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Pages read from buffer pool (memory + disk)  
**Unit:** 8KB pages  
**High Value Means:** Query reads lots of data (needs index)
</details>

### Column: `total_elapsed_time` (sys.dm_exec_query_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Wall clock time (includes waits)  
**Difference:** `elapsed_time` includes waits, `worker_time` is CPU only  
**Use For:** End-user perceived performance
</details>

### Column: `user_seeks` (sys.dm_db_index_usage_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Number of index seek operations  
**Good or Bad:** GOOD (efficient lookup)  
**Comparison:** Seeks > Scans = efficient index
</details>

### Column: `user_scans` (sys.dm_db_index_usage_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Number of index scan operations  
**Good or Bad:** BAD if large table (reads entire index)  
**Comparison:** High scans = missing index
</details>

### Column: `user_updates` (sys.dm_db_index_usage_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Number of writes to index (INSERT/UPDATE/DELETE)  
**Cost:** Each update slows writes  
**Decision:** If updates >> seeks, consider dropping index
</details>

### Column: `avg_fragmentation_in_percent` (sys.dm_db_index_physical_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Logical fragmentation %  
**Thresholds:**  
- <10% = OK  
- 10-30% = REORGANIZE  
- >30% = REBUILD
</details>

### Column: `io_stall_read_ms` (sys.dm_io_virtual_file_stats)
<details>
<summary>What does it measure?</summary>

**Measures:** Total milliseconds spent waiting for reads  
**Calculate:** `io_stall_read_ms / num_of_reads` = avg latency  
**Threshold:** >50ms = slow storage
</details>

---

## Round 4: Quick Commands (Fill in the Blank)

### Find top 10 CPU queries:
```sql
SELECT TOP 10 ____________ / execution_count AS avg_cpu
FROM sys.dm_exec_query_stats
ORDER BY ____________ DESC;
```
<details>
<summary>Answer</summary>

```sql
SELECT TOP 10 total_worker_time / execution_count AS avg_cpu
FROM sys.dm_exec_query_stats
ORDER BY total_worker_time DESC;
```
</details>

### Check fragmentation for all indexes:
```sql
SELECT OBJECT_NAME(object_id), ________________
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, '______')
WHERE avg_fragmentation_in_percent > ___;
```
<details>
<summary>Answer</summary>

```sql
SELECT OBJECT_NAME(object_id), avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED')
WHERE avg_fragmentation_in_percent > 10;
```
</details>

### Find blocked sessions:
```sql
SELECT blocking_session_id, __________, wait_resource
FROM sys.dm_exec_requests
WHERE ________________ > 0;
```
<details>
<summary>Answer</summary>

```sql
SELECT blocking_session_id, wait_type, wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id > 0;
```
</details>

### Enable Query Store:
```sql
ALTER DATABASE ________ SET __________ = ___;
```
<details>
<summary>Answer</summary>

```sql
ALTER DATABASE [DatabaseName] SET QUERY_STORE = ON;
```
</details>

---

## Round 5: Oracle DBA Translation

### Oracle: `SELECT * FROM V$SQL ORDER BY CPU_TIME DESC`
<details>
<summary>SQL Server equivalent?</summary>

```sql
SELECT total_worker_time / execution_count AS avg_cpu
FROM sys.dm_exec_query_stats
ORDER BY total_worker_time DESC;
```
</details>

### Oracle: `SELECT * FROM V$SESSION_WAIT WHERE wait_class != 'Idle'`
<details>
<summary>SQL Server equivalent?</summary>

```sql
SELECT wait_type, wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_type NOT IN ('SLEEP_TASK', 'WAITFOR', ...)
ORDER BY wait_time_ms DESC;
```
</details>

### Oracle: `SELECT * FROM DBA_HIST_ACTIVE_SESS_HISTORY`
<details>
<summary>SQL Server equivalent?</summary>

**Query Store:**
```sql
SELECT * FROM sys.query_store_runtime_stats;
```
</details>

### Oracle: `SELECT * FROM V$LOCK WHERE type = 'TX'`
<details>
<summary>SQL Server equivalent?</summary>

```sql
SELECT * FROM sys.dm_tran_locks
WHERE resource_type = 'KEY' OR resource_type = 'OBJECT';
```
</details>

### Oracle: `DBMS_ADVISOR` (SQL Tuning Advisor)
<details>
<summary>SQL Server equivalent?</summary>

**Missing Index DMVs:**
```sql
SELECT * FROM sys.dm_db_missing_index_details;
```

**Query Store Automatic Tuning:**
```sql
ALTER DATABASE SET AUTOMATIC_TUNING (FORCE_LAST_GOOD_PLAN = ON);
```
</details>

---

## 🎯 Practice Routine (2 Weeks Before Exam)

### Daily (15 minutes)
1. Go through all Round 1 questions without looking
2. If you miss 2+, review the cheat sheet again

### Every Other Day (30 minutes)
1. Deploy AdventureWorksLT with MCP server
2. Run each DMV query manually
3. Understand the output

### 3 Days Before Exam
1. Do all 5 rounds in one sitting (45 minutes)
2. Any missed questions → write out by hand 10 times

### Exam Day Morning
1. Skim Round 1 (scenarios)
2. Skim Round 2 (wait types)
3. Read your Oracle→SQL mapping notes

---

## 📊 Self-Assessment

Track your progress:
- [ ] Round 1: ___/10 correct (Target: 10/10)
- [ ] Round 2: ___/6 correct (Target: 6/6)
- [ ] Round 3: ___/8 correct (Target: 8/8)
- [ ] Round 4: ___/4 correct (Target: 4/4)
- [ ] Round 5: ___/5 correct (Target: 5/5)

**Ready for exam when:** All rounds 100% correct, 2 times in a row!

---

**Next Step:** Ask me to "deploy AdventureWorksLT so I can practice these queries hands-on" 🚀
