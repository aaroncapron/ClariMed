/**
 * Terms of Service Page
 * Displays legal terms and disclaimers for ClariMed usage
 */

import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - ClariMed',
  description: 'Terms of Service and legal disclaimers for ClariMed medication tracking application',
};

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: November 11, 2025</p>

        <div className="prose prose-blue max-w-none space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Overview</h2>
            <p className="text-gray-700">
              ClariMed is a medication management application that uses data from the National Library of Medicine&apos;s RxNav service and other third-party sources. By using this application, you agree to these Terms of Service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using ClariMed, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this application.
            </p>
          </section>

          {/* Use of RxNav Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Use of RxNav Data</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Third-Party Data Source</h3>
            <p className="text-gray-700 mb-4">
              ClariMed uses drug information from RxNav, a service provided by the U.S. National Library of Medicine (NLM), National Institutes of Health (NIH).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2 RxNav Terms</h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-gray-800 italic">
                The National Library of Medicine (NLM) licenses use of RxNav drug information <strong>solely for non-commercial purposes</strong>. RxNav drug information is derived from NLM&apos;s RxNorm, MED-RT, and RxTerms, and may also include information from First Databank, Inc.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.3 Non-Commercial Use</h3>
            <p className="text-gray-700 mb-4">
              ClariMed is intended for <strong>non-commercial, educational, and personal use only</strong>. Commercial use of RxNav data through this application is strictly prohibited.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.4 First Databank Content</h3>
            <p className="text-gray-700">
              Some drug interaction data is sourced from First Databank, Inc. via RxNav. For commercial licensing of First Databank content, contact them directly at{' '}
              <a href="https://www.fdbhealth.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                https://www.fdbhealth.com/
              </a>.
            </p>
          </section>

          {/* Medical Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Medical Disclaimer</h2>
            
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-bold text-amber-900 mb-2">IMPORTANT</h3>
              <p className="text-amber-900 font-medium">
                ClariMed is provided for informational and educational purposes only. It is <strong>NOT</strong> intended to be a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Not Medical Advice</h3>
            <p className="text-gray-700 mb-4">
              Always seek the advice of your physician or other qualified health provider with any questions you may have regarding medications, medical conditions, drug interactions, allergies, or treatment plans.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Never Disregard Professional Advice</h3>
            <p className="text-gray-700 mb-4">
              Never disregard professional medical advice or delay in seeking it because of information obtained through ClariMed.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3 Medical Emergencies</h3>
            <p className="text-gray-700">
              If you think you may have a medical emergency, call your doctor or 911 immediately. ClariMed does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information.
            </p>
          </section>

          {/* No Warranty */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. No Warranty</h2>
            <p className="text-gray-700 mb-4">
              ClariMed is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied.
            </p>
            <p className="text-gray-700">
              We do not warrant that drug information is accurate, complete, or current; that the application will be uninterrupted or error-free; that defects will be corrected; or that the application is free of viruses or other harmful components.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the fullest extent permitted by law, ClariMed and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages; medical complications or adverse events; errors or omissions in drug information; loss of data or profits; or business interruption.
            </p>
            <p className="text-gray-700">
              You assume full responsibility for your use of this application, any decisions made based on information provided, verification of drug information with healthcare providers, and management of your medications.
            </p>
          </section>

          {/* User Accounts and Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. User Accounts and Data</h2>
            <p className="text-gray-700 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials, all activities that occur under your account, and notifying us immediately of any unauthorized access.
            </p>
            <p className="text-gray-700">
              While we implement reasonable security measures, you are responsible for maintaining your own backup of any critical medication information. Please refer to our Privacy Policy for information about how we collect, use, and protect your personal health information.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Prohibited Uses</h2>
            <p className="text-gray-700 mb-2">You may not use ClariMed to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Violate any laws or regulations</li>
              <li>Provide medical advice to others</li>
              <li>Make clinical decisions without consulting healthcare professionals</li>
              <li>Use RxNav data for commercial purposes</li>
              <li>Redistribute, sell, or license RxNav data</li>
              <li>Reverse engineer or attempt to extract the source code</li>
              <li>Use the application in any way that could harm, disable, or impair the service</li>
              <li>Attempt to gain unauthorized access to any systems or data</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms of Service, please visit our{' '}
              <a href="https://github.com/aaroncapron/ClariMed" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                GitHub repository
              </a>.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-600 text-center">
              © 2025 ClariMed. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 text-center mt-2">
              This application uses data from the National Library of Medicine&apos;s RxNav service. RxNav data is provided for non-commercial use only.
            </p>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 pt-6 border-t flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/attributions" className="text-blue-600 hover:text-blue-800">
            Attributions
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
