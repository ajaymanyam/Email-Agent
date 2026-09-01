1. Project Overview & Tech Stack
Project Overview

Build a full-stack AI-powered email management and productivity platform called Intelligent Email Assistant.

The application must connect securely to real email providers, beginning with Gmail through Google OAuth 2.0 and the Gmail API, and provide users with a modern email-client interface enhanced by artificial intelligence.

The platform must allow users to:

Securely connect one or more email accounts.
View and manage inboxes.
Read email conversations and threads.
Search emails using normal and AI-powered search.
Mark emails as read/unread.
Star, archive, delete, and organize emails.
Detect important and high-priority emails.
Detect potential spam and phishing messages.
Summarize long emails and conversations.
Explain complicated emails in simple language.
Generate AI-assisted replies.
Select a reply tone.
Rewrite and improve email drafts.
Correct grammar and spelling.
Generate subject lines.
Extract action items, dates, deadlines, and important information.
Compose and send emails.
Use email templates.
Manage bulk email actions.
Connect calendar services for detected events and deadlines.
Receive daily AI-generated inbox summaries.
View email productivity analytics.
Use optional voice-to-email functionality.
Connect multiple email accounts.
Eventually support providers such as Outlook in addition to Gmail.

The application must combine traditional email functionality with an intelligent AI assistant layer.

Primary Workflow
User
  ↓
Application Login
  ↓
Connect Email Account
  ↓
OAuth Authentication
  ↓
Provider API
  ↓
Inbox Synchronization
  ↓
Email Dashboard
  ↓
Read / Search / Organize
  ↓
AI Analysis
  ├── Summarize
  ├── Explain
  ├── Classify Priority
  ├── Detect Spam / Phishing
  ├── Extract Actions
  ├── Extract Dates
  └── Generate Reply
          ↓
      Edit / Rewrite
          ↓
      User Approval
          ↓
      Send Email
          ↓
      Activity History
          ↓
      Analytics
2. Tech Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Zustand
Axios
Lucide React
React Hook Form
Zod
Recharts
Web Speech API for voice-to-email where supported
Backend
Node.js
Express
TypeScript
MongoDB
Mongoose
JWT
bcrypt
Helmet
CORS
express-validator
express-rate-limit
Axios
Structured logging
AI
OpenRouter API as the primary AI gateway
Google Gemini as fallback
LangChain for reusable AI workflows where appropriate
Structured JSON AI responses
Prompt templates
AI service abstraction
Email Integrations
Gmail API
Google OAuth 2.0
Microsoft Graph API for Outlook support
Provider abstraction so additional email providers can be added later
Calendar Integration
Google Calendar API
Google OAuth scopes for calendar access only when explicitly requested by the user
Database
MongoDB
Mongoose
Indexed email metadata
Persistent AI results
Activity history
User preferences
Email account connections
Deployment

The application must be structured for production deployment with:

HTTPS
Environment variables
Production database
Production OAuth redirect URLs
Secure frontend/backend communication
Separate frontend and backend deployment where appropriate
3. Authentication & Account Management
Application Authentication

The platform must have its own authentication system.

Users must be able to:

Register.
Login.
Logout.
Retrieve their profile.
Update their profile.
Manage application sessions.
Delete their application account where supported.

Passwords must never be stored as plaintext.

Passwords must be hashed using bcrypt.

JWT authentication must be used for protected backend APIs.

The frontend must persist authenticated state securely.

Protected routes must redirect unauthenticated users to /login.

4. Email Provider Authentication
Gmail OAuth

The application must use Google OAuth 2.0 for Gmail.

The application must never ask the user for their Gmail password.

Required flow:

Connect Gmail
    ↓
Google Login
    ↓
Google Consent Screen
    ↓
OAuth Authorization Code
    ↓
Backend OAuth Callback
    ↓
Exchange Code For Tokens
    ↓
Encrypt Tokens
    ↓
Store Connection
    ↓
Access Gmail API

The backend must manage OAuth tokens.

Access tokens and refresh tokens must:

Never be exposed to the frontend.
Never be stored in browser local storage.
Never be committed to source control.
Never be written to logs.
Be encrypted at rest.

The application must support token refresh.

The application must clearly identify:

Connected
Disconnected
Authorization expired
Authorization revoked
Connection error
5. Multiple Email Accounts

The application must support connecting multiple email accounts.

Initially supported providers:

Gmail
Outlook/Microsoft 365

Users must be able to:

Connect another account.
View connected accounts.
Select an active account.
Disconnect an account.
Identify which account owns an email.
Compose emails from a selected account.

The architecture must use a provider abstraction:

