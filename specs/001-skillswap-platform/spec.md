# Feature Specification: SkillSwap Platform

**Feature Branch**: `001-skillswap-platform`
**Created**: 2025-11-08
**Status**: Draft
**Input**: User description: "Create a skill-sharing marketplace platform where companies exchange employee expertise using a credit-based system for cross-industry talent sharing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Company Onboarding & Profile Setup (Priority: P1)

HR managers need to join the network and set up their company profile so they can start participating in skill missions.

**Why this priority**: Without company profiles, no missions can happen. This is the entry point to the entire platform and delivers immediate value by allowing companies to browse available opportunities.

**Independent Test**: Can be fully tested by creating a company account via invite link, completing the profile, and viewing the network dashboard. Delivers the value of network visibility even before making any missions.

**Acceptance Scenarios**:

1. **Given** an HR manager receives an invite link, **When** they click the link and complete registration, **Then** their company profile is created and they can access the platform dashboard
2. **Given** a company profile exists, **When** the HR manager completes industry and size information, **Then** the profile is marked as complete and visible to the network
3. **Given** an HR manager tries to access the platform without an invite, **When** they attempt to register, **Then** they are shown an "invite required" message
4. **Given** a company has 5 employees invited, **When** all employees join and fill profiles, **Then** the company can start declaring availability

---

### User Story 2 - Employee Skill Mapping & Profile Management (Priority: P1)

Employees need to document their skills and availability so their expertise can be matched with company needs across the network.

**Why this priority**: The platform's value depends on having a rich pool of skilled talent. Without employee profiles, no matching can occur. This is foundational for the MVP.

**Independent Test**: Can be tested by having employees receive a survey, fill in their skills using the taxonomy, set availability percentage, and see their anonymized profile in the marketplace. Delivers value by creating a searchable talent pool.

**Acceptance Scenarios**:

1. **Given** an employee is invited to the platform, **When** they complete the skill survey selecting from predefined categories, **Then** their skill profile is created with categorized skills
2. **Given** an employee has a skill profile, **When** they set their availability to 20% capacity, **Then** they appear in the available talent pool with anonymized information
3. **Given** an employee wants to add a new skill not in the taxonomy, **When** they request to add "Blockchain Security", **Then** the skill is added to the appropriate category pending approval
4. **Given** an employee changes availability, **When** they update from 20% to full-time, **Then** their profile reflects the new availability immediately

---

### User Story 3 - Declare Skill Needs & Search Talent (Priority: P1)

HR managers need to specify what skills their company needs and search for available talent in the network to address capability gaps.

**Why this priority**: This is the demand side of the marketplace. Combined with employee profiles (US2), it enables the core matching functionality and represents minimum viable value.

**Independent Test**: Can be tested by creating a skill need (e.g., "regulatory compliance, 1 day/week, 3 months"), searching anonymized talent profiles, and viewing matches. Delivers value by showing companies what talent is available even before negotiating missions.

**Acceptance Scenarios**:

1. **Given** an HR manager has access to the platform, **When** they create a skill need for "financial regulatory compliance" with duration 3 months and commitment 1 day/week, **Then** the need is posted and matched against available talent
2. **Given** a skill need exists, **When** the HR manager searches the talent pool, **Then** they see anonymized profiles of employees with matching skills showing availability percentage and experience level
3. **Given** multiple matches exist, **When** the HR manager filters by availability (>25% capacity), **Then** only matching profiles with sufficient availability are shown
4. **Given** a skill need is fulfilled, **When** the HR manager marks it as complete, **Then** it is removed from active needs and archived

---

### User Story 4 - Negotiate & Approve Missions (Priority: P2)

Companies need to negotiate mission terms (duration, time commitment, credit value) and obtain necessary approvals before starting a mission.

**Why this priority**: This enables the first actual mission to happen. Building on US1-3, this completes the end-to-end flow and delivers the core business value.

