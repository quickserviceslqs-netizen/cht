# CHT Business Logic Flows

## 1️⃣ Requisition Creation & Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   REQUISITION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

STEP 1: CREATE REQUISITION
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Staff user submits requisition                                  │
│ ├─ Amount: 75,000 KES                                           │
│ ├─ Purpose: Equipment repair                                    │
│ ├─ Origin: Branch (Nairobi)                                     │
│ └─ Urgent: true                                                 │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 2: AUTO-MATCH APPROVAL THRESHOLD
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ System matches: Amount 75,000 → Tier 2 (50K-200K)              │
│ ├─ Route: Dept Head → Branch Manager → Treasury                │
│ ├─ Fast-track: Allowed (urgent + threshold allows)             │
│ └─ CFO Required: No                                             │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 3: SET INITIAL STATE
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Status: "pending"                                               │
│ Next Approver: Jane (Department Head)                           │
│ Workflow Sequence: [dept_head, branch_manager, treasury]        │
│ Tier: Tier 2                                                    │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 4: CREATE AUDIT TRAIL
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ApprovalTrail Entry:                                            │
│ ├─ User: john (staff)                                           │
│ ├─ Action: "submitted"                                          │
│ ├─ Timestamp: 2025-01-15 10:30:00                               │
│ └─ IP: 192.168.1.100                                            │
└─────────────────────────────────────────────────────────────────┘
    ↓
    ✅ REQUISITION CREATED
```

---

## 2️⃣ Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   APPROVAL PROCESS                              │
└─────────────────────────────────────────────────────────────────┘

TIER 2: Dept Head → Branch Manager → Treasury

LEVEL 1: DEPARTMENT HEAD APPROVAL
┌────────────────────────────────────────────────────────────────┐
│ Jane (Dept Head) receives notification                         │
│ ├─ Requisition: REQ-002 (75,000 KES)                           │
│ ├─ Requested by: John (Staff)                                  │
│ └─ Purpose: Equipment repair                                   │
│                                                                │
│ Jane reviews and APPROVES                                      │
│ ├─ Action: "approved"                                          │
│ ├─ Comment: "Approved - critical equipment"                    │
│ └─ Timestamp: 2025-01-15 11:00:00                              │
└────────────────────────────────────────────────────────────────┘
    ↓
✅ STATUS UPDATED: "pending" (looking for next approver)
✅ NEXT APPROVER: Mike (Branch Manager)
✅ AUDIT TRAIL: Created entry for Jane's approval

LEVEL 2: BRANCH MANAGER APPROVAL
┌────────────────────────────────────────────────────────────────┐
│ Mike (Branch Manager) receives notification                    │
│ ├─ Requisition: REQ-002 (75,000 KES)                           │
│ ├─ Original Requester: John (Staff)                            │
│ ├─ Dept Head: Approved ✅                                       │
│ └─ Purpose: Equipment repair                                   │
│                                                                │
│ Mike reviews and APPROVES                                      │
│ ├─ Action: "approved"                                          │
│ ├─ Comment: "Approved - within branch budget"                  │
│ └─ Timestamp: 2025-01-15 12:00:00                              │
└────────────────────────────────────────────────────────────────┘
    ↓
✅ STATUS UPDATED: "pending" (looking for next approver)
✅ NEXT APPROVER: Alice (Treasury)
✅ AUDIT TRAIL: Created entry for Mike's approval

LEVEL 3: TREASURY VALIDATION
┌────────────────────────────────────────────────────────────────┐
│ Alice (Treasury) receives notification                         │
│ ├─ Requisition: REQ-002 (75,000 KES)                           │
│ ├─ Approvals: Dept Head ✅ → Branch Manager ✅                 │
│ ├─ Fund Balance: 450,000 KES (sufficient)                      │
│ └─ Payment Method: M-Pesa                                      │
│                                                                │
│ Alice validates and APPROVES                                   │
│ ├─ Action: "validated"                                         │
│ ├─ Comment: "Treasury validation complete"                     │
│ └─ Timestamp: 2025-01-15 13:00:00                              │
└────────────────────────────────────────────────────────────────┘
    ↓
✅ STATUS UPDATED: "pending_treasury_validation" → "ready_for_payment"
✅ ALL APPROVALS COMPLETE
✅ AUDIT TRAIL: Created entry for treasury validation
```