EmailProvider
    ├── GmailProvider
    └── OutlookProvider

Adding another provider should not require rewriting the entire email system.

6. Email Dashboard
Main Dashboard

The dashboard must resemble a modern AI-enhanced email client.

It must include:

Sidebar.
Inbox.
Search.
Email list.
Account selector.
Unread count.
Priority indicators.
Important email indicators.
Star indicators.
Attachment indicators.
AI-generated labels.
Compose button.
Refresh button.
Notification area.

Sidebar sections:

Inbox
Starred
Important
Sent
Drafts
Archived
Spam
Trash
AI Priority
Action Items
Templates
Analytics
Activity
Settings
7. Email Threads

Users must be able to view complete email conversations.

Thread view must display:

Sender.
Recipients.
CC/BCC where available.
Subject.
Timestamp.
Message body.
Attachments.
Labels.
Read/unread state.
Star state.

Messages within a conversation must be grouped into a thread.

Users must be able to:

Expand messages.
Collapse messages.
Reply.
Reply all.
Forward.
Archive.
Delete.
Star.
Mark read/unread.
8. Email Search
Standard Search

Users must be able to search using:

Sender.
Recipient.
Subject.
Keywords.
Date.
Labels.
Attachments.
Read/unread state.

Gmail-native search operators should be supported where practical.

Examples:

from:john@example.com
subject:invoice
has:attachment
is:unread
after:2026/08/01
9. AI-Powered Smart Search

The application must provide an optional AI search mode.

Instead of requiring Gmail syntax, users should be able to search naturally.

Examples:

"Show emails from clients that need a response."

"Find emails about invoices from this month."

"Show messages where someone asked me for a deadline."

"Find unread emails related to the project launch."

The AI search layer should translate natural language into safe search criteria.

The system must never allow generated search expressions to bypass authorization or access another user's emails.

10. Basic Email Management

Users must be able to:

Mark read.
Mark unread.
Star.
Unstar.
Archive.
Delete.
Restore where supported.
Move to spam.
Remove from spam.
Apply/remove labels where supported.
Refresh inbox.

All actions must update the real email provider.

The frontend should update optimistically where safe and revert changes if the API operation fails.

11. Bulk Email Management

Users must be able to select multiple emails.

Bulk operations should include:

Mark read.
Mark unread.
Star.
Unstar.
Archive.
Delete.
Move to spam.
Apply labels where supported.

The UI must display:

Number of selected emails.
Available bulk actions.
Confirmation for destructive operations.

Long-running bulk operations must provide progress feedback.

12. AI Email Summarization

Users must be able to select Summarize Email.

The AI should analyze a message or complete thread and return:

Main topic.
Executive summary.
Key points.
Important decisions.
Requests.
Action items.
Dates.
Deadlines.
Important participants.

Example:

AI Summary

Topic:
Client project approval

Summary:
The client approved the revised proposal and requested
development to begin next Monday.

Key Points:
• Proposal approved
• Development starts Monday
• Final delivery requested next Friday

Action Items:
• Send implementation schedule
• Confirm development start date

Deadline:
Friday, September 4

The original email must always remain accessible.

13. Explain This Email

The application must provide an Explain This Email feature.

It should explain:

What the sender is saying.
What the sender wants.
Why the email matters.
Technical terminology.
Important context.
Required actions.
Deadlines.

The explanation should be written in simple language.

14. AI Priority Detection

The AI should automatically classify emails into:

Critical
High
Normal
Low

The classifier should consider:

Urgency.
Deadline.
Direct request.
Business impact.
Sender context.
Required action.
Time sensitivity.

The user must be able to override AI classification.

15. AI Inbox Prioritization

The dashboard should include an AI Priority Inbox.

The AI should rank messages based on likely importance.

Possible ranking factors:

Urgency
+ Deadline
+ Action Required
+ Sender Importance
+ Conversation Context
+ User Preferences

The interface should explain why an email received a high priority score.

Example:

High Priority — Contains a deadline and requires a response from you.

AI prioritization must remain advisory and must not silently delete or send messages.

16. Spam & Phishing Detection

The application should provide AI-assisted spam/phishing analysis.

The system should look for signals such as:

Suspicious sender.
Suspicious links.
Urgent financial requests.
Credential requests.
Impersonation.
Unusual attachments.
Suspicious language.

Possible results:

Safe
Suspicious
Likely Spam
Likely Phishing

The application must clearly state that AI detection is advisory.

The AI must not automatically delete potentially dangerous emails without explicit user-configured rules.

17. Important Email Detection

AI should identify potentially important messages based on:

