
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
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
              <Shield className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            </div>
            <p className="text-notion-gray-600">Last updated: December 14, 2025</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-green-600" />
                Information We Collect
              </h2>
              <div className="prose prose-gray max-w-none text-notion-gray-700">
                <p className="mb-4">We collect information you provide directly to us, such as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (email, name, profile picture)</li>
                  <li>Educational information (college, major, school year)</li>
                  <li>Study session data and progress tracking</li>
                  <li>Calendar integration data (with your explicit consent)</li>
                  <li>Communication preferences and settings</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-purple-600" />
                How We Use Your Information
              </h2>
              <div className="prose prose-gray max-w-none text-notion-gray-700">
                <p className="mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our study platform</li>
                  <li>Facilitate study sessions and group collaborations</li>
                  <li>Send you updates about your study progress and platform features</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Ensure platform security and prevent fraud</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-yellow-600" />
                Information Sharing
              </h2>
              <div className="prose prose-gray max-w-none text-notion-gray-700">
                <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To trusted service providers who assist in operating our platform</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with study group features (only with group members)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Data Security</h2>
              <p className="text-notion-gray-700">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Your Rights</h2>
              <p className="text-notion-gray-700 mb-4">
                You have the right to access, update, or delete your personal information. You can manage most of your 
                information through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-notion-gray-900 mb-4">Contact Us</h2>
              <p className="text-notion-gray-700">
                If you have any questions about this Privacy Policy, please contact us at privacy@zylonlabs.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