---

## 3️⃣ Payment Execution with 2FA

```
┌─────────────────────────────────────────────────────────────────┐
│                  PAYMENT EXECUTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

STEP 1: INITIATE PAYMENT
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Treasury user (Alice) initiates payment:                       │
│ ├─ Requisition ID: REQ-002                                     │
│ ├─ Amount: 75,000 KES                                          │
│ ├─ Method: M-Pesa                                              │
│ ├─ Destination: +254712345678 (John's phone)                   │
│ └─ Request OTP: true                                           │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 2: SYSTEM GENERATES OTP
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ System Actions:                                                │
│ ├─ Generate OTP: "847593" (6-digit random)                     │
│ ├─ Hash OTP: SHA-256("847593")                                 │
│ ├─ Create Payment Record:                                      │
│ │  ├─ Status: "pending"                                        │
│ │  ├─ OTP Hash: [hashed value]                                 │
│ │  ├─ OTP Sent: 2025-01-15 13:30:00                            │
│ │  └─ Created by: Alice (Treasury)                             │
│ └─ Send OTP: SMS to Alice                                      │
└─────────────────────────────────────────────────────────────────┘
    ↓
✅ RESPONSE: "OTP sent. Please verify to complete payment."
✅ PAYMENT ID: returned for verification step

STEP 3: USER RECEIVES OTP & VERIFIES
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Alice receives OTP via SMS: "847593"                           │
│ Alice calls: POST /api/payments/execute                         │
│ ├─ Payment ID: [from previous step]                            │
│ ├─ OTP Code: "847593"                                          │
│ └─ Amount: 75,000                                              │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 4: SYSTEM VALIDATES OTP
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Verification:                                                  │
│ ├─ Hash submitted OTP: SHA-256("847593")                       │
│ ├─ Compare with stored hash: ✅ MATCH                          │
│ ├─ OTP is valid: ✅                                             │
│ └─ Proceed to payment execution                                │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 5: EXECUTE PAYMENT
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Payment Processing:                                            │
│ ├─ Executor: Alice (Treasury)                                  │
│ ├─ Amount: 75,000 KES                                          │
│ ├─ Method: M-Pesa                                              │
│ ├─ Destination: +254712345678                                  │
│ ├─ Timestamp: 2025-01-15 13:45:00                              │
│ └─ Status: "executing"                                         │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 6: UPDATE FUND BALANCE
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Treasury Fund Update:                                          │
│ ├─ Previous Balance: 450,000 KES                               │
│ ├─ Debit: 75,000 KES                                           │
│ ├─ New Balance: 375,000 KES                                    │
│ └─ Check Reorder Level: 375,000 > 100,000 ✅ (no replenish)   │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 7: CREATE LEDGER ENTRY
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ LedgerEntry Created:                                           │
│ ├─ Description: "Payment for REQ-002 equipment repair"        │
│ ├─ Debit: 75,000                                               │
│ ├─ Credit: 0                                                   │
│ ├─ Running Balance: 375,000                                    │
│ └─ Timestamp: 2025-01-15 13:45:00                              │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 8: UPDATE REQUISITION STATUS
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Requisition Update:                                            │
│ ├─ Status: "pending_treasury_validation" → "paid"             │
│ ├─ Payment Status: "success"                                   │
│ ├─ OTP Verified: true                                          │
│ ├─ OTP Verified Timestamp: 2025-01-15 13:45:00                │
│ └─ Execution Timestamp: 2025-01-15 13:45:00                   │
└─────────────────────────────────────────────────────────────────┘
    ↓
STEP 9: CREATE AUDIT TRAIL
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ ApprovalTrail Entry:                                           │
│ ├─ User: Alice (Treasury)                                      │
│ ├─ Action: "paid"                                              │
│ ├─ Comment: "Payment executed via M-Pesa"                     │
│ ├─ IP Address: 192.168.1.105                                  │
│ └─ Timestamp: 2025-01-15 13:45:00                             │
└─────────────────────────────────────────────────────────────────┘
    ↓
✅ PAYMENT COMPLETE
✅ STATUS: "paid"
✅ RESPONSE: Payment details with confirmation
```

