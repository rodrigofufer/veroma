import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import PageLayout from '../components/PageLayout';

export default function DisclaimerPage() {
  const lastUpdated = "January 15, 2025";

  return (
    <PageLayout 
      title="Disclaimer of Liability" 
      icon={<AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="prose max-w-none"
      >
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Important Legal Notice</h3>
              <p className="text-orange-800 text-sm">
                This disclaimer contains important legal information about your use of Veroma. 
                Please read this document carefully before using our platform. By accessing or using 
                Veroma, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8">
          Last updated: {lastUpdated}
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. General Disclaimer</h2>
        <p className="text-gray-600 mb-6">
          Veroma ("we," "us," "our," or "the Platform") provides a civic engagement platform that allows users 
          to share ideas, proposals, complaints, and participate in voting activities. This disclaimer sets forth 
          the limitations of our liability and your responsibilities as a user of our services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User-Generated Content Disclaimer</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Content Responsibility</h3>
        <p className="text-gray-600 mb-4">
          All content posted on Veroma, including but not limited to ideas, proposals, complaints, comments, 
          votes, and any other user submissions (collectively "User Content"), is created and submitted by 
          individual users. Veroma does not:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-6">
          <li className="mb-2">Create, endorse, verify, or guarantee the accuracy of any User Content</li>
          <li className="mb-2">Pre-screen or approve User Content before publication</li>
          <li className="mb-2">Take responsibility for the opinions, statements, or claims made by users</li>
          <li className="mb-2">Warrant that User Content is factual, current, or complete</li>
          <li className="mb-2">Assume liability for any consequences arising from User Content</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Content Moderation</h3>
        <p className="text-gray-600 mb-6">
          While we employ moderation tools and community guidelines, we cannot guarantee that all inappropriate 
          content will be identified or removed promptly. Users are responsible for reporting content that 
          violates our terms of service. Our moderation decisions are made in good faith but may not always 
          align with every user's expectations or interpretations.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Limitation of Liability for Damages</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">3.1 No Warranty</h3>
        <p className="text-gray-600 mb-6">
          Veroma is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either 
          express or implied, including but not limited to warranties of merchantability, fitness for a 
          particular purpose, non-infringement, or course of performance. We do not warrant that the platform 
          will be uninterrupted, secure, or error-free.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">3.2 Limitation of Damages</h3>
        <p className="text-gray-600 mb-4">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL VEROMA, ITS OFFICERS, DIRECTORS, 
          EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-6">
          <li className="mb-2">INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
          <li className="mb-2">LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES</li>
          <li className="mb-2">DAMAGES RESULTING FROM YOUR USE OR INABILITY TO USE THE PLATFORM</li>
          <li className="mb-2">DAMAGES RESULTING FROM USER CONTENT OR CONDUCT OF THIRD PARTIES</li>
          <li className="mb-2">DAMAGES RESULTING FROM UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
          <li className="mb-2">DAMAGES RESULTING FROM ANY OTHER MATTER RELATING TO THE PLATFORM</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-800 mb-3">3.3 Damage Cap</h3>
        <p className="text-gray-600 mb-6">
          In jurisdictions where limitation of liability is restricted, our total liability to you for any 
          and all claims arising out of or relating to the use of or inability to use the platform shall 
          not exceed the amount you paid us, if any, for accessing the platform during the twelve (12) months 
          immediately preceding the event giving rise to the claim.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Outcomes and Implementation Disclaimer</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 No Guarantee of Implementation</h3>
        <p className="text-gray-600 mb-6">
          Veroma is a platform for civic engagement and discussion. We do not guarantee that any ideas, 
          proposals, or initiatives shared on our platform will be implemented, adopted, or acted upon by 
          any government entity, organization, or individual. The platform serves as a forum for public 
          discourse and does not constitute official government channels or binding commitments.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 No Authority Representation</h3>
        <p className="text-gray-600 mb-6">
          Unless explicitly stated otherwise, Veroma does not represent, act on behalf of, or have authority 
          from any government entity, public authority, or official organization. Official proposals marked 
          as such are submitted by verified representatives but do not guarantee official adoption or 
          implementation.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">4.3 Voting Results</h3>
        <p className="text-gray-600 mb-6">
          Voting results on Veroma are indicative of user sentiment and do not constitute official elections, 
          referendums, or binding decisions. These results may be shared with relevant authorities for 
          informational purposes but carry no legal weight or obligation for implementation.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Links and Services</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">5.1 External Links</h3>
        <p className="text-gray-600 mb-6">
          Our platform may contain links to third-party websites, services, or resources that are not owned 
          or controlled by Veroma. We have no control over and assume no responsibility for the content, 
          privacy policies, or practices of any third-party websites or services. You acknowledge and agree 
          that we shall not be responsible or liable for any damage or loss caused by your use of any such 
          third-party content, goods, or services.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">5.2 Third-Party Integrations</h3>
        <p className="text-gray-600 mb-6">
          We may integrate with third-party services for authentication, analytics, or other functionality. 
          These integrations are subject to the terms and privacy policies of the respective third parties. 
          We are not responsible for the availability, accuracy, or reliability of these third-party services.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Conduct and Responsibilities</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">6.1 Acceptable Use</h3>
        <p className="text-gray-600 mb-4">
          Users are solely responsible for their conduct on the platform and must comply with all applicable 
          laws and regulations. Users agree not to:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-6">
          <li className="mb-2">Post false, misleading, defamatory, or harmful content</li>
          <li className="mb-2">Engage in harassment, threats, or intimidation of other users</li>
          <li className="mb-2">Violate any applicable laws or regulations</li>
          <li className="mb-2">Infringe upon intellectual property rights of others</li>
          <li className="mb-2">Attempt to manipulate voting systems or create fake accounts</li>
          <li className="mb-2">Share personal information of others without consent</li>
          <li className="mb-2">Use the platform for commercial solicitation without permission</li>
        </ul>

        <h3 className="text-xl font-medium text-gray-800 mb-3">6.2 Content Accuracy</h3>
        <p className="text-gray-600 mb-6">
          Users are responsible for ensuring the accuracy and truthfulness of their submissions. We encourage 
          fact-checking and responsible sharing of information. Users should not present opinions as facts 
          or make unsubstantiated claims about individuals, organizations, or events.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">6.3 Legal Compliance</h3>
        <p className="text-gray-600 mb-6">
          Users must comply with all applicable local, national, and international laws when using our platform. 
          This includes but is not limited to laws regarding defamation, privacy, intellectual property, 
          election interference, and hate speech. Users are solely responsible for understanding and complying 
          with the laws that apply to them.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Technical System Issues</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">7.1 System Availability</h3>
        <p className="text-gray-600 mb-6">
          We strive to maintain high availability of our platform but cannot guarantee uninterrupted service. 
          The platform may experience downtime due to maintenance, technical issues, or circumstances beyond 
          our control. We are not liable for any losses or damages resulting from service interruptions.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">7.2 Data Security</h3>
        <p className="text-gray-600 mb-6">
          While we implement reasonable security measures to protect user data, we cannot guarantee absolute 
          security. Users acknowledge that no method of transmission over the internet or electronic storage 
          is 100% secure. We are not liable for unauthorized access to user data resulting from security 
          breaches beyond our reasonable control.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">7.3 Data Loss</h3>
        <p className="text-gray-600 mb-6">
          We implement backup procedures but cannot guarantee against data loss due to technical failures, 
          user error, or other circumstances. Users are encouraged to maintain their own records of important 
          submissions and should not rely solely on our platform for data preservation.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Legal and Regulatory Compliance</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">8.1 Jurisdictional Variations</h3>
        <p className="text-gray-600 mb-6">
          Veroma operates internationally and serves users from various jurisdictions. Laws regarding online 
          platforms, free speech, privacy, and civic engagement vary significantly between countries and 
          regions. Users are responsible for understanding and complying with the laws applicable to their 
          jurisdiction and use of the platform.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">8.2 Government Requests</h3>
        <p className="text-gray-600 mb-6">
          We may be required to comply with lawful requests from government authorities, including but not 
          limited to court orders, subpoenas, and regulatory investigations. We reserve the right to disclose 
          user information when required by law or when we believe in good faith that such disclosure is 
          necessary to comply with legal obligations.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">8.3 Content Removal</h3>
        <p className="text-gray-600 mb-6">
          We reserve the right to remove content that violates our terms of service, applicable laws, or 
          in response to valid legal requests. Content removal decisions are made at our discretion and 
          may not always align with user expectations. We are not obligated to provide advance notice of 
          content removal in all circumstances.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
        <p className="text-gray-600 mb-6">
          You agree to defend, indemnify, and hold harmless Veroma, its officers, directors, employees, 
          agents, licensors, and suppliers from and against any claims, liabilities, damages, judgments, 
          awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of 
          or relating to your violation of these terms or your use of the platform, including but not 
          limited to your User Content, your use of the platform, and any third-party claims arising 
          from your conduct on the platform.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Platform Evolution and Changes</h2>
        
        <h3 className="text-xl font-medium text-gray-800 mb-3">10.1 Service Modifications</h3>
        <p className="text-gray-600 mb-6">
          We reserve the right to modify, suspend, or discontinue any aspect of the platform at any time 
          without prior notice. This includes but is not limited to features, functionality, user interfaces, 
          and terms of service. We are not liable for any modifications or discontinuation of services.
        </p>

        <h3 className="text-xl font-medium text-gray-800 mb-3">10.2 Beta Features</h3>
        <p className="text-gray-600 mb-6">
          The platform may include beta, experimental, or preview features that are provided "as is" without 
          warranty. These features may be unstable, incomplete, or subject to change without notice. Use of 
          beta features is at your own risk.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Age and Capacity Requirements</h2>
        <p className="text-gray-600 mb-6">
          By using Veroma, you represent and warrant that you are at least 18 years of age and have the 
          legal capacity to enter into this agreement. If you are under 18, you may only use the platform 
          with the involvement and consent of a parent or guardian who agrees to be bound by these terms.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Severability and Enforceability</h2>
        <p className="text-gray-600 mb-6">
          If any provision of this disclaimer is found to be unenforceable or invalid under applicable law, 
          such provision shall be modified to the minimum extent necessary to make it enforceable, or if 
          modification is not possible, such provision shall be severed from this disclaimer. The remainder 
          of this disclaimer shall remain in full force and effect.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Updates to This Disclaimer</h2>
        <p className="text-gray-600 mb-6">
          We reserve the right to update this disclaimer at any time. Material changes will be communicated 
          to users through the platform or via email. Continued use of the platform after such modifications 
          constitutes acceptance of the updated disclaimer. Users are encouraged to review this disclaimer 
          periodically.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
        <p className="text-gray-600 mb-6">
          If you have questions about this disclaimer or need to report legal concerns, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800 font-medium">Legal Department</p>
          <p className="text-gray-600">Email: legal@veroma.org</p>
          <p className="text-gray-600">Subject Line: "Legal Inquiry - Disclaimer"</p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Acknowledgment</h2>
        <p className="text-gray-600 mb-6">
          BY USING VEROMA, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS DISCLAIMER, UNDERSTAND IT, AND AGREE 
          TO BE BOUND BY ITS TERMS. YOU ALSO ACKNOWLEDGE THAT THIS DISCLAIMER, TOGETHER WITH OUR TERMS 
          OF SERVICE AND PRIVACY POLICY, REPRESENTS THE COMPLETE AND EXCLUSIVE STATEMENT OF THE AGREEMENT 
          BETWEEN YOU AND VEROMA CONCERNING THE PLATFORM AND SUPERSEDES ALL PRIOR AGREEMENTS AND 
          UNDERSTANDINGS RELATING TO THE SUBJECT MATTER HEREIN.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Final Warning</h3>
              <p className="text-red-800 text-sm">
                This disclaimer contains important limitations on Veroma's liability and your legal rights. 
                If you do not agree with any part of this disclaimer, you must not use the platform. 
                Your use of Veroma constitutes acceptance of all terms contained herein.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}