'use client';

import Link from 'next/link';

/**
 * Footer component with RxNav attribution and legal links.
 * Required by NLM terms of service for RxNav API usage.
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* RxNav Attribution (Required) */}
        <div className="text-center mb-4">
          <p className="text-xs text-gray-600">
            Drug information provided by{' '}
            <a
              href="https://lhncbc.nlm.nih.gov/RxNav/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              RxNav
            </a>
            , U.S. National Library of Medicine
          </p>
          <p className="text-xs text-gray-500 mt-1">
            RxNav data licensed for non-commercial use only
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-800 text-center">
            <strong>Important:</strong> This application is for informational purposes only and is not a substitute for professional medical advice.
            Always consult with qualified healthcare providers before making any decisions about medications or treatments.
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
          <Link href="/terms" className="hover:text-gray-900 underline">
            Terms of Service
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/privacy" className="hover:text-gray-900 underline">
            Privacy Policy
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/attributions" className="hover:text-gray-900 underline">
            Attributions
          </Link>
          <span className="text-gray-300">•</span>
          <a
            href="https://github.com/aaroncapron/ClariMed"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 underline"
          >
            GitHub
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ClariMed. For educational and non-commercial use.
          </p>
        </div>
      </div>
    </footer>
  );
}
