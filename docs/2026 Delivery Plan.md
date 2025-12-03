## 1. Key Deliveries

### A. UX Transformation (GDS)

*The Foundation.*

* **A.1: The North Star Spec (Design Artifact)**
    * **Deliverable:** High-fidelity Figma/Sketch prototypes for design tokens (Font stacks, Color palettes (light/dark modes), Spacing units, etc) critical screens (Login, Shell, Menu, etc.) approved by stakeholders.
    * **Success Criteria:** Stakeholder sign-off on the "New Look."

* **A.2: The "Smart" Component Library (NPM Package)**
  * **Deliverable:** An internal NPM package containing UI components (Inputs, Buttons, Data Grids, Form Controls, etc).
* **A.3: (Enabler) Migration "Starter Kit"**
  * **Deliverable:** A code repository template + Documentation site + Migration CLI tool (optional) for Ratan and pilot teams.

* **A.4: Core Platform Shell 2.0 (Code Artifact)**
    * **Deliverable:** The deployable host container that implements the layout, navigation, and auth flow.
    * **Require Go Live:** yes

> Resources: 1 UX / 30MD, 1 UI / 40MD, 1 QA / 15MD

### B. User Activity Monitoring (Telemetry & Insights)
*The Feedback Loop.*

* **B.1: The Metrics Definition**
    * **Deliverable:** A finalized document defining standard events, business benefits and clear actionable insights.
* **B.2: The Ops Insight Dashboard**
    * **Deliverable:** A live dashboard visualizing the specific metrics defined in B.1.
    * **Require Go Live:** yes
* **B.3: Telemetry Hook**
    * **Deliverable:** The instrumentation logic that captures events and sends them to monitoring service.
    * **Note:** Possible to merge into implementation in **A.3**.
    * **Require Go Live:** yes

> Resources: 1 UX / 10MD, 1 UI / 30MD, 1 JAVA / 20MD, 1 QA / 10MD.

### C. Interoperability (FDC3)
*The Connective Tissue.*

- **C.1: Intent & Context Definition**
  - **Deliverable:** Define existing interaction scenarios and ongoing workflows. (e.g. trade - cashflow, dashboard - cashflow, etc.)

* **C.2: The Intent Registry**
    * **Deliverable:** A searchable database listing which apps handle which intents, built in Admin Module.
    * **Require Go Live:** yes
* **C.3: The FDC3 Desktop Agent (Broker)**
    * **Deliverable:** The background service running in Platform Shell (A.2) that routes messages between apps.
    * **Note:** No dependency on GDS Shell v2, as it does not reply on the GDS Shell UX.
    * **Require Go Live:** yes
* **C.4: FDC3 Hooks**
    * **Deliverable:** React hooks (e.g., `useFDC3Context`) exposed so tenants can easily "listen" and trigger for context changes.
    * **Require Go Live:** yes
* **C.5: Tenant Migration & Integration**
    * **Goal:** Migrate existing in applications interaction to intent based. Integrate new tiles capabilities.
    * **Benefit:** Evolves manual workflows into intent-based instructions, serving as a precondition for AI automation.
    * **Require Go Live:** yes
    

> Resources: 1 UI / 60MD, 1 JAVA / 30MD, 1 QA / 15MD

### D. Desktop Strategy (OpenFin Integration)
*The Container.*

* **D.1: Ratan OpenFin Manifest**
    * **Deliverable:**  `manifest` for Ratan, platform provider to manage and route intents.
    * **Goal:** Enable ratan to launch within OpenFin runtime environment.
    * **Dependency:** Rely on clear business stories and roadmaps.
    * **Require Go Live:** yes
* **D.2: Custom Layout \***
    * **Deliverable:** Custom code that handles the "Snap and Dock" logic.
    * **Note:** Depends on requirements.
    * **Require Go Live:** yes

> Resources: 1 UI / 10 MD

### E. AI Powered Interoperability
*The Orchestrator.*

* **E.1: The Chatbot Widget UI**
    * **Deliverable:** The visual chat interface embedded in the Shell (A.2).
    * **Dependency:** AI Factory policy
    * **Note:** The chatbot UX can be covered by A.2
    * **Require Go Live:** yes
* **E.2: The "Intent Translator" (AI Logic)**
    * **Deliverable:** The logic layer that converts Natural Language ("open trade 34982745") into an FDC3 Context Object (`{ type: "scb.fmptp.trade", id: { tradeId: "34982745" } }`).
    * **Dependency:** Requires **C.1 (Registry)** to know what commands are possible. Requires **C.4 (Migration)** for tenant adoption/implementation.
    * **Require Go Live:** yes

> Resources: 1 BA / 20MD, 1 UX / 10MD, 1 UI / 20MD, 1 JAVA / 50MD, 1 QA / 10MD

## 2. Risks & Mitigations: Refinement

1. **Tenant Team Adoption**

- *The Risk:* The success of GDS (Visuals) and FDC3 (Interop) relies heavily on decentralized tenant teams updating their codebases.
- *Mitigation:* 
  - **"Trojan Horse" Approach:** Bundle the Telemetry hook and FDC3 listeners *inside* the GDS UI components. If they want the new modern look, they automatically get the tracking and interop capabilities.
  - **Developer Experience (DX):** Provide a copy-paste "Starter Kit" and dedicated office hours to help tenant developers migrate.
  - **Leadership Mandate:** Utilize the "Future of Operations" vision to set a hard deadline for compliance, supported by senior leadership.

2. **Performance Overhead (Risk):**

* *The Risk:* Bundling GDS + Telemetry + FDC3 listeners into every component might make the apps heavy or slow to render.
* *Mitigation:* Strict bundle-size budgets for the Component Library (A.3).

