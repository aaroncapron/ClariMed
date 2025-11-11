/**
 * Privacy Policy Page
 * Explains data collection, usage, and privacy practices
 */

import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - ClariMed',
  description: 'Privacy policy and data protection practices for ClariMed',
};

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: November 11, 2025</p>

        <div className="prose prose-blue max-w-none space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Overview</h2>
            <p className="text-gray-700">
              ClariMed respects your privacy and is committed to protecting your personal health information. This Privacy Policy explains how we collect, use, store, and protect your data.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">1.1 Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Email address (for authentication)</li>
              <li>Password (encrypted and never stored in plain text)</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">1.2 Medication Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Medication names, quantities, and directions</li>
              <li>Refill tracking information</li>
              <li>Personal notes about medications</li>
              <li>Maintenance medication flags</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">1.3 Health Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Allergy information</li>
              <li>Health conditions (optional)</li>
              <li>Notes related to your health</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">1.4 Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Device information and browser type</li>
              <li>IP address (for security purposes)</li>
              <li>Usage timestamps and session information</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-2">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide medication tracking and management services</li>
              <li>Check for potential drug interactions and allergy conflicts</li>
              <li>Maintain your account and authenticate access</li>
              <li>Improve the application and user experience</li>
              <li>Ensure security and prevent unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Data Storage and Security</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Where Your Data is Stored</h3>
            <p className="text-gray-700 mb-4">
              For authenticated users, your data is securely stored in Supabase (PostgreSQL database) with Row Level Security (RLS) enabled. Guest users&apos; data is stored locally in their browser&apos;s localStorage.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Security Measures</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>All data transmission is encrypted using HTTPS/TLS</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>Database access is protected by Row Level Security (RLS)</li>
              <li>Each user can only access their own data</li>
              <li>Regular security updates and monitoring</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3 Data Retention</h3>
            <p className="text-gray-700">
              We retain your account and medication data for as long as your account is active. You may delete your account and all associated data at any time. Guest user data is stored only in their browser and can be cleared at any time.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Third-Party Services</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 RxNav API</h3>
            <p className="text-gray-700 mb-4">
              When you search for medications or check interactions, we send queries to the National Library of Medicine&apos;s RxNav API. These queries may include medication names but <strong>do not include any personally identifiable information</strong>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 Supabase</h3>
            <p className="text-gray-700 mb-4">
              We use Supabase for authentication and database services. Supabase is GDPR and HIPAA compliant. See{' '}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Supabase Privacy Policy
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3 Vercel (Hosting)</h3>
            <p className="text-gray-700">
              ClariMed is hosted on Vercel. Server logs may include IP addresses and access times for security and performance monitoring. See{' '}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Vercel Privacy Policy
              </a>.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Sharing and Disclosure</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-gray-800 font-semibold">
                We do NOT sell, rent, or share your personal health information with third parties for marketing purposes.
              </p>
            </div>
            <p className="text-gray-700 mb-2">We may disclose your information only in these circumstances:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations (court orders, subpoenas)</li>
              <li>To protect against fraud or security threats</li>
              <li>In connection with a business transfer or merger (with notice)</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> View all your stored data</li>
              <li><strong>Edit:</strong> Update or correct your information at any time</li>
              <li><strong>Delete:</strong> Remove individual medications or your entire account</li>
              <li><strong>Export:</strong> Download your medication data</li>
              <li><strong>Opt-out:</strong> Disable optional features like interaction checking</li>
              <li><strong>Withdraw consent:</strong> Stop using the service at any time</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Children&apos;s Privacy</h2>
            <p className="text-gray-700">
              ClariMed is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. Your continued use of ClariMed after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy or how we handle your data, please visit our{' '}
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
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 pt-6 border-t flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
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
