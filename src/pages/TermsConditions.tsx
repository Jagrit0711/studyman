
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-notion-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/login">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
          
          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-notion-gray-900 font-mono">Zylo Study</h1>
              <p className="text-sm text-notion-gray-500">by Zylon Labs</p>
            </div>
          </div>
        </div>

        <Card className="notion-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
            </div>
            <p className="text-notion-gray-600">Last updated: December 14, 2025</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                Acceptance of Terms
              </h2>
              <p className="text-notion-gray-700">
                By accessing and using Zylo Study, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Use License
              </h2>
              <div className="prose prose-gray max-w-none text-notion-gray-700">
                <p className="mb-4">Permission is granted to temporarily access Zylo Study for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">User Accounts</h2>
              <div className="prose prose-gray max-w-none text-notion-gray-700">
                <p className="mb-4">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Safeguarding your password and all activities under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Ensuring your account information remains accurate and up-to-date</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Study Groups and Content</h2>
              <p className="text-notion-gray-700 mb-4">
                Users are responsible for their own content and study materials shared within the platform. 
                You agree not to share copyrighted materials without permission and to respect the intellectual 
                property rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Disclaimer
              </h2>
              <p className="text-notion-gray-700">
                The materials on Zylo Study are provided on an 'as is' basis. Zylon Labs makes no warranties, 
                expressed or implied, and hereby disclaim and negate all other warranties including without limitation, 
                implied warranties or conditions of merchantability, fitness for a particular purpose, or 
                non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Limitations</h2>
              <p className="text-notion-gray-700">
                In no event shall Zylon Labs or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use the materials on Zylo Study, even if Zylon Labs or an authorized representative has been notified 
                orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Termination</h2>
              <p className="text-notion-gray-700">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice 
                or liability, under our sole discretion, for any reason whatsoever including without limitation if you 
                breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Contact Information</h2>
              <p className="text-notion-gray-700">
                If you have any questions about these Terms & Conditions, please contact us at legal@zylonlabs.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsConditions;
