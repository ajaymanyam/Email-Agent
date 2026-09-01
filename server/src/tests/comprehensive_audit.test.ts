import { encrypt, decrypt } from '../utils/encryption';
import { aiService } from '../services/aiService';
import { ruleService } from '../services/ruleService';
import { templateService } from '../services/templateService';
import { sanitizeHtml } from '../utils/sanitize';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ PASS ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL ${message}`);
    failed++;
  }
}

async function runComprehensiveAudit() {
  console.log('\n===============================================================');
  console.log(' 🛡️  Comprehensive Security, Reliability & Isolation Audit');
  console.log('===============================================================\n');

  // 1. AES-256-GCM Authenticated Encryption & Tamper Resistance
  console.log('[Audit 1/6: AES-256-GCM AEAD Cryptographic Integrity]');
  try {
    const rawSecret = 'ya29.a0AfH6SMB_secret_google_oauth_token_1234567890';
    const ciphertext = encrypt(rawSecret);
    const parts = ciphertext.split(':');
    assert(parts.length === 3, 'Ciphertext format must be iv:tag:data');

    const decrypted = decrypt(ciphertext);
    assert(decrypted === rawSecret, 'Decrypted value matches raw secret');

    // Tamper Test: Modify 1 byte of the encrypted ciphertext
    const [ivHex, tagHex, dataHex] = parts;
    const tamperedDataHex =
      dataHex.slice(0, -2) + (dataHex.slice(-2) === 'aa' ? 'bb' : 'aa');
    const tamperedCiphertext = `${ivHex}:${tagHex}:${tamperedDataHex}`;

    let threw = false;
    try {
      decrypt(tamperedCiphertext);
    } catch {
      threw = true;
    }
    assert(threw, 'AES-256-GCM rejects tampered ciphertext with authentication error');
  } catch (err: any) {
    assert(false, `AES-256-GCM audit error: ${err.message}`);
  }

  // 2. HTML Sanitization & XSS Injection Neutralization
  console.log('\n[Audit 2/6: XSS Prevention & Email HTML Sanitizer]');
  try {
    const maliciousPayload = `
      <p>Hello world</p>
      <script>alert('XSS')</script>
      <img src="x" onerror="stealCookies()" />
      <a href="javascript:alert(1)">Click here for free money</a>
      <iframe src="https://evil.com"></iframe>
    `;
    const clean = sanitizeHtml(maliciousPayload);

    assert(!clean.includes('<script>'), 'Strips <script> tags completely');
    assert(!clean.includes('onerror'), 'Strips inline onerror event handlers');
    assert(!clean.includes('javascript:'), 'Neutralizes javascript: pseudo-protocol URIs');
    assert(!clean.includes('<iframe'), 'Strips unsafe <iframe> tags');
    assert(clean.includes('Hello world'), 'Preserves safe textual and paragraph content');
  } catch (err: any) {
    assert(false, `Sanitization audit error: ${err.message}`);
  }

  // 3. AI Intelligence Robustness & Graceful Fallback on Malformed Outputs
  console.log('\n[Audit 3/6: AI Reliability & Malformed Payload Handling]');
  try {
    // Plain English translation
    const legalDoc =
      'The indemnifying party shall hold harmless and defend the indemnified party against all claims, liabilities, losses, and damages arising out of breach of representations.';
    const explanation = await aiService.explainEmail(legalDoc);
    assert(
      (explanation.simplifiedExplanation || '').length > 10,
      'Generates clear plain-English explanation'
    );
    assert(
      Array.isArray(explanation.bulletPoints),
      'Returns structured bulletPoints array'
    );

    // Tone-Aware Replies
    const reply = await aiService.generateReply(
      'Can we reschedule tomorrow’s sync to Friday at 2 PM?',
      'friendly'
    );
    assert(
      Array.isArray(reply.replies) && reply.replies.length >= 1,
      'Generates contextual reply suggestions'
    );

    // Natural Language Search query compiler
    const parsedQuery = await aiService.parseSearchQuery('Find urgent emails from Alice about budget');
    assert(
      parsedQuery.keywords.some((k) => k.toLowerCase().includes('budget') || k.toLowerCase().includes('urgent')),
      'Parses search keywords from natural language'
    );
  } catch (err: any) {
    assert(false, `AI audit error: ${err.message}`);
  }

  // 4. Smart Rules Multi-Condition Evaluation Logic
  console.log('\n[Audit 4/6: Smart Rules Engine Logic]');
  try {
    const ruleAny = {
      name: 'Test Any Rule',
      isEnabled: true,
      conditionMatch: 'any' as const,
      conditions: [
        { field: 'subject' as const, operator: 'contains' as const, value: 'invoice' },
        { field: 'subject' as const, operator: 'contains' as const, value: 'receipt' },
      ],
      actions: [{ type: 'star' as const, value: 'true' }],
      executionCount: 0,
    };

    const isMatch1 = ruleService.evaluateConditions(
      { subject: 'March 2026 Invoice Attached', bodyText: '' } as any,
      ruleAny as any
    );
    assert(isMatch1, 'Rule matches when any condition matches');

    const isMatch2 = ruleService.evaluateConditions(
      { subject: 'Weekend Coffee Catchup', bodyText: '' } as any,
      ruleAny as any
    );
    assert(!isMatch2, 'Rule rejects non-matching emails');
  } catch (err: any) {
    assert(false, `Rule engine audit error: ${err.message}`);
  }

  // 5. Smart Templates Variable Interpolation
  console.log('\n[Audit 5/6: Template Variable Substitution]');
  try {
    const templateBody = 'Hello {{recipient_name}}, Welcome to {{company_name}} in {{year}}!';
    const filled = templateService.interpolateVariables(templateBody, {
      recipient_name: 'Dr. Sarah',
      company_name: 'Antigravity AI',
      year: '2026',
    });
    assert(
      filled === 'Hello Dr. Sarah, Welcome to Antigravity AI in 2026!',
      'Interpolates all custom and system variables accurately'
    );
  } catch (err: any) {
    assert(false, `Template audit error: ${err.message}`);
  }

  // 6. Security Scanners (Phishing Detection)
  console.log('\n[Audit 6/6: Phishing & Threat Detection]');
  try {
    const scamEmail = {
      sender: 'security-alert@verify-apple-id-urgent-login.ru',
      subject: 'URGENT: Your account has been suspended! Verify password now!',
      body: 'Click here immediately to enter your login password or your account will be deleted permanently.',
    };
    const scan = await aiService.analyzeSecurity(scamEmail);
    assert(scan.riskScore >= 70, `Accurately flags malicious threat (Risk Score: ${scan.riskScore}%)`);
    assert(scan.isPhishingSuspect === true, 'Flags phishing suspect');
  } catch (err: any) {
    assert(false, `Threat detection error: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(` 📊 Audit Results: ${passed}/${passed + failed} PASSED`);
  if (failed === 0) {
    console.log(' ✨ ALL VERIFICATION & SECURITY AUDIT SUITES PASSED!');
  } else {
    console.error(` ❌ ${failed} TEST(S) FAILED`);
  }
  console.log('===============================================================\n');

  if (failed > 0) process.exit(1);
}

runComprehensiveAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