---

## 4️⃣ Fund Replenishment Trigger

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTO-REPLENISHMENT FLOW                           │
└─────────────────────────────────────────────────────────────────┘

SCENARIO: Multiple payments reduce fund below reorder level

CURRENT STATE:
├─ Fund Balance: 450,000 KES
├─ Reorder Level: 100,000 KES
├─ Min Balance: 50,000 KES
├─ Auto Replenish: true
└─ Status: Above reorder level ✅

PAYMENT 1: 150,000 KES executed
├─ Previous: 450,000
├─ After: 300,000
└─ Status: Still above reorder ✅

PAYMENT 2: 150,000 KES executed
├─ Previous: 300,000
├─ After: 150,000
└─ Status: Still above reorder ✅

PAYMENT 3: 75,000 KES executed
├─ Previous: 150,000
├─ After: 75,000
├─ Check: 75,000 < 100,000 (reorder level)
└─ Status: BELOW REORDER LEVEL ⚠️

AUTOMATIC TRIGGER:
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ System Actions:                                                │
│ ├─ Detect balance < reorder level                              │
│ ├─ Check auto_replenish flag: true ✅                           │
│ ├─ Create ReplenishmentRequest:                                │
│ │  ├─ Amount: 300,000 KES                                      │
│ │  │  (to bring balance to 375,000 = 375K from some supply)   │
│ │  ├─ Status: "pending"                                        │
│ │  ├─ Created: 2025-01-15 14:00:00                             │
│ │  └─ Fund ID: fund-01                                         │
│ ├─ Send Notification: To Finance Manager                       │
│ └─ Log Audit Entry: System initiated replenishment             │
└─────────────────────────────────────────────────────────────────┘
    ↓
FINANCE MANAGER REVIEW:
├─ Receives notification
├─ Reviews balance and target
├─ APPROVES replenishment request
└─ System creates Payment record for supply order

REPLENISHMENT EXECUTION:
├─ Balance goes from: 75,000
├─ Receives: 300,000
├─ New Balance: 375,000
├─ Above reorder level: 375,000 > 100,000 ✅
└─ Status: "completed"

RESULT: Fund automatically topped up! ✅
```

---

## 5️⃣ Change Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  CHANGE REQUEST PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

SCENARIO: Approver wants more details before approving

INITIAL STATE:
├─ Requisition REQ-003 in pending
├─ Amount: 250,000 KES
├─ Purpose: "Computer purchase"
└─ Next Approver: Mike (Branch Manager)

APPROVER ACTION: Request Changes
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Mike reviews and requests changes:                             │
│ ├─ Action: "changes_requested"                                │
│ ├─ Details: "Need itemized breakdown of computers and specs" │
│ ├─ Comment added to requisition                               │
│ └─ Timestamp: 2025-01-15 14:30:00                             │
└─────────────────────────────────────────────────────────────────┘
    ↓
SYSTEM UPDATES:
├─ Status: "pending" → "pending_changes"
├─ Change Requested: true
├─ Change Requested By: Mike (Branch Manager)
├─ Change Request Details: "Need itemized breakdown..."
├─ Change Request Deadline: 2025-01-22 (7 days)
└─ Audit Trail Entry Created ✅

NOTIFICATION:
├─ John (Requester) receives notification
├─ Email: "Changes requested on requisition REQ-003"
├─ Details: "Need itemized breakdown of computers and specs"
└─ Deadline: 2025-01-22

REQUESTER RESPONSE:
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ John updates requisition with details:                         │
│ ├─ Dell XPS 13 Laptop: 120,000 × 1                            │
│ ├─ Apple MacBook Pro: 150,000 × 1                             │
│ ├─ Monitors (27"): 30,000 × 2                                 │
│ └─ Resubmits for approval                                     │
└─────────────────────────────────────────────────────────────────┘
    ↓
SYSTEM UPDATES:
├─ Status: "pending_changes" → "pending"
├─ Change Requested: false
├─ Purpose: Updated with detailed breakdown
├─ Next Approver: Mike (Branch Manager again)
├─ New Audit Trail: "changes_submitted" by John
└─ Notification: Mike receives updated requisition

APPROVER REVIEWS AGAIN:
├─ Mike reviews detailed breakdown
├─ Amount still valid: 250,000 KES
├─ Breakdown reasonable: ✅
├─ APPROVES requisition
└─ Proceeds to next tier

RESULT: Requisition approved after changes ✅
```

