import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service — Intelligent Email Assistant</title>
      </Head>
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <Link href="/" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300 mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6">Last Updated: September 1, 2026</p>

          <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Intelligent Email Assistant, you agree to comply with and be bound by these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Description of Service</h2>
              <p>
                Intelligent Email Assistant is an AI-powered email productivity platform providing summarization, task extraction, smart drafting, and workflow automation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. User Responsibilities</h2>
              <p>
                You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree not to use the service for spamming, credential harvesting, or malicious communications.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Termination</h2>
              <p>
                We reserve the right to suspend or terminate access to the service for violations of these terms or misuse of external API services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