**Independent Test**: Can be tested by two companies agreeing on a mission (e.g., 1 week senior dev = 2 days junior marketer), going through employee consent → manager approval → legal check workflow, and finalizing the mission. Delivers value of the first completed skill swap.

**Acceptance Scenarios**:

1. **Given** Company A finds a matching talent from Company B, **When** they propose a mission with specific terms (1 week for 2 days, credit value based on salary), **Then** Company B receives the proposal for review
2. **Given** an mission proposal exists, **When** the receiving company proposes counter-terms (1 week for 1.5 days instead), **Then** the proposing company can accept or reject
3. **Given** both companies agree on terms, **When** the employee consent is requested, **Then** the employee can approve or decline the mission
4. **Given** employee approves, **When** the manager reviews, **Then** the manager can approve and trigger legal review (NDA signing)
5. **Given** all approvals are complete, **When** legal check passes, **Then** the mission is marked as "active" and credits are reserved

---

### User Story 5 - Credit System & Transaction Management (Priority: P2)

Companies need to track their credit balance, request credit adjustments when negative, and see transaction history to manage their network participation.

**Why this priority**: This enables the network pool concept where companies don't need perfect 1:1 matches. It's essential for scaling beyond initial pilot missions.

**Independent Test**: Can be tested by a company going negative (-10 credits), admin adding credits via admin interface, completing a mission that adds credits, and viewing full transaction history. Delivers value of flexible, asynchronous missions.

**Acceptance Scenarios**:

1. **Given** a new company joins, **When** they complete onboarding, **Then** their credit balance starts at 0
2. **Given** a company's balance is negative (-15 credits), **When** they view their credit dashboard, **Then** they see a message to contact SkillSwap support for credit adjustment
3. **Given** a company requests credits from SkillSwap support, **When** SkillSwap admin adds 50 credits via admin interface, **Then** the company sees the updated balance and transaction record in their dashboard
4. **Given** a mission completes, **When** Company A provided 1 week of senior talent (valued at 10 credits), **Then** Company A gains +10 credits and Company B loses -10 credits
5. **Given** a company has transaction history, **When** they view their credit dashboard, **Then** they see all missions (in/out), admin adjustments, and running balance

---

### User Story 6 - Manage Active Missions & Track Progress (Priority: P3)

HR managers and employees need to track ongoing missions, update time logs, and mark milestones to ensure smooth collaboration.

**Why this priority**: This improves the experience of active missions but isn't needed for the first mission to happen. It becomes important as companies have multiple concurrent missions.

**Independent Test**: Can be tested by tracking an active 3-month mission, logging weekly hours, updating progress notes, and receiving notifications when milestones hit. Delivers value of organized mission management.

**Acceptance Scenarios**:

1. **Given** a mission is active, **When** the employee logs 8 hours worked for the host company, **Then** the time is tracked against the agreed commitment
2. **Given** a 3-month mission is in progress, **When** 1 month completes, **Then** both companies receive a progress check-in notification
3. **Given** an employee working on a mission, **When** they update project notes ("Completed financial model review"), **Then** both companies can view the progress update
4. **Given** a mission completes, **When** both parties mark it as finished, **Then** final credits are settled and participants can leave feedback

---

### User Story 7 - Employee Self-Proposal & Opportunity Discovery (Priority: P3)

Employees need to browse available opportunities across the network and propose themselves for projects that interest them.

**Why this priority**: This empowers employees and increases engagement, but the core matching can work with HR-driven flows first. Nice-to-have for MVP enhancement.

**Independent Test**: Can be tested by an employee viewing open skill needs, proposing themselves for a "product strategy" opportunity, and having their HR manager notified to review. Delivers value of employee-driven career development.

**Acceptance Scenarios**:

1. **Given** an employee is logged in, **When** they browse the opportunity marketplace, **Then** they see anonymized skill needs from other companies with duration and commitment level
2. **Given** an employee finds an interesting opportunity, **When** they propose themselves, **Then** their HR manager is notified to review and approve
3. **Given** an HR manager receives a self-proposal, **When** they approve it, **Then** the proposal is sent to the requesting company as a match
4. **Given** an employee has proposed themselves, **When** they are selected, **Then** they receive a notification and can proceed with the approval workflow

