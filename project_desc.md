# SkillSwap Platform - Product Brief

## Problem Statement

**For Startups & SMEs:**
Companies often have deep expertise in one area (e.g., mobile development, product design) but lack critical skills in other areas (e.g., sales, marketing, regulatory compliance). Hiring full-time employees or expensive consultants is not financially viable, especially for cash-strapped startups.

**For Large Organizations:**
Traditional companies have valuable specialized expertise (e.g., regulatory, legal, industry-specific knowledge) but employees lack opportunities for skill development, cross-industry exposure, and career variety.

**The Gap:**
There's no mechanism for companies to exchange employee expertise temporarily without the cost of hiring or the commitment of recruitment.

## Solution Overview

A **skill-sharing marketplace** where companies exchange employee time and expertise using a **points-based credit system**. Companies join a network pool where they can:

1. Declare available employee skills and capacity
2. Request specific skills they need
3. Match with employees from other companies (cross-industry to avoid IP conflicts)
4. Exchange employee time using a flexible credit system based on market-agreed value

**Key Principle:** This is a **network pool**, not 1:1 matching. Company A can lend an employee to Company B, and later receive help from Company C. Credits enable this flexibility.

## Target Users & Market

### Primary Users

- **HR Managers**: Main platform users who manage employee skills, availability, and exchange requests
- **Company Executives**: Approve major exchanges and strategic skill needs
- **Employees**: Fill their own skill profiles, propose themselves for projects, consent to exchanges

### Initial Market (MVP)

- **Geography**: France and UK (requires internationalization/i18n)
- **Company Size**: Startups and SMEs only
- **Industries**: All sectors (healthcare, fintech, logistics, etc.) - cross-industry focus reduces IP/NDA issues

### Access Model

- Invite-only public marketplace
- Companies need an invite link to join the network

## Core Use Cases

### Use Case 1: Startup Skill Swap

**Scenario:** A healthtech startup has excellent marketing capabilities but needs medical expertise to validate their product. A medical practice wants to digitalize but lacks digital marketing skills.

**Flow:**

- Healthtech declares need for "medical consultation" skills
- Medical practice has a doctor with 20% available capacity
- System matches them
- They agree on exchange terms (e.g., 1 week of medical expertise = 2 days of marketing support, based on salary differential)
- Doctor works part-time for healthtech for 3 months while maintaining their practice role
- Healthtech later provides marketing training to medical practice staff

### Use Case 2: Large Corp + Startup Exchange

**Scenario:** A bank has deep regulatory compliance expertise (ORIAS, financial regulations) but wants cutting-edge data/tech capabilities. A fintech startup needs regulatory guidance but is strong in data analytics.

**Flow:**

- Bank declares availability of compliance specialist (available 1 day/week)
- Fintech declares need for "financial regulatory compliance"
- Match occurs
- Exchange agreed: 1 day/week compliance support = 2 days/week data analytics support (market-negotiated)
- 3-month project-based exchange
- Both companies benefit without hiring costs

### Use Case 3: Underutilized Talent Development

**Scenario:** A company has a product manager who's between projects and has 40% idle capacity for 2 months.

**Flow:**

- HR manager marks this PM as "available" with skills: product strategy, roadmapping, user research
- Another company searching for "product strategy" support finds this talent (anonymized profile)
- Companies negotiate exchange
- PM gains new experience, builds network, works on interesting projects
- Original company earns credits for future skill needs

## Key Features & Functionality

### For HR Managers (Primary)

1. **Employee Skill Mapping**
   - Option 1 (MVP): Send surveys to employees to self-report skills
   - Option 2 (Future/GenAI): AI maps skills based on employee project history
   - Skills use pre-defined taxonomy with categories (e.g., "Business Analysis" → "Business Plan Review", "Business Plan Building")
   - Users can add new skills to taxonomy

2. **Declare Skill Needs**
   - Specify what skills the company is looking for
   - Set duration (project-based, typically 3 months)
   - Set time commitment needed (full-time, part-time, specific hours/week)

3. **Declare Available Talent**
   - Mark employees as available (with their consent)
   - Specify availability (full-time, part-time, % capacity)
   - Anonymized profiles shown to other companies initially

4. **Manage Exchanges**
   - View matched employee profiles
   - Negotiate exchange terms (duration, commitment, credit value)
   - Track ongoing exchanges
   - Manage credit balance

5. **Approval Workflow**
   - Employee consent → Manager approval → Legal check (NDA signing)
   - Track status of exchange requests

### Credit System

- **Starting Balance**: Companies can go negative (must purchase credits)
- **Value Determination**: Market-based negotiation between companies
  - Default metric: Employee salary as baseline
  - Example: Senior developer ($100k salary) for 1 week = Junior marketer ($50k salary) for 2 weeks
- **Network Pool**: Credits don't require 1:1 company matching
- **Accumulation**: Credits don't expire, accumulate indefinitely

### Subscription Infrastructure (Not Active at Launch)

- Build capability to handle paid subscriptions (to be activated later)
- Future revenue model: Access to knowledge base of shared projects

### Employee Experience

- **Profile Management**: Employees fill their own skill profiles
- **Self-Propose**: Can propose themselves for available opportunities
- **Career Benefits**: Gain variety, network building, cross-industry experience
- **Consent Required**: Can refuse any proposed exchange
- **Employment Status**: Always remain employed by original company (payroll, benefits, insurance unchanged)

### Legal & Compliance

- NDA signing capability within platform
- Focus on cross-industry matches to minimize IP conflicts
- Legal approval checkpoint in workflow

## Future Enhancements (Out of MVP Scope)

### Iteration 2: GenAI Skill Gap Analysis

- AI analyzes company needs and current employee skills
- Automatically identifies skill gaps
- Recommends specific exchanges from the network
- Auto-maps employee skills from project history

### Knowledge Base

- Companies share project descriptions with network
- Build searchable repository of use cases
- Monetization opportunity (premium access)

## Success Metrics

### Platform Health

- Number of companies in network
- Number of active employees in talent pool
- Geographic distribution (France vs UK)
- Industry diversity

### Exchange Activity

- Number of successful matches per month
- Average exchange duration
- Credit transaction volume
- Repeat exchange rate (companies doing multiple swaps)

### User Satisfaction

- Time to find suitable skill match
- Employee satisfaction with exchange experience
- Company retention rate in network
- NPS score from HR managers

### Business Metrics

- Credit purchase volume (companies going negative)
- Average credit balance per company
- Network density (connections between companies)
- Employee utilization improvement (reduction in idle capacity)

## Key Constraints & Assumptions

### Assumptions

- Companies are willing to share employee capacity in exchange for skills they need
- Cross-industry exchanges minimize IP/non-compete concerns
- Startups/SMEs have more flexibility than large corporations (MVP focus)
- Employees want variety and career development opportunities
- HR departments are primary pain point for skill management

### Constraints

- Must support multi-language (France + UK, minimum FR/EN)
- Employees always remain employed by original company
- All exchanges require explicit employee consent
- Legal approval required for each exchange (NDA)
- Invite-only access to maintain network quality

## Open Questions for Technical Planning

- How to handle timezone differences (France/UK operations)?
- What level of anonymization for employee profiles before match?
- How to handle disputes over credit value/exchange quality?
- What data is needed for legal compliance (GDPR, employment law)?
- How to verify employee skills (self-reported vs. validated)?