3. **The "AI Factory" Delay (Risk):**

* *The Risk:* Topic E relies on AI Factory. If they are late, your Chatbot is just an empty UI.
* *Mitigation:* Decouple the UI. Build the Chatbot interface (E.1) to handle simple Regex commands first, then upgrade to LLM when the Factory is ready.

## 3. The Master Roadmap

- **Goal:** Evolve the platform from a fragmented UI into an interoperable, AI-ready ecosystem.
- **Strategy:** **Build** (Q1 Foundation) -> **Connect** (Q2 Data/FDC3) -> **Migrate** (Q3 Adoption) -> **Automate** (Q4 AI).

#### **Phase 1: The Foundation (Q1)**

Theme: Visual Transformation & Containerization

Focus: Establishing the "New Look" and deploying the host container (Shell) so it is ready to receive apps.

| **ID**  | **Initiative**         | **Key Deliverable**                                          | **Dependency**     | **Resource** |
| ------- | ---------------------- | ------------------------------------------------------------ | ------------------ | ------------ |
| **A.1** | **North Star Spec**    | Design System Tokens (Figma), Critical Screen Prototypes.    | Stakeholder Buy-in | 1 UX         |
| **A.4** | **Platform Shell 2.0** | **[KEY GO LIVE]** The Host Container. Handles Layout, Auth, Nav. | A.1                | 1 UI, 1 QA   |
| **A.2** | **Smart Comp. Lib**    | Internal NPM Package (Grids, Inputs, Buttons).               | A.1                | 1 UI         |
| **B.1** | **Metrics Def.**       | Document defining events and business KPIs.                  | None               | 0.5 BA/UX    |

#### **Phase 2: Connectivity & Insights (Q2)**

Theme: The Nervous System (Telemetry & Interop)

Focus: Wiring up the backend infrastructure (FDC3/Telemetry) before mass migration.

| **ID**  | **Initiative**      | **Key Deliverable**                                          | **Dependency** | **Resource**   |
| ------- | ------------------- | ------------------------------------------------------------ | -------------- | -------------- |
| **B.3** | **Telemetry Hook**  | Instrumentation logic to route events to monitoring.         | A.4            | 1 Java, 0.5 UI |
| **B.2** | **Ops Dashboard**   | **[KEY GO LIVE]** Live visualization of adoption/performance. | B.1, B.3       | 1 UI           |
| **C.3** | **FDC3 Agent**      | **[KEY GO LIVE]** Background Service (Broker) for message routing. | None           | 1 Java         |
| **C.2** | **Intent Registry** | Admin DB listing app capabilities/intents.                   | C.1            | 0.5 Java       |
| **A.3** | **Starter Kit**     | Migration CLI, Docs, and Templates for Tenants.              | A.2, A.4       | 1 UI           |

#### **Phase 3: Expansion & Migration (Q3)**

Theme: Adoption & Desktop Strategy

Focus: The heaviest lift of the year—moving tenants to the new stack and enabling the desktop wrapper.

| **ID**  | **Initiative**       | **Key Deliverable**                                          | **Dependency** | **Resource** |
| ------- | -------------------- | ------------------------------------------------------------ | -------------- | ------------ |
| **C.5** | **Tenant Migration** | **[KEY GO LIVE]** Migrating apps to use Intents & New Shell. | A.3, C.3       | 2 UI, 1 QA   |
| **C.4** | **FDC3 Hooks**       | `useFDC3Context` React hooks for developer ease.             | C.3            | 0.5 UI       |
| **D.1** | **OpenFin Manifest** | **[KEY GO LIVE]** Ratan config for OpenFin Runtime.          | A.4            | 0.5 UI       |
| **D.2** | **Custom Layout**    | Snap & Dock window management logic.                         | D.1            | 0.5 UI       |

#### **Phase 4: Automation (Q4)**

Theme: AI Orchestration

Focus: Leveraging the registry and structured intents to enable Natural Language commands.

| **ID**  | **Initiative**        | **Key Deliverable**                                      | **Dependency** | **Resource** |
| ------- | --------------------- | -------------------------------------------------------- | -------------- | ------------ |
| **E.1** | **Chatbot Widget**    | Visual Chat Interface embedded in Shell.                 | A.4            | 1 UI         |
| **E.2** | **Intent Translator** | **[KEY GO LIVE]** Logic converting NLP to FDC3 Contexts. | C.2, C.5       | 1 BA, 1 Java |
| **-**   | **Year-End Polish**   | Tech debt cleanup, perf tuning, final QA.                | All            | All Hands    |

## 3. Visual Timeline



## 4. Consolidated Resource Plan

*Total Squad Size Recommendation: 6 FTE*

| **Role**          | **Count** | MD        |
| ----------------- | --------- | --------- |
| **UI Devs**       | 2         | 160 (8M)  |
| **BA**            | 1         | 20 (1M)   |
| **Java/Backend**  | 1         | 100 (5M)  |
| **UX Designer**   | 1         | 50        |
| **QA Automation** | 1         | 50 (2.5M) |

## 5. Critical Risks & Dependencies

1. **The "Chicken and Egg" of Migration (C.5):**
   - **Risk:** Tenants cannot migrate in Q3 if the **Starter Kit (A.3)** and **Components (A.2)** aren't solid in Q2.
   - **Mitigation:** The Starter Kit must be treated as a product with its own release cycle in late Q2.
2. **AI Data Prerequisites (E.2):**
   - **Risk:** AI cannot "translate" commands if the **Intent Registry (C.2)** is empty.
   - **Mitigation:** Enforce that every app migrated in Q3 *must* register their intents in the Registry as part of their Definition of Done.