---

### Edge Cases

- **What happens when an employee leaves their company mid-mission?** The mission can be terminated early with prorated credit adjustment, or a replacement employee can be nominated by the original company
- **How does the system handle timezone differences between FR and UK companies?** All times are displayed in the user's local timezone, and mission negotiations include timezone preferences
- **What if two companies can't agree on credit value for a mission?** They can use the default salary-based calculation, request platform mediation, or decline the mission
- **How does the system handle disputes about work quality or time commitment?** Both companies can flag issues, which triggers a review process and potential credit adjustment
- **What happens if a company's credit balance goes deeply negative and they don't purchase credits?** After a grace period (30 days), they cannot request new talent until balance is restored, but existing missions continue
- **How are NDA breaches handled?** Legal agreements specify remedies; the platform logs all data access for audit trails
- **What if an employee refuses consent after companies agree?** The mission is cancelled with no credit transaction; companies are notified to find alternative matches

## Requirements *(mandatory)*

### Functional Requirements

**Company & Access Management**
- **FR-001**: System MUST allow companies to join only via invite links to maintain network quality
- **FR-002**: System MUST support company profiles including industry, size, and geographic location
- **FR-003**: System MUST display all content in French and English based on user language preference
- **FR-004**: System MUST support startups and SME company types in the MVP phase

**User, Role & Permission Management**
- **FR-005**: System MUST store all users in a single User/Account table regardless of their role (talent, talent manager, or both)
- **FR-006**: System MUST support role-based access control with N:N relationship between Users and Roles
- **FR-007**: System MUST provide default system roles: "talent" (can participate in missions) and "talent_manager" (can create skill needs and manage missions)
- **FR-008**: Users MUST be able to have multiple roles simultaneously (e.g., both talent and talent_manager)
- **FR-009**: Companies MUST be able to create custom roles specific to their organization with selected permissions
- **FR-010**: System MUST support granular permissions (e.g., "view_talent_pool", "create_skill_need", "approve_mission") that can be assigned to roles
- **FR-011**: System MUST enforce permission checks on all operations based on user's active roles
- **FR-012**: Users MUST be able to have different roles in different companies (e.g., talent in Company A, talent_manager in Company B)

**User Skill Management**
- **FR-013**: System MUST support hierarchical skill taxonomy with 10-15 top-level categories (e.g., "Engineering", "Design", "Marketing", "Business Analysis") and approximately 100 pre-seeded specific skills sourced from industry standards (LinkedIn Skills, O*NET classifications)
- **FR-014**: Users MUST be able to propose new skills to the taxonomy for admin approval, ensuring the taxonomy grows based on real user needs
- **FR-015**: System MUST allow users to document skills through self-reported surveys
- **FR-016**: System MUST allow users to set availability as percentage of capacity (e.g., 20%, 40%, full-time)
- **FR-017**: System MUST anonymize user profiles when shown to other companies initially

**Skill Needs & Matching**
- **FR-018**: Users with talent_manager role MUST be able to declare skill needs with duration (project-based, typically 3 months) and time commitment
- **FR-019**: System MUST match skill needs with available talent based on skill categories and availability
- **FR-020**: System MUST allow companies to search and filter talent by skills, availability, and experience level

**Mission Workflow**
- **FR-021**: System MUST support mission proposal with negotiable terms (duration, commitment, credit value)
- **FR-022**: System MUST enforce approval workflow: User consent (as talent) → Manager approval → Legal check
- **FR-023**: System MUST allow counter-proposals during negotiation
- **FR-024**: System MUST support NDA electronic acceptance as part of legal approval - sequential workflow where one company's authorized representative reviews standard NDA template and accepts, then other company does same (MVP: no e-signature integration, acceptance confirmation with audit trail)
- **FR-025**: System MUST allow mission cancellation before user consent with no penalties

