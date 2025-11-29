import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-2">
            IndaStreet Driver Terms of Service
          </h1>
          <p className="text-gray-400">Last Updated: November 30, 2025</p>
        </div>

        <div className="text-gray-300 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-4">IMPORTANT LEGAL NOTICE</h2>
            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6">
              <p className="text-red-400 font-bold text-lg mb-3">
                BY REGISTERING AS A DRIVER ON INDASTREET, YOU EXPLICITLY ACKNOWLEDGE AND AGREE:
              </p>
              <ul className="space-y-2 text-white">
                <li>✓ You are an INDEPENDENT CONTRACTOR, not an employee</li>
                <li>✓ You accept 100% LIABILITY for all your business activities</li>
                <li>✓ IndaStreet provides DIRECTORY SERVICES ONLY</li>
                <li>✓ You are responsible for ALL taxes, insurance, and legal compliance</li>
                <li>✓ IndaStreet will NOT get involved in disputes unless legally required</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. DEFINITIONS</h2>
            <div className="space-y-3 bg-gray-900 rounded-xl p-6">
              <p><span className="text-orange-400 font-bold">"Platform"</span> - The IndaStreet mobile and web application</p>
              <p><span className="text-orange-400 font-bold">"Driver"</span> - Independent contractor providing transportation/delivery services</p>
              <p><span className="text-orange-400 font-bold">"Customer"</span> - End user requesting services through the platform</p>
              <p><span className="text-orange-400 font-bold">"Services"</span> - Transportation, delivery, or other services provided by Driver</p>
              <p><span className="text-orange-400 font-bold">"Directory Fee"</span> - Platform service fee charged by IndaStreet</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. INDEPENDENT CONTRACTOR RELATIONSHIP</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <p className="mb-4">
                <span className="text-yellow-400 font-bold">2.1 Status:</span> Driver is an independent contractor and NOT an employee, agent, or representative of IndaStreet. Driver has complete autonomy over when, where, and how often to provide services.
              </p>
              <p className="mb-4">
                <span className="text-yellow-400 font-bold">2.2 No Employment Benefits:</span> Driver is not entitled to salary, benefits, insurance, vacation pay, sick leave, or any employment-related benefits from IndaStreet.
              </p>
              <p className="mb-4">
                <span className="text-yellow-400 font-bold">2.3 Business Operations:</span> Driver operates their own independent business and is responsible for all business decisions, expenses, and outcomes.
              </p>
              <p>
                <span className="text-yellow-400 font-bold">2.4 Multiple Platforms:</span> Driver is free to work with competing platforms and operate their transportation business independently.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. DIRECTORY SERVICE MODEL</h2>
            <div className="space-y-3">
              <p>
                <span className="text-orange-400 font-bold">3.1 Service Nature:</span> IndaStreet operates as a DIRECTORY PLATFORM that connects independent drivers with customers seeking transportation or delivery services. IndaStreet DOES NOT provide, control, or operate transportation services.
              </p>
              <p>
                <span className="text-orange-400 font-bold">3.2 Directory Listing:</span> Driver is renting digital directory space to advertise their services and receive customer leads. The relationship is similar to a business listing in a phone directory or marketplace.
              </p>
              <p>
                <span className="text-orange-400 font-bold">3.3 Customer Connection:</span> IndaStreet facilitates initial contact but has no control over how Driver provides services to Customers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. DRIVER LIABILITY & RESPONSIBILITY</h2>
            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6">
              <p className="text-red-400 font-bold mb-4 text-lg">DRIVER ACCEPTS 100% LIABILITY FOR:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                  <h4 className="font-bold mb-2 text-orange-400">Legal & Regulatory:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• All licenses and permits (SIM, STNK)</li>
                    <li>• Traffic law compliance</li>
                    <li>• Government regulations</li>
                    <li>• Business registration if required</li>
                    <li>• Environmental compliance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-orange-400">Financial:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• All taxes (income, VAT, etc.)</li>
                    <li>• NPWP registration</li>
                    <li>• Tax filing and payments</li>
                    <li>• Payment disputes with customers</li>
                    <li>• Debt collection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-orange-400">Insurance & Safety:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Vehicle insurance (mandatory)</li>
                    <li>• Passenger/cargo insurance</li>
                    <li>• Vehicle maintenance</li>
                    <li>• Safety equipment</li>
                    <li>• Health requirements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-orange-400">Incidents & Damages:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• All accidents and injuries</li>
                    <li>• Property damage</li>
                    <li>• Lost or damaged cargo</li>
                    <li>• Customer complaints</li>
                    <li>• Criminal liability</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. INDASTREET NON-INVOLVEMENT POLICY</h2>
            <div className="bg-gray-900 border border-orange-500 rounded-xl p-6">
              <p className="text-orange-400 font-bold mb-4">IndaStreet will NOT get involved in:</p>
              <ul className="space-y-2">
                <li>✗ Disputes between Driver and Customer</li>
                <li>✗ Accident investigations or liability claims</li>
                <li>✗ Payment disputes or debt recovery</li>
                <li>✗ Insurance claims or coverage</li>
                <li>✗ Government investigations or penalties</li>
                <li>✗ Tax audits or financial obligations</li>
                <li>✗ License or registration violations</li>
                <li>✗ Service quality complaints (beyond rating system)</li>
                <li>✗ Criminal proceedings or legal defense</li>
              </ul>
              <p className="mt-4 text-yellow-400 font-bold">
                EXCEPTION: IndaStreet will comply with legal obligations when required by court orders, subpoenas, or government authorities.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. INSURANCE REQUIREMENTS</h2>
            <div className="space-y-3">
              <p>
                <span className="text-orange-400 font-bold">6.1 Mandatory Insurance:</span> Driver MUST maintain valid vehicle insurance at all times. Proof of insurance may be requested during verification.
              </p>
              <p>
                <span className="text-orange-400 font-bold">6.2 Coverage Responsibility:</span> IndaStreet does not provide insurance for drivers, vehicles, passengers, or cargo. Driver is solely responsible for obtaining adequate coverage.
              </p>
              <p>
                <span className="text-orange-400 font-bold">6.3 Claims:</span> All insurance claims must be handled directly between Driver and their insurance provider. IndaStreet is not a party to insurance contracts.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. TAX OBLIGATIONS</h2>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <p className="mb-4">
                <span className="text-blue-400 font-bold">7.1 Independent Tax Liability:</span> Driver is solely responsible for all tax obligations under Indonesian law, including but not limited to income tax, VAT, and any local taxes.
              </p>
              <p className="mb-4">
                <span className="text-blue-400 font-bold">7.2 NPWP Registration:</span> Driver may be required to register for NPWP (tax identification number) based on earnings threshold.
              </p>
              <p className="mb-4">
                <span className="text-blue-400 font-bold">7.3 Tax Reporting:</span> IndaStreet may provide earning summaries for Driver's tax filing purposes, but Driver is responsible for accurate reporting.
              </p>
              <p>
                <span className="text-blue-400 font-bold">7.4 No Tax Withholding:</span> IndaStreet does not withhold taxes from Driver earnings. Driver receives gross payment minus platform fees only.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. PLATFORM FEES & PAYMENTS</h2>
            <div className="space-y-3">
              <p>
                <span className="text-orange-400 font-bold">8.1 Directory Fee:</span> IndaStreet charges a platform service fee (percentage or fixed amount) for directory listing, customer connection, and payment processing.
              </p>
              <p>
                <span className="text-orange-400 font-bold">8.2 Fee Transparency:</span> All fees are clearly disclosed in the Driver dashboard and deducted automatically from completed transactions.
              </p>
              <p>
                <span className="text-orange-400 font-bold">8.3 Payment Processing:</span> IndaStreet may facilitate payment collection but acts only as a payment processor, not as principal or merchant of record.
              </p>
              <p>
                <span className="text-orange-400 font-bold">8.4 Fee Changes:</span> IndaStreet reserves the right to modify fees with 30 days notice to active drivers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. ACCOUNT MANAGEMENT</h2>
            <div className="space-y-3">
              <p>
                <span className="text-orange-400 font-bold">9.1 Verification:</span> Driver must provide valid documents (KTP, SIM, STNK, bank details) for account verification. False information results in immediate suspension.
              </p>
              <p>
                <span className="text-orange-400 font-bold">9.2 Rating System:</span> Driver performance is rated by customers. Consistently low ratings may result in account suspension or additional training requirements.
              </p>
              <p>
                <span className="text-orange-400 font-bold">9.3 Suspension/Termination:</span> IndaStreet may suspend or terminate Driver accounts for:
              </p>
              <ul className="ml-6 space-y-1">
                <li>• Fraudulent activity or false documents</li>
                <li>• Consistent poor service ratings</li>
                <li>• Violation of these terms</li>
                <li>• Criminal activity or safety violations</li>
                <li>• Customer complaints about harassment or misconduct</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. INDEMNIFICATION</h2>
            <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6">
              <p className="text-red-400 font-bold mb-4">
                Driver agrees to INDEMNIFY, DEFEND, and HOLD HARMLESS IndaStreet, its owners, employees, and affiliates from:
              </p>
              <ul className="space-y-2 text-white">
                <li>• Any claims, lawsuits, or legal actions arising from Driver's services</li>
                <li>• Accidents, injuries, or property damage during service provision</li>
                <li>• Tax liabilities, penalties, or government fines</li>
                <li>• Customer disputes, payment issues, or contract breaches</li>
                <li>• Violations of law, regulations, or licensing requirements</li>
                <li>• Any losses, damages, or expenses (including legal fees) related to Driver's activities</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. LIMITATION OF LIABILITY</h2>
            <div className="space-y-3">
              <p>
                <span className="text-orange-400 font-bold">11.1 Platform Service Only:</span> IndaStreet's liability is limited to providing directory and connection services. IndaStreet is NOT liable for Driver's actions, omissions, or business outcomes.
              </p>
              <p>
                <span className="text-orange-400 font-bold">11.2 Maximum Liability:</span> In any event, IndaStreet's total liability to Driver shall not exceed the platform fees paid by Driver in the previous 3 months.
              </p>
              <p>
                <span className="text-orange-400 font-bold">11.3 No Consequential Damages:</span> IndaStreet is not liable for lost profits, lost business, reputational damage, or any indirect or consequential damages.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. GOVERNING LAW & DISPUTE RESOLUTION</h2>
            <div className="bg-gray-900 rounded-xl p-6">
              <p className="mb-4">
                <span className="text-orange-400 font-bold">12.1 Indonesian Law:</span> This agreement is governed by the laws of the Republic of Indonesia.
              </p>
              <p className="mb-4">
                <span className="text-orange-400 font-bold">12.2 Jurisdiction:</span> Any disputes shall be resolved in the courts of Jakarta, Indonesia, or Driver's registered district.
              </p>
              <p>
                <span className="text-orange-400 font-bold">12.3 Arbitration:</span> Parties agree to attempt mediation before pursuing litigation, except in cases requiring immediate injunctive relief.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. MODIFICATIONS TO TERMS</h2>
            <div className="space-y-3">
              <p>
                IndaStreet reserves the right to modify these Terms of Service at any time. Drivers will be notified of material changes via app notification and email. Continued use of the platform after changes constitutes acceptance of modified terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. SEVERABILITY</h2>
            <div className="space-y-3">
              <p>
                If any provision of these terms is found invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. ENTIRE AGREEMENT</h2>
            <div className="space-y-3">
              <p>
                These Terms of Service constitute the entire agreement between Driver and IndaStreet regarding the platform usage and supersede all prior agreements or understandings.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-2 border-orange-500 rounded-xl p-8 mt-8">
            <h2 className="text-3xl font-bold text-orange-400 mb-4 text-center">ACKNOWLEDGMENT</h2>
            <p className="text-white text-center text-lg mb-4">
              By registering as a driver on IndaStreet, you acknowledge that:
            </p>
            <ul className="space-y-3 text-white">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>You have READ and UNDERSTOOD these Terms of Service in full</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>You AGREE to operate as an INDEPENDENT CONTRACTOR with 100% liability</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>You understand IndaStreet provides DIRECTORY SERVICES ONLY</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>You accept FULL RESPONSIBILITY for taxes, insurance, and legal compliance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>You will INDEMNIFY IndaStreet from all claims arising from your services</span>
              </li>
            </ul>
          </section>

          <div className="text-center mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-500 text-sm">
              IndaStreet Platform | PT IndaStreet Teknologi Indonesia<br />
              Jakarta, Indonesia | Last Updated: November 30, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