Direct requests.
Deadlines.
Important contacts.
Business context.
Financial information.
Meeting invitations.
Customer/client communications.

Users should be able to mark an email as important manually.

18. AI Reply Generation

Users must be able to generate replies from an email thread.

The AI should use:

Current email.
Relevant thread context.
Selected tone.
User instructions.

Supported tones:

Professional
Friendly
Formal
Concise

Optional custom instruction:

"Politely decline the request and suggest next Tuesday."

The AI response must appear as a draft.

The system must never automatically send an AI-generated response.

Required workflow:

Generate Reply
    ↓
AI Draft
    ↓
User Review
    ↓
User Edit
    ↓
User Confirmation
    ↓
Send
19. Grammar Correction & Email Rewriting

Users must be able to select text or a draft and request:

Correct grammar.
Improve clarity.
Make professional.
Make concise.
Make friendly.
Make formal.
Rewrite completely.

The original draft should remain recoverable until the user accepts the generated version.

20. AI Subject Line Generation

When composing or replying to an email, users should be able to request AI-generated subject suggestions.

The AI should generate multiple relevant subject lines.

Example:

Suggested Subjects

1. Project Timeline Confirmation
2. Confirmation of Next Week's Project Schedule
3. Project Delivery Timeline — Next Steps

The user must choose the final subject.

21. Action Item Extraction

The system must identify tasks from email content.

Each extracted action should contain where possible:

Task.
Deadline.
Person responsible.
Source email.
Confidence.

Example:

Action Items

☐ Review proposal
Due: September 2

☐ Send feedback
Due: September 4

Users should be able to mark extracted tasks as completed.

22. Date & Deadline Extraction

The AI should detect:

Meeting dates.
Deadlines.
Delivery dates.
Follow-up dates.
Payment dates.
Renewal dates.

The application should display detected dates within the email intelligence panel.

Users should be able to add supported dates to their calendar.

23. Calendar Integration

The application should support Google Calendar integration.

Users must explicitly authorize calendar access.

The AI should detect potential calendar events.

Example:

Detected Event

Project Review Meeting
September 4
3:00 PM

User actions:

Add to Calendar.
Edit details.
Ignore.

The application must never create calendar events automatically without explicit user confirmation.

24. AI Daily Email Summary

The application should generate a daily summary containing:

Total emails received.
Important emails.
Unread high-priority emails.
Emails requiring responses.
Deadlines.
Meetings.
Action items.
Potential spam/phishing alerts.

Example:

Good morning.

You received 47 emails yesterday.

12 require attention.

Top priorities:
1. Client approval — response required
2. Invoice confirmation — deadline tomorrow
3. Team meeting — today at 3 PM

You have 5 outstanding action items.

This summary should be accessible from the dashboard and optionally delivered through a configured notification channel.

25. Email Templates

Users must be able to create and manage reusable email templates.

Template fields:

Name.
Subject.
Body.
Category.
Created date.
Updated date.

Users should be able to:

Create.
Edit.
Delete.
Duplicate.
Insert into compose.

AI may optionally personalize a template using the current email context.

26. Voice-to-Email

The application should provide optional voice-to-email functionality using browser speech recognition where supported.

Workflow:

Click Voice Input
      ↓
Speak Email
      ↓
Speech-to-Text
      ↓
Draft Generated
      ↓
AI Cleanup
      ↓
User Review
      ↓
Send

The application must clearly indicate when microphone access is active.

Voice-generated content must never be sent without user confirmation.

If browser speech recognition is unavailable, the application must fall back to normal text input.

27. AI Email Assistant

The application should provide a contextual assistant panel.

The assistant may answer questions about the currently opened email/thread.

Examples:

"What does the sender need from me?"

"Summarize this conversation."

"What are the deadlines?"

"Draft a polite response."

"Explain the technical part."

"List everything I need to do."

"Make this reply shorter."

The assistant must only access emails the authenticated user is authorized to access.

28. Email Analytics

The application must provide an analytics dashboard.

Metrics should include:

Emails received.
Emails sent.
Emails replied to.
Unread emails.
Average response time.
Number of high-priority emails.
AI summaries generated.
AI replies generated.
Emails archived.
Emails deleted.
Action items extracted.
Most active correspondents.
Email volume by day/week/month.

Charts should include:

Incoming email trend.
Outgoing email trend.
Response-time trend.
Priority distribution.
Email category distribution.

The analytics page must not expose another user's information.

29. Email Categories

The system should support AI-assisted categories such as:

Work
Personal
Finance
Shopping
Travel
Meetings
Projects
Customers
Important
Newsletter
Promotions