**Credit System**
- **FR-026**: System MUST track credit balances for each company with indefinite accumulation (no expiration)
- **FR-027**: Companies MUST be able to start with zero balance and go negative (SkillSwap admin adjusts credits as needed)
- **FR-028**: System MUST calculate default credit values based on user salary as baseline
- **FR-029**: System MUST allow companies to negotiate custom credit values for specific missions
- **FR-030**: System MUST support credit additions/adjustments via admin interface (MVP: no financial transactions, purely numerical tracking)
- **FR-031**: System MUST record all credit transactions with timestamp, parties, and mission reference

**Mission Tracking**
- **FR-032**: System MUST allow time logging for active missions to track commitment against agreement
- **FR-033**: System MUST send progress notifications at defined milestones (e.g., 1 month, 2 months)
- **FR-034**: System MUST allow both companies to add notes and updates visible to all participants
- **FR-035**: System MUST allow missions to be marked complete when all parties agree

**Security & Compliance**
- **FR-036**: System MUST ensure users remain employed by their original company (no payroll/benefits changes)
- **FR-037**: System MUST log all data access for GDPR compliance and audit trails
- **FR-038**: System MUST support data export for users (GDPR right to data portability)
- **FR-039**: System MUST allow users to refuse any proposed mission at any stage
- **FR-040**: System MUST enforce password policy: minimum 12 characters, no composition requirements, check passwords against known breach databases (e.g., Have I Been Pwned)
- **FR-041**: System MUST enforce session timeouts: 24 hours for users with only talent role, 4 hours for users with talent_manager role
- **FR-042**: System MUST require re-authentication for critical operations: manager mission approval and legal check (NDA signing), regardless of session age (employee consent uses active session)
- **FR-044**: System MUST retain personally identifiable user data for 3 years after last account activity, then automatically anonymize user records while preserving aggregate mission and credit statistics for analytics
- **FR-045**: System MUST enforce rate limiting: 100 requests per minute per user for read operations, 20 requests per minute per user for write operations, and 300 requests per minute per IP address to prevent abuse

**Subscription Infrastructure**
- **FR-043**: System MUST have capability to handle subscription tiers (not active at launch, but infrastructure present)

### Key Entities

**Core Identity & Access**
- **User (or Account)**: Represents a person in the system; attributes include name, email, language preference (FR/EN), authentication credentials; relationships to Company (employer), Roles (N:N via UserRole junction), and Missions (as participant). A user can be a talent, talent manager (HR), or both simultaneously.
- **Role**: Represents a permission set that can be assigned to users; attributes include name (e.g., "talent", "talent_manager", "company_admin"), description, company (if company-specific role), scope (system-level or company-level); relationship to Permissions (N:N via RolePermission junction) and Users (N:N via UserRole junction). System provides default roles (talent, talent_manager) but companies can create custom roles.
- **Permission**: Represents a specific capability in the system; attributes include name (e.g., "view_talent_pool", "create_skill_need", "approve_mission"), resource (what entity it applies to), action (read/write/delete); relationship to Roles (N:N). Permissions are granular and can be combined into roles flexibly.
- **UserRole**: Junction entity linking Users to Roles within a Company context; attributes include user, role, company, assigned_date; allows users to have different roles in different companies (e.g., talent in Company A, talent_manager in Company B)

**Business Entities**
- **Company**: Represents an organization in the network; attributes include name, industry, size, location (FR/UK), credit balance, invite code; relationships to Users (employees/managers), Missions, CustomRoles
- **Skill**: Represents a capability in the taxonomy; attributes include name, category, description; hierarchical relationship (categories contain specific skills)
- **UserSkill**: Junction entity linking Users to Skills; attributes include user, skill, proficiency_level, years_experience; relationship to User and Skill
- **TalentAvailability**: Represents a user's offer to work on missions; attributes include user, availability percentage, anonymization status, active period; relationship to User and Skills
- **SkillNeed**: Represents a company's request for expertise; attributes include skill required, duration, time commitment (hours/week), status (open/matched/fulfilled), anonymization level; relationship to Company (requester)

