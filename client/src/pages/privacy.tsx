import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Intelligent Email Assistant</title>
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6">Last Updated: September 1, 2026</p>

          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Overview</h2>
              <p>
                Intelligent Email Assistant values your privacy. This policy outlines how we handle, process, and protect your information when using our application.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Information We Access and Collect</h2>
              <p>
                When you connect your email account (Google OAuth), we request permission to read, compose, and send emails solely to provide the core functionalities: executive summaries, action item extraction, reply suggestions, and conversational search.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. Google API Data & Privacy Standards</h2>
              <p>
                Our use and transfer of information received from Google APIs adheres to the <strong>Google API Services User Data Policy</strong>, including the Limited Use requirements. We do not sell your personal data or use your email data to train public AI models.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Security & Encryption</h2>
              <p>
                All OAuth tokens and credentials are encrypted at rest using industry-standard <strong>AES-256-GCM</strong> (Authenticated Encryption). Communication occurs strictly over HTTPS/TLS.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Data Deletion</h2>
              <p>
                You may disconnect your email account or delete your profile at any time through the Accounts dashboard, which immediately revokes tokens and purges synchronized data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