Users should be able to modify categories and manually recategorize messages.

30. Smart Email Categorization

The AI should classify incoming emails based on content and context.

Classification must be:

Explainable.
Editable.
User-specific.

The system should learn from explicit user corrections where appropriate.

AI categorization must never override provider labels without user permission.

31. Email History & Activity

The application must maintain an activity history.

Events may include:

Account connected.
Account disconnected.
Email opened.
Email searched.
Email summarized.
Reply generated.
Reply edited.
Email sent.
Email archived.
Email deleted.
Priority classified.
Spam detection performed.
Action items extracted.
Calendar event created.

Each activity should contain:

User.
Account.
Action.
Email/thread reference.
Status.
Timestamp.
Relevant metadata.

Sensitive credentials must never appear in activity logs.

32. Notifications

The application must provide notifications for important events.

Notifications may include:

Gmail connection success.
Gmail connection expiration.
Email sent successfully.
AI operation completed.
AI service unavailable.
High-priority email detected.
Potential phishing detected.
Calendar event detected.
Daily summary ready.

The notification system should include:

Read/unread state.
Timestamp.
Notification type.
Related email where applicable.
33. AI Provider Architecture

The backend must use an AI provider abstraction.

Recommended architecture:

AIService
    ↓
Provider Selection
    ├── OpenRouter
    └── Gemini

Provider selection:

OPENROUTER_API_KEY available
        ↓
Use OpenRouter
        ↓
If unavailable/failure
        ↓
Use Gemini
        ↓
If unavailable
        ↓
Return AI_PROVIDER_UNAVAILABLE

The application should not expose AI provider keys to the browser.

AI operations should use structured outputs where possible.

34. Database Collections
Users

Fields:

name
email
password
role
preferences
createdAt
updatedAt
lastLogin
EmailAccounts

Fields:

owner
provider
email
providerAccountId
encryptedAccessToken
encryptedRefreshToken
scopes
expiresAt
isConnected
createdAt
updatedAt
EmailCache

Fields:

owner
accountId
providerMessageId
providerThreadId
sender
recipients
subject
snippet
labels
category
priority
isRead
isStarred
receivedAt
cachedAt
AIResults

Fields:

owner
accountId
messageId
threadId
type
content
metadata
confidence
model
createdAt
Activities

Fields:

owner
accountId
messageId
threadId
action
status
metadata
createdAt
EmailTemplates

Fields:

owner
name
subject
body
category
createdAt
updatedAt
ActionItems

Fields:

owner
messageId
threadId
task
deadline
responsiblePerson
confidence
status
createdAt
Notifications

Fields:

owner
type
title
message
messageId
isRead
createdAt
CalendarEvents

Fields:

owner
accountId
messageId
calendarEventId
title
startTime
endTime
status
createdAt
35. API Endpoints
Health
GET /api/health — System health.
Authentication
POST /api/auth/register — Register.
POST /api/auth/login — Login.
POST /api/auth/logout — Logout.
GET /api/auth/me — Current user.
PUT /api/auth/profile — Update profile.
Email Accounts
GET /api/accounts — List connected accounts.
GET /api/accounts/:id — Get account.
GET /api/accounts/:id/status — Account status.
POST /api/accounts/:id/disconnect — Disconnect account.
GET /api/gmail/oauth/start — Start Gmail OAuth.
GET /api/gmail/oauth/callback — Gmail OAuth callback.
GET /api/outlook/oauth/start — Start Outlook OAuth.
GET /api/outlook/oauth/callback — Outlook OAuth callback.
Emails
GET /api/emails — List emails.
GET /api/emails/search — Search emails.
GET /api/emails/:id — Get email.
GET /api/emails/thread/:threadId — Get thread.
PATCH /api/emails/:id/read — Read/unread.
PATCH /api/emails/:id/star — Star/unstar.
POST /api/emails/:id/archive — Archive.
DELETE /api/emails/:id — Delete.
POST /api/emails/bulk — Bulk operations.
Sending
POST /api/emails/send — Send email.
POST /api/emails/:id/reply — Reply.
POST /api/emails/:id/forward — Forward.
AI
POST /api/ai/summarize
POST /api/ai/generate-reply
POST /api/ai/explain
POST /api/ai/classify-priority
POST /api/ai/detect-phishing
POST /api/ai/extract-actions
POST /api/ai/extract-dates
POST /api/ai/generate-subject
POST /api/ai/rewrite
POST /api/ai/categorize
POST /api/ai/smart-search
POST /api/ai/daily-summary
Templates
GET /api/templates
POST /api/templates
PUT /api/templates/:id
DELETE /api/templates/:id
Action Items
GET /api/action-items
PATCH /api/action-items/:id
DELETE /api/action-items/:id
Calendar
GET /api/calendar/events
POST /api/calendar/events
POST /api/calendar/connect
POST /api/calendar/disconnect
Analytics
GET /api/analytics/overview
GET /api/analytics/email-volume
GET /api/analytics/response-time
GET /api/analytics/priority
GET /api/analytics/ai-usage
Activities
GET /api/activities
GET /api/activities/:id
Notifications
GET /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
36. Frontend Pages
/