**Mission & Transactions**
- **Mission**: Represents an agreed skill swap between companies; attributes include proposing company, receiving company, talent user, duration, time commitment, credit value, status (proposed/negotiating/approved/active/complete); relationships to Company (both parties), User (talent participating), Approval records
- **CreditTransaction**: Represents a credit movement; attributes include amount, type (mission/purchase/adjustment), timestamp, description, initiated_by_user; relationships to Company (payer/payee), Mission (if applicable), User (who initiated)
- **Approval**: Represents a step in the approval workflow; attributes include type (employee_consent/manager_approval/legal_check), status (pending/approved/rejected), timestamp, approver_user, comments; relationship to Mission and User (approver)
- **NDA**: Represents legal agreement for a mission; attributes include parties, signed date, document reference, signed_by_users; relationship to Mission and Users (signatories)

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Platform Adoption**
- **SC-001**: At least 10 companies join the network within 3 months of launch
- **SC-002**: At least 100 employees complete skill profiles within 3 months
- **SC-003**: Platform supports both French and English users with <5% translation errors reported

**Mission Activity**
- **SC-004**: At least 5 successful missions are completed within 6 months of launch
- **SC-005**: Average time from skill need creation to matched talent found is under 2 weeks
- **SC-006**: 80% of proposed missions result in either completion or counter-proposal (not abandoned)
- **SC-007**: Companies complete the full mission workflow (proposal → approval → active → complete) in under 4 weeks on average

**User Experience**
- **SC-008**: HR managers can create a skill need in under 5 minutes
- **SC-009**: Employees can complete skill profile survey in under 15 minutes
- **SC-010**: 90% of users successfully complete their first key task (create company profile, fill skill survey, or post skill need) on first attempt
- **SC-011**: Users can switch between French and English interface seamlessly with all content translated

**Credit System**
- **SC-012**: Credit transactions are recorded accurately with zero discrepancies in audit logs
- **SC-013**: Companies can view credit balance and transaction history in real-time via dashboard
- **SC-014**: At least 30% of companies receive admin credit adjustments within first 6 months (indicating network flexibility beyond 1:1 missions)

**Network Health**
- **SC-015**: Network includes companies from at least 3 different industries to support cross-industry missions
- **SC-016**: Average company has at least 5 employees with documented skills
- **SC-017**: Repeat mission rate (companies doing multiple swaps) reaches 40% within 1 year

**Technical Performance**
- **SC-018**: Skill search returns results in under 2 seconds for 90% of queries
- **SC-019**: Platform handles 100 concurrent users with <10% latency increase compared to single-user baseline (measured at p95)
- **SC-020**: System maintains 99.5% uptime during business hours (9am-6pm FR/UK time)

**Compliance & Security**
- **SC-021**: 100% of missions have completed NDA signing before employee work begins
- **SC-022**: All employee data access is logged and can be audited with complete history
- **SC-023**: Zero instances of employees being incorrectly moved to different company payroll

## Assumptions

1. **Cross-Industry Focus**: Most missions will be between companies in different industries, minimizing IP conflicts and non-compete issues
2. **Startup Willingness**: Startups and SMEs are more willing to experiment with this model than large corporations
3. **Employee Motivation**: Employees value variety, career development, and network building enough to participate voluntarily
4. **Trust in Anonymization**: Companies are comfortable with anonymized profiles during initial matching, with identity revealed only after mutual interest
5. **Credit Value Consensus**: Companies can reach agreement on mission value using salary as default baseline, with negotiation handling edge cases
6. **Geographic Scope**: France and UK are similar enough in employment law to be handled together in MVP (though country-specific NDAs may be needed)
7. **Invite-Only Quality**: Restricting access via invites will maintain network quality and reduce spam/low-quality participants
8. **Survey Accuracy**: Employee self-reported skills are sufficiently accurate for matching (with future AI validation as enhancement)
9. **Part-Time Feasibility**: Employees can effectively contribute value working part-time (e.g., 1 day/week) on mission projects
10. **Legal Framework Exists**: Standard NDAs are sufficient for MVP; more complex IP protections can be added later if needed

