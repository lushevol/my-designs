# Architecture Design Document: Ratan Code Review Agent

![brand](/assets/branding.png)

## 1. Introduction

This document outlines the architecture for the **Intelligent Code Review Agent**, a resilient, event-driven platform designed to automate and augment peer reviews within our Azure DevOps environment.

**Purpose**
In a highly regulated financial sector, balancing engineering velocity with strict compliance and security standards is critical. The primary purpose of this system is to alleviate the bottleneck of manual code reviews by providing an instantaneous, automated first-pass review. Unlike basic AI scripts, this architecture uses a specialized multi-agent cognitive chain to understand context, identify security risks, categorize issues, and generate comprehensive reports, ensuring that human reviewers focus only on complex architectural decisions.

**Key Benefits**

* **Proactive Security Guardrails & Risk Mitigation:** "Shifts security left" by acting as an automated gatekeeper directly within the PR workflow. Dedicated guardrail agents and gateway policies identify hardcoded secrets, potential PII exposure, and common vulnerabilities immediately, preventing sensitive data leakage to external models and ensuring fewer security defects reach human reviewers.
* **Accelerated Delivery Velocity:** Drastically reduces PR cycle times by providing immediate, actionable feedback to developers, minimizing context-switching for senior engineers.
* **Enhanced Compliance & Consistency:** Enforces organizational coding standards and architectural patterns uniformly across all repositories, ensuring every change adheres to defined guidelines before it merges.
* **Enterprise Resilience:** Utilizes an asynchronous, queue-based architecture to handle bursty PR traffic reliably without impacting ADO performance.
* **Full Auditability:** Provides complete traceability for regulatory compliance by logging every prompt, AI decision, and resulting comment in a centralized audit database managed via a dedicated web portal.

![features](/assets/features.png)

---

## 2. High-Level System Context
The solution is comprised of five distinct subsystems:
1.  **Workflow Engine:** The asynchronous orchestrator and multi-agent execution environment.
2.  **Integration Layer (MCP):** Standardized data access layer for ADO and SonarQube.
3.  **AI Governance Layer:** The security gateway for cost control, model routing, and redaction.
4.  **Audit & Management:** The compliance database and Web UI for lifecycle management.
5.  **Config & Evaluation:** The context building and regression testing framework.

![architecture-overall](/assets/architecture-overall.png)

---

## 3. Detailed Subsystem Design

### System 1: Workflow Engine (The Worker)
This is an asynchronous, scalable worker service (hosted on Azure Functions or Kubernetes) that orchestrates the review lifecycle.

**1.1 Ingestion (Async Event)**
* **Trigger:** PR Scaner retrieves PRs from ADO and puts them to an Azure Service Bus.
* **Orchestrator:** A listener picks up the message. If the queue is backed up, the service scales horizontally.

**1.2 Context Gathering (via MCP)**
* The Orchestrator connects to the **ADO MCP Server** to fetch metadata (`get_pr_details`) and file changes (`get_diff`).
* It connects to the **SonarQube MCP Server** to retrieve current quality metrics (`get_measures`).

**1.3 Multi-Agent Analysis Pipeline**
Instead of a single generic pass, the engine invokes specialized agents sequentially:
1.  **Prompt Builder Engine:** Hydrates prompt templates using the `Context Builder`. It injects variables such as `repo_name`, `file_extension`, and specifically configured "Focus Areas" for the repo.
2.  **Redact Processor (Guardrails):** A pre-processor scans code diffs to mask PII, account numbers, and connection strings before they are sent to the LLM.
3.  **Code Change Summary Agent:** Analyzes the diffs to generate a high-level natural language summary of the changes (e.g., "Refactored Authentication Middleware").
4.  **Code Change Review Agent:** The core logic that analyzes diffs against the hydrated prompts to identify bugs, security risks, and logic errors.
5.  **Issue Category Agent:** Analyzes the raw findings from the Review Agent and maps them to a predefined taxonomy (e.g., "Security," "Maintainability," "Performance") defined in the context configuration.

**1.4 Post-Processing & Action**
* **Response Scorer:** Evaluates the confidence score of every finding. Low-confidence findings are discarded to reduce noise.
* **Advanced De-duplication:** The system queries `list_threads` via MCP. It uses a fuzzy matching logic (File + Line + Semantic similarity) to ensure the agent does not report issues that have already been discussed or resolved by humans.
* **Artifact Generation:**
    * **Inline Comments:** Posts specific findings to code lines.
    * **Comprehensive Review Report:** Generates a high-level Markdown report containing the *Change Summary*, *SonarQube Measures* (Coverage/Gate Status), and a *Summary of Alerts*. This is posted as a persistent comment on the PR overview.

### System 2: Integration Layer (MCP Servers)
We utilize the Model Context Protocol to create a standard interface between the AI agents and external tools.

**A. ADO MCP Server**
Exposes Azure DevOps resources as AI-ready tools:
* `get_pr_diff(id, iteration)`: Returns file changes.
* `list_threads(id)`: Returns conversation history (crucial for de-duplication).
* `create_thread(file, line, content)`: Posts review comments.
* `get_config_file(repo_id)`: Fetches the `.review-config.json` directly from the repo.

**B. SonarQube MCP Server**
Exposes static analysis data to augment the AI review:
* `get_measures(component)`: Returns UT coverage, debt ratio, and duplication.
* `get_quality_gate(project)`: Returns Pass/Fail status.

### System 3: AI Governance Layer
The "LLM Firewall" for Financial Compliance.
* **AI Gateway:** Centralized routing. Complex reviews route to high-reasoning models (e.g., GPT-4o); summarization routes to faster models (e.g., GPT-4o-mini).
* **Policy Enforcement:** Rejects prompts containing banned keywords or patterns.
* **Rate Limiting:** Prevents runaway costs by limiting tokens per minute per repository.

### System 4: Audit & Management
This system provides visibility and operational control.

**4.1 Audit Database**
* Records every key event: `PR_Received`, `Context_Built`, `Review_Generated`, `Comment_Posted`.
* Stores the exact Prompt and Response pair for every finding for audit traceability.

**4.2 Web Management Portal**
A React-based dashboard for Engineering Leads and DevOps:
* **Audit Viewer:** Search and view historical reviews and agent decisions.
* **Lifecycle Management:** Operational controls to manually "Re-trigger" a review, "Stop" a stuck job, or view current queue depth.
* **Statistics:** Visual metrics for "Average Review Time," "Issues Found per PR," and "Agent Acceptance Rate."

### System 5: Config & Evaluation

**5.1 Context & Prompt Builder**
* **Context Builder:** Converts a file locator in the ADO repo into a context class. It handles inheritance: *Global Config* -> *Org Config* -> *Repo Config*.
* **Prompt Builder:** Allows agents to select specific template files relative to the repo path. Supports dynamic variable substitution at runtime.

**5.2 Evaluation & Regression**
* **Evaluation App:** A standalone application to score the quality of responses against a "Golden Dataset" of known good reviews.
* **Regression Testing:** A suite of automated tests to ensure prompt updates do not degrade agent performance on known code patterns.

---

## 4. Security & Identity Strategy
* **Identity:** The Workflow Engine and MCP Servers utilize **Azure Managed Identities**. No Personal Access Tokens (PATs) are stored in code or configuration.
* **Zero Trust:** MCP Servers explicitly validate that the managed identity of the incoming request is authorized to access the specific Repo ID requested.
* **Network:** All components communicate over Private Endpoints within a Virtual Network. Public internet access is disabled; outbound traffic to Azure OpenAI flows through the private backbone.