Landing page containing:

Product introduction.
AI feature showcase.
Gmail/Outlook integration explanation.
Security explanation.
Feature overview.
Login CTA.
Register CTA.
Connect account CTA.
/login

Application authentication.

/register

User registration.

/dashboard

Main AI inbox.

Includes:

Inbox.
Search.
Priority.
AI insights.
Recent emails.
Action items.
Daily summary.
Connected account selector.
/emails/[id]

Thread detail page.

Includes:

Full thread.
AI summary.
AI assistant.
Priority.
Phishing analysis.
Action items.
Dates.
Reply composer.
Forward.
Email controls.
/compose

Compose email.

Includes:

To.
CC.
BCC.
Subject.
Body.
Templates.
AI subject generator.
AI rewrite.
Grammar correction.
Voice input.
Send.
/templates

Email template management.

/action-items

Extracted task management.

/analytics

Email analytics and charts.

/activities

User activity history.

/accounts

Connected Gmail/Outlook accounts.

/settings

Contains:

Profile.
Account settings.
AI preferences.
Default tone.
Notification settings.
Security.
Connected accounts.
Calendar integration.
Theme.
37. Frontend Folder Structure
client/
└── src/
    ├── components/
    │   ├── AppShell/
    │   ├── Sidebar/
    │   ├── TopBar/
    │   ├── SearchBar/
    │   ├── AccountSwitcher/
    │   ├── EmailList/
    │   ├── EmailRow/
    │   ├── EmailThread/
    │   ├── EmailMessage/
    │   ├── Compose/
    │   ├── ReplyComposer/
    │   ├── AISummary/
    │   ├── AIAssistant/
    │   ├── AIReplyPanel/
    │   ├── PriorityBadge/
    │   ├── PhishingWarning/
    │   ├── ActionItems/
    │   ├── CalendarEventCard/
    │   ├── TemplateSelector/
    │   ├── VoiceInput/
    │   ├── Analytics/
    │   ├── NotificationCenter/
    │   ├── LoadingSkeleton/
    │   ├── EmptyState/
    │   └── ProtectedRoute/
    │
    ├── pages/
    │   ├── _app.tsx
    │   ├── index.tsx
    │   ├── login.tsx
    │   ├── register.tsx
    │   ├── dashboard.tsx
    │   ├── compose.tsx
    │   ├── templates.tsx
    │   ├── action-items.tsx
    │   ├── analytics.tsx
    │   ├── activities.tsx
    │   ├── accounts.tsx
    │   ├── settings.tsx
    │   └── emails/
    │       └── [id].tsx
    │
    ├── store/
    │   ├── authStore.ts
    │   ├── emailStore.ts
    │   ├── accountStore.ts
    │   └── uiStore.ts
    │
    ├── services/
    │   ├── api.ts
    │   ├── authApi.ts
    │   ├── emailApi.ts
    │   ├── accountApi.ts
    │   ├── aiApi.ts
    │   ├── calendarApi.ts
    │   └── analyticsApi.ts
    │
    ├── hooks/
    │   ├── useEmails.ts
    │   ├── useAI.ts
    │   └── useVoiceInput.ts
    │
    └── types/
        ├── auth.ts
        ├── email.ts
        ├── account.ts
        ├── ai.ts
        ├── activity.ts
        └── analytics.ts
