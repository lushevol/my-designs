# System Design Document: Workflow Engine

### Component of Ratan Code Review Agent

## 1. Executive Summary

The **Workflow Engine** is a standalone application running on-premise (or a dedicated VM). Instead of reacting to cloud events, it proactively manages the review lifecycle through a **Polling & Queuing** architecture.

It acts as a state machine with three distinct stages:

1.  **Discovery:** Scanning repositories for active, unreviewed PRs.
2.  **Qualification:** Waiting for CI/Build checks to pass.
3.  **Execution:** Performing the AI analysis with strict concurrency controls.

-----

## 2. High-Level Data Flow

The system utilizes in-memory queues (or a lightweight local Redis instance) to move PRs through the pipeline.

**The Pipeline Stages:**
`Repo Scanner` -> `Pending Build Queue` -> `Ready-to-Review Queue` -> `Worker Pool (Limited)`

-----

## 3. Core Components

### 3.1 Component A: The Repository Scanner (The Poller)

A scheduled job (Cron-based, e.g., every 10 minutes) that iterates through repositories.

  * **Input:** a centralized ADO PAT.
  * **Logic:**
    1.  Fetch all repos of PAT.
    2.  **Filter (Config):** Keep repos based on name patterns (e.g., `51358-`).
    3.  Fetch all active Pull Requests from all repos.
    4.  **Filter 1 (Config):**
          * Ignore PRs based on title patterns (e.g., `[WIP]`, `[No-Review]`).
          * Created by human (not bot).
          * Created within the last 14 days.
    5.  **Filter 2 (Freshness):** Compare the **Latest Commit Hash** of the PR against the bot's history.
          * *Check:* Does the latest commit already have a "Review Summary" comment from this Bot User?
          * *Result:* If **No**, create a generic `ReviewJob` object and push it to the **Pending Build Queue**.

### 3.2 Component B: The Build Watcher (Qualification Queue)

This component prevents the AI from wasting tokens on code that doesn't even compile.

  * **Mechanism:** A queue processor that checks items every 60 seconds.
  * **Logic:**
    1.  Fetch the `BuildStatus` for the specific Commit Hash via ADO API.
    2.  **Scenario A (In Progress):** Keep in queue, retry later (Exponential backoff).
    3.  **Scenario B (Failed):** Drop from queue.
    4.  **Scenario C (Succeeded):** Move the job to the **Ready-to-Review Queue**.

### 3.3 Component C: The Execution Engine (Worker Pool)

This is where the concurrency limit is enforced to protect resources and API rate limits.

  * **Concurrency Control:** Implemented via `rx-queue` (Node.js).
  * **Limit:** Configurable (e.g., `MAX_CONCURRENT_REVIEWS = 3`).
  * **Process:**
    1.  Pull a job from **Ready-to-Review Queue**.
    2.  Execute the **Review Workflow** (detailed below).

-----

## 4. The Review Workflow (File-by-File Strategy)

The workflow iterates through the files.

### Step 1: Context & Preparation

  * **Fetch Data:**
      * `ADO.get_pr_files()`: Get the list of modified files.
      * `ADO.list_threads()`: Fetch existing comments for Deduplication.
      * `Sonar.get_measures()`: Get project-level metrics (if applicable).
  * **Filter Files:** Exclude auto-generated files (`package-lock.json`, `dist/`, `*.min.js`) based on the `.review-config.json`.

### Step 2: The Processing Loop (The "Map" Phase)

The engine loops through every changed file in the PR.

**For Each File:**

1.  **Fetch Content:** Get the specific diff chunks for this file.
2.  **Redaction:** Run redact processor over the file content to mask secrets (PII/Creds).
3.  **AI Analysis (Review Agent):**
      * *Prompt Context:* "You are reviewing `UserController.ts`. Identify bugs and security risks."
      * *Input:* The specific file diff.
      * *Output:* A JSON array of findings `[{ line: 10, severity: "high", content: "..." }]`.
4.  **Local Deduplication:**
      * Compare the findings against the `list_threads` data fetched in Step 1.
      * *Rule:* If a thread exists on Line X with \>85% similarity, **drop the finding**.

### Step 3: Aggregation (The "Reduce" Phase)

Once all files are processed:

1.  **Aggregate Findings:** Collect all valid findings from the file loop into a master list.
2.  **Categorize:** Pass the master list to the **Issue Category Agent** (cheap model) to group them (Security, Logic, Style) and assign severity.

### Step 4: Action Execution

1.  **Post Inline Comments:**
      * Iterate through the master list and call `ADO.create_thread(file, line, comment)` for each finding.
2.  **Post Summary:**
      * Construct the Markdown report (Status + Summary of files reviewed + High-level stats).
      * Post to the PR Overview.

-----

## 5. Handling Edge Cases

| Scenario | System Behavior |
| :--- | :--- |
| **Process Crash / Restart** | Since queues are in-memory, pending jobs are lost. **Recovery:** On startup, the Scanner will re-scan repos. Since it checks "Latest Commit vs. Bot Comment," it will simply pick up where it left off (re-queueing unreviewed PRs). |
| **New Commit while Reviewing** | If a developer pushes a new commit *while* the bot is reviewing the old one: The bot finishes the current review. The next "Scanner" tick detects the new commit and queues a *new* job. |