---

## 6️⃣ Security: No Self-Approval Invariant

```
┌─────────────────────────────────────────────────────────────────┐
│           NO SELF-APPROVAL ENFORCEMENT                         │
└─────────────────────────────────────────────────────────────────┘

SCENARIO: User tries to approve their own requisition

SITUATION 1: User IS the Requester
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ John (Staff) submits requisition:                              │
│ ├─ Request: 50,000 KES for supplies                           │
│ ├─ Status: "pending"                                          │
│ ├─ Next Approver: Set to Mike                                 │
│ │                                                              │
│ John (same user) tries to approve:                            │
│ ├─ Action: POST /api/requisitions/1/approve                   │
│ └─ Payload: {"action": "approved"}                            │
│                                                                │
│ SYSTEM CHECKS:                                                │
│ ├─ User ID: john.id (1)                                       │
│ ├─ Requester ID: john.id (1)                                  │
│ ├─ Match: YES ❌ VIOLATION                                     │
│ └─ Response: 400 "Cannot approve your own requisition"        │
└─────────────────────────────────────────────────────────────────┘
    ↓
REQUEST REJECTED ❌
AUDIT LOG: Self-approval attempt blocked

SITUATION 2: User IS NOT the Requester but NOT the Next Approver
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Requisition REQ-005:                                           │
│ ├─ Requester: John (Staff)                                    │
│ ├─ Next Approver: Mike (Branch Manager)                       │
│ │                                                              │
│ Sarah (HR Manager) tries to approve:                          │
│ ├─ Action: POST /api/requisitions/5/approve                   │
│ └─ Payload: {"action": "approved"}                            │
│                                                                │
│ SYSTEM CHECKS:                                                │
│ ├─ User ID: sarah.id (3)                                      │
│ ├─ Requester ID: john.id (1)                                  │
│ ├─ Match: NO ✅                                                │
│ ├─ Next Approver ID: mike.id (2)                              │
│ ├─ User is Next Approver: NO ❌ VIOLATION                      │
│ └─ Response: 403 "Not authorized to approve this requisition" │
└─────────────────────────────────────────────────────────────────┘
    ↓
REQUEST REJECTED ❌
AUDIT LOG: Unauthorized approval attempt blocked

SITUATION 3: User IS the Next Approver (VALID)
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Requisition REQ-005:                                           │
│ ├─ Requester: John (Staff)                                    │
│ ├─ Next Approver: Mike (Branch Manager)                       │
│ │                                                              │
│ Mike (authorized approver) tries to approve:                  │
│ ├─ Action: POST /api/requisitions/5/approve                   │
│ └─ Payload: {"action": "approved"}                            │
│                                                                │
│ SYSTEM CHECKS:                                                │
│ ├─ User ID: mike.id (2)                                       │
│ ├─ Requester ID: john.id (1)                                  │
│ ├─ Match: NO ✅                                                │
│ ├─ Next Approver ID: mike.id (2)                              │
│ ├─ User is Next Approver: YES ✅ VALID                         │
│ └─ Proceed with approval                                      │
│                                                                │
│ APPROVAL EXECUTED:                                            │
│ ├─ Status: "pending" → "pending" (looking for next)           │
│ ├─ Next Approver: Set to next in sequence                     │
│ ├─ Audit Trail: Created                                       │
│ └─ Notification: Next approver notified                       │
└─────────────────────────────────────────────────────────────────┘
    ↓
APPROVAL ACCEPTED ✅
AUDIT LOG: Valid approval by authorized approver

ENFORCEMENT LAYERS:
├─ Layer 1: Business Logic Check (models)
├─ Layer 2: API Authorization (route handler)
├─ Layer 3: Database Constraints (foreign keys)
└─ Result: Cannot be bypassed ✅
```