38. Backend Folder Structure
server/
└── src/
    ├── config/
    │   ├── env.ts
    │   ├── db.ts
    │   ├── google.ts
    │   ├── microsoft.ts
    │   └── ai.ts
    │
    ├── routes/
    │   ├── authRoutes.ts
    │   ├── accountRoutes.ts
    │   ├── emailRoutes.ts
    │   ├── aiRoutes.ts
    │   ├── templateRoutes.ts
    │   ├── actionItemRoutes.ts
    │   ├── calendarRoutes.ts
    │   ├── analyticsRoutes.ts
    │   ├── activityRoutes.ts
    │   └── notificationRoutes.ts
    │
    ├── controllers/
    │   ├── authController.ts
    │   ├── accountController.ts
    │   ├── emailController.ts
    │   ├── aiController.ts
    │   ├── templateController.ts
    │   ├── actionItemController.ts
    │   ├── calendarController.ts
    │   ├── analyticsController.ts
    │   └── activityController.ts
    │
    ├── services/
    │   ├── authService.ts
    │   ├── accountService.ts
    │   ├── emailService.ts
    │   ├── oauthService.ts
    │   ├── aiService.ts
    │   ├── activityService.ts
    │   ├── analyticsService.ts
    │   ├── templateService.ts
    │   ├── actionItemService.ts
    │   ├── calendarService.ts
    │   └── notificationService.ts
    │
    ├── ai/
    │   ├── providers/
    │   │   ├── openrouter.ts
    │   │   └── gemini.ts
    │   ├── summarizer.ts
    │   ├── replyGenerator.ts
    │   ├── priorityClassifier.ts
    │   ├── phishingDetector.ts
    │   ├── actionExtractor.ts
    │   ├── dateExtractor.ts
    │   ├── subjectGenerator.ts
    │   ├── emailRewriter.ts
    │   ├── categorizer.ts
    │   ├── smartSearch.ts
    │   └── dailySummary.ts
    │
    ├── integrations/
    │   ├── baseEmailProvider.ts
    │   ├── gmail/
    │   │   ├── gmailClient.ts
    │   │   ├── gmailAuth.ts
    │   │   ├── gmailMessages.ts
    │   │   └── gmailThreads.ts
    │   ├── outlook/
    │   │   ├── outlookClient.ts
    │   │   ├── outlookAuth.ts
    │   │   └── outlookMessages.ts
    │   └── googleCalendar/
    │       ├── calendarClient.ts
    │       └── calendarEvents.ts
    │
    ├── middleware/
    │   ├── auth.ts
    │   ├── validation.ts
    │   ├── errorHandler.ts
    │   ├── rateLimiter.ts
    │   └── requestLogger.ts
    │
    ├── models/
    │   ├── User.ts
    │   ├── EmailAccount.ts
    │   ├── EmailCache.ts
    │   ├── AIResult.ts
    │   ├── Activity.ts
    │   ├── EmailTemplate.ts
    │   ├── ActionItem.ts
    │   ├── CalendarEvent.ts
    │   └── Notification.ts
    │
    └── utils/
        ├── encryption.ts
        ├── jwt.ts
        ├── emailParser.ts
        ├── emailSanitizer.ts
        └── logger.ts
39. Development Phases
Phase 1 — Project Foundation

Implement:

Next.js.
Express.
TypeScript.
MongoDB.
Environment configuration.
JWT authentication.
bcrypt.
Protected routes.
AppShell.
Login.
Registration.
Base API architecture.
Error handling.
Phase 2 — Gmail OAuth

Implement:

Google Cloud configuration.
Gmail OAuth.
OAuth callback.
Token exchange.
Token encryption.
Token refresh.
Account persistence.
Connection status.
Disconnect.

At completion, users must be able to connect a real Gmail account.

Phase 3 — Email Client

Implement:

Inbox.
Email list.
Thread view.
Search.
Read/unread.
Star.
Archive.
Delete.
Spam.
Refresh.
Labels where supported.

At completion, the application should operate as a functional Gmail client.

Phase 4 — Compose & Email Sending

Implement:

Compose.
Reply.
Reply all.
Forward.
CC.
BCC.
Email validation.
Sending.
Error recovery.
Activity logging.
Phase 5 — Core AI

Implement:

AI provider abstraction.
OpenRouter.
Gemini fallback.
Summarization.
Reply generation.
Tone selection.
Email explanation.
Phase 6 — Advanced AI Intelligence

Implement:

Priority detection.
AI inbox prioritization.
Spam detection.
Phishing detection.
Important email detection.
Smart categorization.
Action extraction.
Date/deadline extraction.
Subject generation.
Grammar correction.
Email rewriting.
Phase 7 — Productivity Features

Implement:

Action-item dashboard.
Email templates.
AI assistant.
Bulk email management.
Daily email summary.
Notification center.
Phase 8 — Calendar & Voice

Implement:

Google Calendar OAuth.
Event extraction.
Calendar event preview.
User-confirmed calendar creation.
Voice-to-email.
Speech-to-text fallback handling.
Phase 9 — Multiple Accounts & Outlook

Implement:

Email provider abstraction.
Multiple Gmail accounts.
Outlook OAuth.
Microsoft Graph integration.
Account switching.
Provider-specific error handling.
Phase 10 — Analytics

