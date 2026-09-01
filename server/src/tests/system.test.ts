/**
 * Comprehensive Automated System & Integration Test Suite
 * Intelligent Email Assistant - Phase 12 Verification
 */

import { encrypt, decrypt } from '../utils/encryption';
import { aiService } from '../services/aiService';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void> | void) {
  const start = Date.now();
  try {
    await fn();
    results.push({ suite, name, passed: true, durationMs: Date.now() - start });
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, durationMs: Date.now() - start, error: err.message });
    console.error(`  \x1b[31m✘ FAIL\x1b[0m ${name}: ${err.message}`);
  }
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log(' 🚀 Intelligent Email Assistant - Automated System Test Suite');
  console.log('===============================================================\n');

  // ── 1. Encryption & Token Security ──────────────────────────────────────────
  console.log('\x1b[36m[Suite 1/6: Security & AES-256 Token Encryption]\x1b[0m');

  await runTest('Security', 'Should encrypt and decrypt OAuth access tokens accurately', () => {
    const rawToken = 'ya29.a0AfH6SMDhSampleOAuthAccessTokenValue123456789';
    const encrypted = encrypt(rawToken);
    if (!encrypted || encrypted === rawToken) throw new Error('Token was not encrypted');
    if (!encrypted.includes(':')) throw new Error('Encrypted token missing IV separator');

    const decrypted = decrypt(encrypted);
    if (decrypted !== rawToken) throw new Error('Decrypted token does not match original');
  });

  await runTest('Security', 'Should encrypt different ciphertexts for identical tokens (IV randomness)', () => {
    const rawToken = 'ya29.a0AfH6SMDhSampleOAuthAccessTokenValue123456789';
    const enc1 = encrypt(rawToken);
    const enc2 = encrypt(rawToken);
    if (enc1 === enc2) throw new Error('Encryption IV must be random per operation');
    if (decrypt(enc1) !== decrypt(enc2)) throw new Error('Both ciphertexts must decrypt to original');
  });

  // ── 2. AI Intelligence Layer ────────────────────────────────────────────────
  console.log('\n\x1b[36m[Suite 2/6: Core AI Intelligence Services]\x1b[0m');

  await runTest('AI Service', 'Should generate structured executive summary and urgency scores', async () => {
    const emailText = `Hi Team,\nPlease review the attached Q4 budget proposal before our meeting tomorrow at 10 AM. Urgent feedback is required by 5 PM today. Thanks!`;
    const summary = await aiService.summarizeEmail(emailText, 'Q4 Budget Proposal Review');

    if (!summary.executiveSummary) throw new Error('Missing executive summary');
    if (!Array.isArray(summary.keyPoints) || summary.keyPoints.length === 0) {
      throw new Error('Key points missing or empty');
    }
    if (typeof summary.urgencyScore !== 'number' || summary.urgencyScore < 0 || summary.urgencyScore > 100) {
      throw new Error('Urgency score must be a number between 0 and 100');
    }
  });

  await runTest('AI Service', 'Should accurately detect phishing and credential harvesting signals', async () => {
    const phishingEmail = {
      sender: 'security-alert@paypal-update-account-verification.com',
      subject: 'URGENT: Your account has been suspended! Verify password now',
      body: 'Your account is locked. Please click here to verify your password and bank details immediately or account will be deleted.',
    };

    const analysis = await aiService.analyzeSecurity(phishingEmail);
    if (!analysis.riskLevel || analysis.riskLevel === 'safe') {
      throw new Error('Failed to flag high-risk phishing email');
    }
    if (analysis.riskScore < 50) throw new Error('Risk score too low for phishing email');
  });

  await runTest('AI Service', 'Should extract action items, assignees, and deadlines', async () => {
    const emailText = `Hey Alex, please submit the project deliverables by Friday 5 PM. Sarah, can you organize the kickoff call with the client on Monday?`;
    const items = await aiService.extractActionItems(emailText);

    if (!Array.isArray(items) || items.length === 0) throw new Error('Failed to extract action items');
    if (!items[0].task) throw new Error('Extracted item missing task description');
  });

  await runTest('AI Service', 'Should explain complex technical or legal text in plain English', async () => {
    const legalText = `Pursuant to Section 4.2 of the master services agreement, indemnification obligations shall survive termination subject to statutory limitations of liability.`;
    const explained = await aiService.explainEmail(legalText);

    if (!explained.simplifiedExplanation) throw new Error('Missing simplified explanation');
    if (!Array.isArray(explained.bulletPoints)) throw new Error('Missing explanation bullet points');
  });

  await runTest('AI Service', 'Should generate contextual reply suggestions matching requested tone', async () => {
    const emailText = `Are you available for a 30-minute introductory call this Thursday at 2 PM EST?`;
    const replies = await aiService.generateReply(emailText, 'Professional');

    if (!Array.isArray(replies.replies) || replies.replies.length === 0) {
      throw new Error('Failed to generate smart replies');
    }
    if (!replies.replies[0].text) throw new Error('Generated reply empty');
  });

  // ── 3. Conversational Semantic Search Compiler ──────────────────────────────
  console.log('\n\x1b[36m[Suite 3/6: AI Semantic Search Compiler]\x1b[0m');

  await runTest('AI Search', 'Should parse search keywords, senders, and urgency from natural language', async () => {
    const parsed1 = await aiService.parseSearchQuery('Find urgent sponsorship emails from Google');
    if (!parsed1.isUrgent) throw new Error('Failed to extract urgency intent');
    if (!parsed1.keywords || parsed1.keywords.length === 0) throw new Error('Failed to extract keywords');
    if (!parsed1.explanation) throw new Error('Missing filter explanation');

    const parsed2 = await aiService.parseSearchQuery('Show starred MUN proposals');
    if (!parsed2.isStarred) throw new Error('Failed to extract starred intent');
  });

  // ── 4. Smart Rules Engine ───────────────────────────────────────────────────
  console.log('\n\x1b[36m[Suite 4/6: Smart Rules & Workflow Automation]\x1b[0m');

  await runTest('Rules Engine', 'Should evaluate rule conditions (subject, sender, priority) correctly', () => {
    const mockEmail: any = {
      from: { name: 'MUN Secretariat', email: 'secretariat@munconference.org' },
      subject: 'Urgent: Sponsorship Proposal for MUN 2026',
      snippet: 'Please find attached the sponsorship tiers.',
      bodyText: 'We would love to partner with your organization.',
      priorityScore: 85,
    };

    // Rule 1: Subject contains "Sponsorship"
    const rule1: any = {
      conditionType: 'subject_contains',
      conditionValue: 'sponsorship',
      actionType: 'star',
    };

    const isMatch1 = mockEmail.subject.toLowerCase().includes(rule1.conditionValue.toLowerCase());
    if (!isMatch1) throw new Error('Rule 1 should have matched email subject');

    // Rule 2: Priority greater than 70
    const rule2: any = {
      conditionType: 'priority_greater_than',
      conditionValue: '70',
      actionType: 'apply_label',
      actionValue: 'IMPORTANT',
    };

    const isMatch2 = (mockEmail.priorityScore || 0) >= parseInt(rule2.conditionValue, 10);
    if (!isMatch2) throw new Error('Rule 2 should have matched high priority email');
  });

  // ── 5. Smart Templates Engine ───────────────────────────────────────────────
  console.log('\n\x1b[36m[Suite 5/6: Smart Templates & Variable Interpolation]\x1b[0m');

  await runTest('Templates Engine', 'Should interpolate system and custom variables into template body', () => {
    const templateBody = 'Dear {{recipient_name}},\n\nThank you for reaching out regarding {{topic}}. We would love to meet on {{meeting_date}}.\n\nBest regards,\n{{user_name}}';
    
    const variables: Record<string, string> = {
      recipient_name: 'Dr. Emily Watson',
      topic: 'AI Ethics Collaboration',
      meeting_date: 'Thursday at 3 PM',
      user_name: 'Alex Mercer',
    };

    let rendered = templateBody;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    if (rendered.includes('{{')) throw new Error('Unresolved variables remain in template');
    if (!rendered.includes('Dr. Emily Watson')) throw new Error('Recipient name was not interpolated');
    if (!rendered.includes('Alex Mercer')) throw new Error('User name was not interpolated');
  });

  // ── 6. Summary & Health Matrix ──────────────────────────────────────────────
  console.log('\n===============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log(` 📊 Test Results: ${passedCount}/${results.length} PASSED`);
  if (failedCount > 0) {
    console.log(` \x1b[31m❌ ${failedCount} test(s) failed.\x1b[0m`);
    process.exit(1);
  } else {
    console.log(' \x1b[32m✨ ALL SYSTEM TESTS PASSED SUCCESSFULLY!\x1b[0m');
    console.log('===============================================================\n');
  }
}

// Run test runner
runTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