---

## 7️⃣ Segregation of Duties: Creator ≠ Executor

```
┌─────────────────────────────────────────────────────────────────┐
│          SEGREGATION OF DUTIES FOR PAYMENTS                    │
└─────────────────────────────────────────────────────────────────┘

VALID SCENARIO: Different users
    ↓
PAYMENT CREATION:
├─ Created by: Alice (Treasury Officer)
├─ Amount: 100,000 KES
├─ Status: "pending"
└─ Stored: created_by = alice.id

PAYMENT EXECUTION:
├─ Attempt 1: By Alice (Creator)
│  ├─ Check: creator.id (alice) == executor.id (alice)
│  ├─ Match: YES ❌ VIOLATION
│  └─ Status: BLOCKED - Cannot execute own payment
│
├─ Attempt 2: By Bob (Treasury Supervisor)
│  ├─ Check: creator.id (alice) == executor.id (bob)
│  ├─ Match: NO ✅ VALID
│  ├─ Status: APPROVED
│  ├─ executor_id = bob.id
│  └─ execution_timestamp = 2025-01-15 15:00:00

RESULT: ✅ Valid segregation of duties
AUDIT TRAIL:
├─ Created by: alice (staff_id=1)
├─ Executed by: bob (staff_id=2)
└─ Verification: Two different users involved

ENFORCEMENT:
├─ Business Logic: Check creators ≠ executors
├─ Database Constraint: Separate FK fields
├─ Audit Log: Both users recorded
└─ Report: Can track segregation violations
```

---

## 📊 State Transitions Summary

```
STATUS FLOW:
┌─────────┐
│  draft  │ (Initial state)
└────┬────┘
     │ Submit requisition
     ↓
┌──────────┐
│ pending  │ ← Main approval state
└────┬─────┘
     │
     ├─ Approved by all tiers
     │  ↓
     ├─ pending_treasury_validation
     │  ├─ Validated
     │  ↓
     ├─ ready_for_payment
     │  ├─ Payment executed
     │  ↓
     ├─ paid ✅ (Terminal)
     │
     ├─ Approver requests changes
     │  ├─ pending_changes
     │  ├─ Changes submitted
     │  ↓
     ├─ pending (Re-enter approval)
     │
     └─ Rejected at any stage
        ↓
        rejected ✅ (Terminal)

TERMINAL STATES:
├─ paid (Payment executed)
├─ rejected (Approval denied)
└─ reviewed (Post-payment review complete)
```

---

## 🎯 Key Decision Points

```
APPROVAL ROUTING:
├─ Amount Match
│  ├─ 0-50K → Tier 1
│  ├─ 50K-200K → Tier 2
│  ├─ 200K-500K → Tier 3
│  └─ 500K+ → Tier 4
│
├─ Origin Type Match
│  ├─ Branch origin → Use branch-level approvers
│  ├─ HQ origin → Use HQ-level approvers
│  └─ Field origin → Use field-level approvers
│
└─ Fast-Track Check
   ├─ Is urgent? → Yes/No
   ├─ Does threshold allow fast-track? → Yes/No
   ├─ Skip intermediate approvers? → Yes/No
   └─ Apply minimum roles still

PAYMENT VALIDATION:
├─ Is balance sufficient? → Yes/No
├─ Is payment method supported? → Yes/No
├─ Is destination valid? → Yes/No
├─ Is 2FA required? → Yes/No
├─ Is OTP verified? → Yes/No
└─ Execute payment → Success/Failed

FUND REPLENISHMENT:
├─ Is balance < reorder level? → Yes/No
├─ Is auto-replenish enabled? → Yes/No
├─ Create replenishment request → Pending
└─ Await approval/execution → Complete
```

---

This comprehensive flow documentation shows how the complete petty cash system works from requisition through payment with all the business logic, security checks, and audit trails intact.