## Clarifications

### Session 2025-11-08

- Q: What password security policy should the system enforce for MVP? → A: Modern standard: 12+ characters minimum, no composition rules, check against known breached passwords database
- Q: How long should user sessions remain active before requiring re-authentication? → A: 24 hours for talent role, 4 hours for talent_manager role, re-auth for critical actions (mission approval, credit purchase)
- Q: How long should the system retain user data after account closure or inactivity? → A: Keep identifiable data for 3 years after last activity, then anonymize and retain aggregate mission/credit statistics indefinitely for network analytics
- Q: What rate limiting should the system enforce to prevent abuse? → A: Per-user: 100 requests/minute for reads, 20 requests/minute for writes; Per-IP: 300 requests/minute
- Q: What should be the initial skill taxonomy scope for MVP launch? → A: Balanced approach: 10-15 top-level categories (e.g., Engineering, Design, Marketing), ~100 pre-seeded skills sourced from LinkedIn Skills or O*NET standards, users can add new skills for approval
- Q: How should credit purchases work in the MVP? → A: No payment UI/workflow in MVP scope; SkillSwap admin staff manually add credits directly in database when companies request them offline
- Q: Should the MVP include any financial transactions, pricing, or payment mentions? → A: No - credits are purely a numerical tracking system in MVP with no financial layer; admin adds credits as needed with no money/pricing involved
- Q: Which mission approval types should require re-authentication? → A: Manager approval and legal check require re-authentication; employee consent uses active session (lower risk, employee can refuse later, manager reviews anyway)
- Q: How should NDA signing work in the MVP? → A: Sequential electronic acceptance - one company's legal/manager reviews standard NDA template and clicks "Accept NDA", then other company does same (no e-signature service like DocuSign, just acceptance confirmation with audit trail)

## Out of Scope (MVP)

The following features are explicitly excluded from the MVP and will be considered for future iterations:

1. **GenAI Skill Gap Analysis**: AI-powered automatic skill mapping from employee project history and intelligent skill gap recommendations
2. **Knowledge Base**: Repository of shared project descriptions and use cases from completed missions
3. **SSO Integration**: Single sign-on with corporate identity providers (will use email/password auth for MVP)
4. **Mobile Applications**: Native iOS/Android apps (will use responsive web for MVP)
5. **Real-Time Chat**: Built-in messaging between companies (will use email notifications for MVP)
6. **Advanced Analytics**: Dashboards for network density, skill trends, ROI calculations (basic reporting only for MVP)
7. **Large Corporation Support**: Features needed for companies >500 employees (multi-department approvals, complex org charts)
8. **Automatic Matching Algorithm**: AI-powered skill/need matching (will use manual search/filter for MVP)
9. **Payment Gateway, Pricing, & Financial Transactions**: All monetary aspects including credit pricing, payment processing, invoicing, or financial transactions (MVP: credits are purely numerical tracking, admin adjusts as needed with no money involved)
10. **E-Signature Integration**: Third-party digital signature services like DocuSign, HelloSign for NDA signing (MVP: uses simple electronic acceptance confirmation with audit trail)
11. **Multi-Language Beyond FR/EN**: Additional language support (German, Spanish, etc.)
12. **Video Interviews**: Built-in video conferencing for company/employee meetings
13. **Performance Reviews**: Feedback and rating system for completed missions
14. **Insurance/Liability Coverage**: Platform-provided insurance for missions (companies handle their own insurance in MVP)
15. **Background Checks**: Automated verification of employee credentials and work history
16. **API for Third-Party Integrations**: Public API for HR systems, ATS, etc.
