/**
 * Attributions Page
 * Required attribution for RxNav and other third-party services
 */

import Link from 'next/link';

export const metadata = {
  title: 'Attributions - ClariMed',
  description: 'Third-party attributions and acknowledgments for ClariMed',
};

export default function AttributionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Third-Party Attributions</h1>
        <p className="text-sm text-gray-500 mb-8">
          This document contains required attributions and acknowledgments for third-party services used in ClariMed.
        </p>

        <div className="prose prose-blue max-w-none space-y-8">
          {/* RxNav API */}
          <section className="border-l-4 border-blue-500 pl-6 bg-blue-50 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">RxNav API (National Library of Medicine)</h2>
            
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Service:</strong> RxNav Web Services<br />
                <strong>Provider:</strong> U.S. National Library of Medicine (NLM), National Institutes of Health (NIH)<br />
                <strong>Website:</strong>{' '}
                <a href="https://lhncbc.nlm.nih.gov/RxNav/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://lhncbc.nlm.nih.gov/RxNav/
                </a>
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">About RxNav</h3>
              <p>
                RxNav is a browser for several drug information sources provided by the National Library of Medicine. The RxNav API provides access to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>RxNorm</strong> - Normalized names for clinical drugs and drug delivery devices</li>
                <li><strong>RxTerms</strong> - Drug interface terminology</li>
                <li><strong>Drug Interaction Information</strong> - From multiple sources including DrugBank</li>
                <li><strong>National Drug File - Reference Terminology (NDF-RT)</strong> - Drug classifications and relationships</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Required Disclosure</h3>
              <div className="bg-white border-2 border-blue-300 rounded-lg p-4 my-3">
                <p className="text-gray-800 italic">
                  <strong>The National Library of Medicine (NLM) licenses use of RxNav drug information solely for non-commercial purposes.</strong> RxNav drug information is derived from NLM&apos;s RxNorm, MED-RT, and RxTerms, and may also include information from First Databank, Inc. For use of First Databank content, contact them directly at{' '}
                  <a href="https://www.fdbhealth.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    https://www.fdbhealth.com/
                  </a>.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Usage in ClariMed</h3>
              <p className="mb-2">ClariMed uses the RxNav API for:</p>
              <ul className="list-decimal pl-6 space-y-1">
                <li>Drug Search & Autocomplete - Finding medications by name with RxNorm Concept Unique Identifiers (RXCUIs)</li>
                <li>Drug Properties - Extracting dosage information, drug forms, and active ingredients</li>
                <li>Drug-Drug Interactions - Checking for potential interactions between medications</li>
                <li>Allergy Cross-Reactivity - Identifying related drug classes and ingredients</li>
                <li>Contraindication Checking - Verifying drug-condition relationships</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Data Sources</h3>
              <p className="mb-2">The following RxNav data sources are used in this application:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>RxNorm:</strong> Normalized drug nomenclature</li>
                <li><strong>NDF-RT:</strong> Drug classifications and therapeutic relationships</li>
                <li><strong>DrugBank/First Databank:</strong> Interaction data (via RxNav)</li>
              </ul>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4">
                <h4 className="font-bold text-amber-900 mb-2">Important Notes</h4>
                <ul className="list-disc pl-6 space-y-1 text-amber-900">
                  <li>This application is for educational and informational purposes only</li>
                  <li>Not intended for clinical decision-making without professional consultation</li>
                  <li>Drug information should be verified with healthcare providers</li>
                  <li>RxNav data may not be complete or current</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">API Endpoints Used</h3>
              <div className="bg-gray-50 rounded p-4 font-mono text-sm">
                <p>https://rxnav.nlm.nih.gov/REST/</p>
                <ul className="pl-4 mt-2 space-y-1">
                  <li>- approximateTerm (Drug search)</li>
                  <li>- rxcui/&#123;rxcui&#125;/allrelated (Related concepts)</li>
                  <li>- rxcui/&#123;rxcui&#125;/property (Drug properties)</li>
                  <li>- interaction/list (Drug interactions)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Supabase */}
          <section className="border-l-4 border-green-500 pl-6 bg-green-50 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Supabase</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Service:</strong> Supabase (Backend as a Service)<br />
                <strong>Provider:</strong> Supabase, Inc.<br />
                <strong>Website:</strong>{' '}
                <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://supabase.com/
                </a>
              </p>
              <p className="mt-3 mb-2">Supabase is used for:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>User authentication and session management</li>
                <li>PostgreSQL database hosting</li>
                <li>Real-time data synchronization</li>
                <li>Row Level Security (RLS) policies</li>
              </ul>
              <p className="mt-3">
                <strong>License:</strong> Used under Supabase Terms of Service
              </p>
            </div>
          </section>

          {/* Next.js */}
          <section className="border-l-4 border-gray-500 pl-6 bg-gray-50 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Next.js</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Framework:</strong> Next.js<br />
                <strong>Provider:</strong> Vercel, Inc.<br />
                <strong>Website:</strong>{' '}
                <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://nextjs.org/
                </a><br />
                <strong>License:</strong> MIT License
              </p>
            </div>
          </section>

          {/* Tailwind CSS */}
          <section className="border-l-4 border-cyan-500 pl-6 bg-cyan-50 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Tailwind CSS</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Framework:</strong> Tailwind CSS<br />
                <strong>Provider:</strong> Tailwind Labs, Inc.<br />
                <strong>Website:</strong>{' '}
                <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://tailwindcss.com/
                </a><br />
                <strong>License:</strong> MIT License
              </p>
            </div>
          </section>

          {/* TypeScript */}
          <section className="border-l-4 border-blue-600 pl-6 bg-blue-50 p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">TypeScript</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Language:</strong> TypeScript<br />
                <strong>Provider:</strong> Microsoft Corporation<br />
                <strong>Website:</strong>{' '}
                <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  https://www.typescriptlang.org/
                </a><br />
                <strong>License:</strong> Apache License 2.0
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="border-2 border-amber-300 bg-amber-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-amber-900 mb-3">Disclaimer</h2>
            <p className="text-amber-900 font-semibold mb-3">IMPORTANT MEDICAL DISCLAIMER:</p>
            <p className="text-gray-800 mb-3">
              This application uses drug information from the National Library of Medicine&apos;s RxNav service. While we strive to provide accurate and up-to-date information:
            </p>
            <ul className="list-decimal pl-6 space-y-2 text-gray-800">
              <li><strong>Not Medical Advice:</strong> Information provided is for educational purposes only and should not be considered medical advice.</li>
              <li><strong>Consult Healthcare Providers:</strong> Always consult with qualified healthcare professionals before making any decisions about medications or treatments.</li>
              <li><strong>No Warranty:</strong> Drug information is provided &quot;as is&quot; without warranty of any kind. The developers and contributors make no representations about the accuracy, completeness, or reliability of the information.</li>
              <li><strong>Emergency Situations:</strong> In case of a medical emergency, contact emergency services immediately (911 in the US).</li>
              <li><strong>Data Currency:</strong> Drug information may not reflect the most current research or FDA approvals. Always verify with current medical references.</li>
            </ul>
          </section>

          {/* Updates */}
          <div className="border-t pt-6 mt-8 text-sm text-gray-600">
            <p>
              <strong>Last Updated:</strong> November 11, 2025
            </p>
            <p className="mt-2">
              For questions about data sources or attributions, please refer to the respective provider&apos;s terms of service and documentation.
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 pt-6 border-t flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </Link>
          <span className="text-gray-300">•</span>
          <a href="https://github.com/aaroncapron/ClariMed" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
