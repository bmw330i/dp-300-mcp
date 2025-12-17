# DP-300 Practice Session Prompts

Quick-start prompts for common DP-300 practice scenarios.

## 🚀 Getting Started

### Deploy First Practice Environment
```
Deploy a practice environment with AdventureWorksLT database so I can practice DP-300 performance monitoring queries.
```

### Check Current Resources
```
List all my Azure resource groups and show me what's currently running.
```

### Get My Current IP (for Firewall Rules)
```
What's my current public IP address? I need it for Azure firewall configuration.
```

---

## 📊 Performance Monitoring (Domain 3)

### Query Top CPU Consumers
```
Show me how to find the top 10 queries consuming the most CPU in my database. Include the Oracle V$SQL equivalent for comparison.
```

### Analyze Wait Statistics
```
Query the wait statistics for my database and explain what the top 5 wait types mean. What would I look at in Oracle?
```

### Check Index Fragmentation
```
Show me which indexes are fragmented above 10% in AdventureWorksLT. What fragmentation level requires REBUILD vs REORGANIZE?
```

### Find Missing Indexes
```
Query for missing index recommendations and show me the CREATE INDEX statements I should run.
```

### Query Store Analysis
```
Enable Query Store and show me the top 5 queries by CPU time. How is this different from Oracle's AWR?
```

---

## 🔒 Security (Domain 2)

### Configure Firewall
```
Add a firewall rule to my SQL server to allow connections from my current IP address.
```

### Check Authentication
```
Show me how to query current database users and their permissions. What's the Oracle equivalent?
```

---

## 🏗️ Deployment (Domain 1)

### Compare Database Tiers
```
Create two databases - one Basic, one Standard S0. Show me the DTU differences and cost comparison.
```

### Deploy with Sample Data
```
Deploy a new database with the AdventureWorksLT sample data. Configure it for Query Store enabled from start.
```

---

## 🎯 Query Tuning (Domain 4)

### Analyze Execution Plan
```
I have a slow query in AdventureWorksLT. Show me how to capture and analyze its execution plan.
```

### Force a Query Plan
```
This query performed better yesterday. Use Query Store to force the last good plan.
```

### Identify Unused Indexes
```
Which indexes in my database have zero seeks but high update costs? Should I drop them?
```

---

## 🔄 High Availability (Domain 6)

### Set Up Geo-Replication
```
Create a geo-replica of my database in a secondary region. Show me the cost impact.
```

### Test Failover
```
Show me how to initiate a planned failover to the secondary region.
```

---

## 💰 Cost Management

### Check Current Spending
```
What's my estimated monthly cost for all current resources? How much of my $200 free credit have I used?
```

### Cost-Optimize Configuration
```
I'm running out of free credits. Show me which resources I can downgrade or remove to save money.
```

### Daily Cleanup
```
Delete all my DP-300 practice resources. I'm done for today.
```

---

## 📚 Study Assistance

### DMV Flashcards
```
Quiz me on DMVs. Ask me a performance monitoring scenario and I'll tell you which DMV to use.
```

### Oracle to Azure Mapping
```
I need to find locked objects. In Oracle I'd query V$LOCK. What's the Azure SQL equivalent?
```

### Exam Prep
```
Give me 5 random exam-style questions about performance views. Grade my answers.
```

### Weak Area Practice
```
I struggle with Query Store. Create a practice scenario where I need to force a plan to fix query regression.
```

---

## 🔧 Troubleshooting

### Why Is My Database Slow?
```
My database feels slow. Walk me through the diagnostic process - which DMVs should I query in order?
```

### Users Report Blocking
```
Users are complaining about timeouts. Show me how to identify blocking sessions and what to do about it.
```

### High CPU Usage
```
My database is at 100% DTU. Help me identify the queries causing the problem and recommend solutions.
```

### I/O Latency Issues
```
Queries are slow to return results. Show me how to check I/O latency per file. What's acceptable latency?
```

---

## 🎓 Exam Simulation

### Scenario-Based Questions
```
Give me 3 exam-style scenarios (slow query, blocking, fragmentation) and ask me which DMV to use for each.
```

### Timed Practice
```
I have 30 minutes. Deploy a database, run 5 different DMV queries, explain the results, then clean up. Time me.
```

### Final Review
```
It's 3 days before my exam. Review my practice log and tell me which topics I should focus on.
```

---

## 🧪 Advanced Scenarios

### Resource Governor
```
Create a resource pool that limits reporting queries to 20% CPU. Show me how to assign users to it.
```

### Automatic Tuning
```
Enable automatic tuning on my database. Show me how to verify which plans were forced automatically.
```

### TempDB Contention
```
Show me how to detect tempdb contention using DMVs. What's the Oracle equivalent?
```

---

## 📝 Documentation

### Generate Study Notes
```
Based on my practice sessions today, generate a summary of what I learned and what I need to review.
```

### Create Cheat Sheet
```
Create a personalized cheat sheet with just the DMVs I struggle with most.
```

### Weekly Progress Report
```
Show me my weekly progress: sessions completed, costs incurred, domains mastered, weak areas identified.
```

---

## 🎯 Quick Commands

### Deploy
```
deploy
```

### Cleanup
```
cleanup
```

### Status
```
status
```

### Costs
```
costs
```

### Progress
```
progress
```

---

## 💡 Tips for Using These Prompts

1. **Be specific**: Mention "AdventureWorksLT" if working with that database
2. **Request comparisons**: Always ask for Oracle equivalents to reinforce learning
3. **Include context**: "I'm studying Domain 3" helps tailor the response
4. **Ask for cleanup**: End each session with a cleanup prompt
5. **Review costs**: Check spending after each practice session

## 🚨 Emergency Prompts

### Budget Alert
```
I'm at $150 spent. Show me cheaper alternatives to continue practicing.
```

### Authentication Error
```
My Azure MCP server won't authenticate. Help me troubleshoot the service principal.
```

### Resource Stuck
```
My database deployment has been stuck for 15 minutes. What should I do?
```

---

**Pro Tip**: Copy these prompts to your note-taking app for quick access during study sessions!