Implement:

Email volume analytics.
Sent/received statistics.
Response-time analytics.
Priority distribution.
AI usage analytics.
Productivity dashboard.
Charts.
Phase 11 — Security & Production Hardening

Implement:

Helmet.
CORS.
Rate limiting.
Input validation.
OAuth security.
Token encryption.
Secure cookies/session handling where applicable.
Error boundaries.
Logging.
Secret management.
API authorization.
Account ownership checks.
Production configuration.
Phase 12 — Testing & Deployment

Test:

Registration.
Login.
OAuth.
Token refresh.
Email fetching.
Email searching.
Thread loading.
Email management.
Sending.
Replying.
AI summarization.
AI replies.
AI classification.
Phishing detection.
Action extraction.
Calendar integration.
Multiple accounts.
Outlook.
Bulk operations.
Analytics.
Mobile responsiveness.

Deploy the application with:

Production frontend.
Production backend.
Production MongoDB.
HTTPS.
Production OAuth redirect URLs.
Production environment variables.

The final application must work with real email accounts.

40. UI & UX Requirements

The application must use a modern AI productivity interface.

The design should feel closer to a combination of a professional email client and an AI productivity assistant than a generic dashboard.

Requirements:

Responsive design.
Desktop and mobile layouts.
Dark/light theme.
Sidebar navigation.
Email list/detail interface.
Clear unread indicators.
AI panels.
Contextual actions.
Toast notifications.
Loading skeletons.
Empty states.
Error states.
Confirmation dialogs.
Keyboard-friendly interactions.

AI-generated content must always be visually distinguished from original email content.

Potential phishing messages must display a highly visible warning.

Destructive actions such as delete should require confirmation where appropriate.

41. Security Requirements

The application must:

Never request email passwords.
Use OAuth for email access.
Keep OAuth client secrets server-side.
Keep AI keys server-side.
Encrypt OAuth tokens at rest.
Never log OAuth tokens.
Never return OAuth tokens through APIs.
Never store secrets in Git.
Use HTTPS in production.
Configure strict CORS.
Use Helmet.
Rate-limit authentication.
Validate all API requests.
Verify account ownership.
Prevent cross-user email access.
Sanitize email HTML before rendering.
Protect against XSS from email content.
Handle expired/revoked OAuth authorization.
Never trust AI-generated commands as privileged instructions.
Require user confirmation before sending email.
Require user confirmation before creating calendar events.
Never automatically delete suspected phishing emails.
42. Environment Variables

Required environment configuration should include:

PORT
NODE_ENV
CLIENT_URL

MONGODB_URI

JWT_SECRET

GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REDIRECT_URI

GOOGLE_CALENDAR_REDIRECT_URI

OPENROUTER_API_KEY
GEMINI_API_KEY

CREDENTIAL_ENCRYPTION_KEY

Actual credentials must never be hardcoded.

.env files must be excluded from Git.

A .env.example file must be provided containing variable names but no secrets.

43. Error Handling

The application must provide explicit errors.

Examples:

AUTH_REQUIRED
AUTH_INVALID
EMAIL_ACCOUNT_NOT_CONNECTED
OAUTH_FAILED
OAUTH_PERMISSION_DENIED
OAUTH_TOKEN_EXPIRED
OAUTH_REVOKED
GMAIL_API_FAILURE
OUTLOOK_API_FAILURE
EMAIL_NOT_FOUND
EMAIL_SEND_FAILED
INVALID_EMAIL_ADDRESS
AI_PROVIDER_UNAVAILABLE
AI_GENERATION_FAILED
AI_INVALID_RESPONSE
CALENDAR_NOT_CONNECTED
CALENDAR_EVENT_FAILED
PHISHING_ANALYSIS_FAILED
VALIDATION_ERROR
RATE_LIMITED
UNAUTHORIZED_ACCOUNT_ACCESS

Errors must be understandable to users.

For example:

Gmail authorization has expired. Please reconnect your account.

rather than:

Error 500.

44. AI Reliability & Privacy Requirements

AI features must be treated as assistant functionality rather than authoritative automation.

The application must:

Clearly label AI-generated content.
Never automatically send AI replies.
Never automatically create calendar events.
Never automatically delete emails based solely on AI.
Validate structured AI responses.
Handle malformed AI responses.
Handle provider outages.
Minimize unnecessary email content sent to AI providers.
Never send OAuth tokens to AI providers.
Never send unrelated users' information to AI.
Respect account ownership.
Allow users to reject AI recommendations.

AI-generated classifications should include confidence where practical.

45. Performance Requirements

The application should:

Paginate large inboxes.
Avoid loading entire mailboxes at once.
Cache appropriate email metadata.
Use database indexes.
Debounce search.
Avoid unnecessary AI requests.
Cache reusable AI results where safe.
Load email content on demand.
Use optimistic UI updates for simple actions.
Provide progress indicators for bulk operations.

AI requests should only be made when the user requests the relevant functionality or when the user explicitly enables automatic intelligence features.

46. Final Expected Outcome

The completed Intelligent Email Assistant must be a fully deployed, production-ready AI-enhanced email management platform.

A user must be able to:

Create an application account.
Connect Gmail securely through OAuth.
Connect additional accounts.
View and search their inbox.
Open complete email threads.
Read and manage messages.
Perform bulk operations.
Ask AI to summarize emails.
Ask AI to explain complicated emails.
Detect important messages.
Detect potential spam/phishing.
Automatically classify priority.
Extract action items.
Extract dates and deadlines.
Generate email replies.
Choose reply tone.
Rewrite and correct drafts.
Generate subject lines.
Use email templates.
Compose and send emails.
Use voice-to-email where supported.
Create calendar events after explicit confirmation.
View AI-generated daily summaries.
Manage multiple email accounts.
Use Outlook in addition to Gmail.
View email productivity analytics.
Review complete activity history.

The final product should feel like:

Gmail / Outlook
       +
AI Assistant
       +
Productivity Manager
       +
Email Intelligence
       +
Calendar Assistant
       +
Analytics Dashboard

The application should demonstrate real-world integration rather than being a mock AI interface.

47. Codex & AI Agent Implementation Instructions

The AI coding agent must build the project incrementally and must follow the development phases.

The coding agent must:

Follow the defined architecture.
Keep controllers thin.
Keep business logic inside services.
Never access MongoDB directly from controllers.
Never expose OAuth credentials to frontend code.
Never request email passwords.
Keep provider authentication server-side.
Encrypt OAuth tokens at rest.
Never log secrets.
Use environment variables for all credentials.
Abstract Gmail and Outlook behind a common email-provider interface.
Keep AI providers behind an AI service abstraction.
Use OpenRouter as the primary AI provider.
Use Gemini as a fallback.
Never automatically send AI-generated emails.
Require explicit user confirmation before sending.
Require explicit user confirmation before creating calendar events.
Never automatically delete suspected phishing emails.
Validate all incoming API requests.
Apply authentication middleware to protected endpoints.
Verify account ownership on every email operation.
Sanitize email HTML before rendering.
Handle expired OAuth tokens.
Refresh OAuth tokens when possible.
Surface revoked permissions clearly.
Make AI failures non-fatal to normal email functionality.
Store activity history for important operations.
Build loading, error, success, and empty states.
Make the UI responsive.
Avoid unnecessary AI API calls.
Cache AI results where appropriate.
Paginate large email lists.
Keep Gmail/Outlook as the source of truth for email state.
Do not invent fake email data in the production workflow.
Test actual Gmail API functionality.
Test actual OAuth authentication.
Test actual email sending.
Test token refresh.
Test AI provider fallback.
Test security boundaries between users.
Test mobile responsiveness.
Keep bonus features modular.
Do not allow advanced features to break the core email client.
Use meaningful HTTP status codes.
Return consistent API response structures.
Maintain clean TypeScript types across frontend and backend.
Avoid unnecessary dependencies.
Document important setup requirements.
Provide .env.example.
Never commit real credentials.
Phase Completion Reporting

At the end of every development phase, the coding agent must report:

Phase:
Status:

Files Created:
- ...

Files Modified:
- ...

Features Completed:
- ...

Tests Performed:
- ...

Known Issues:
- ...

Environment Variables Required:
- ...

Next Phase:
- ...
48. Final Project Quality Requirements

The project must not be considered complete merely because the pages exist.

A feature is considered complete only when:

UI
 ↓
Frontend State
 ↓
Backend API
 ↓
Service Layer
 ↓
External Provider / Database / AI
 ↓
Real Response
 ↓
Frontend Update

works correctly.

The final application must avoid:

Fake buttons.
Placeholder AI responses.
Mock Gmail data in production.
Hardcoded credentials.
Exposed OAuth tokens.
Broken OAuth callbacks.
Unimplemented navigation.
Empty dashboard metrics.
AI features that exist only visually.
Send buttons that do not send real emails.
Calendar buttons that do not create real events after confirmation.

The primary goal is to deliver a working, secure, deployed AI email assistant, with the advanced bonus functionality integrated into the same coherent product rather than presented as disconnected demonstrations.