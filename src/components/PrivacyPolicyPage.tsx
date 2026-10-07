import React from 'react'
import {
  Shield,
  Calendar,
  Globe,
  Building2,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { ThinkingBulb } from './ThinkingBulb'

export const PrivacyPolicyPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  React.useEffect(() => {
    // Enable full page scrolling for this dedicated route
    const originalOverflow = document.body.style.overflow
    const originalHeight = document.body.style.height
    const rootEl = document.getElementById('root')
    const originalRootHeight = rootEl ? rootEl.style.height : ''

    document.body.style.overflowY = 'auto'
    document.body.style.overflowX = 'hidden'
    document.body.style.height = 'auto'
    if (rootEl) rootEl.style.height = 'auto'

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.height = originalHeight
      if (rootEl) rootEl.style.height = originalRootHeight
    }
  }, [])

  return (
    <div
      id="privacy-policy-page"
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-gray-800' : 'bg-[#0b0f19] text-gray-200'
      }`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-8 py-3.5 flex items-center justify-between ${
          isLight
            ? 'bg-white/85 border-gray-200 shadow-xs'
            : 'bg-[#111827]/85 border-gray-800 shadow-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition group cursor-pointer"
            title="Back to sahajAI"
          >
            <ThinkingBulb state="lit" size={30} />
            <span className="text-lg font-black tracking-tight">
              <span className="text-yellow-500">sahaj</span>
              <span className={isLight ? 'text-gray-950' : 'text-white'}>AI</span>
            </span>
          </a>

          <div className="h-5 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">
              Privacy Policy
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30">
              Official
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                : 'border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#FACC15]" />}
          </button>

          <a
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-gray-950 text-xs font-bold shadow-md shadow-yellow-500/10 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Chat</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Hero Card */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border mb-8 sm:mb-10 shadow-sm ${
            isLight
              ? 'bg-white border-gray-200'
              : 'bg-[#141a27] border-gray-800'
          }`}
        >
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/15 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] shrink-0 shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  PRIVACY POLICY
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Aivista Technologies Private Limited
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30 self-start sm:self-auto">
              sahajAI.aivistatech.com
            </span>
          </div>

          {/* Metadata Grid */}
          <div
            className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${
              isLight
                ? 'bg-gray-50/80 border-gray-200 text-gray-600'
                : 'bg-[#192236]/60 border-gray-800 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span><strong>Effective Date:</strong> 07th October 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span><strong>Last Updated:</strong> 07th October 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span><strong>Website:</strong> sahajAI.aivistatech.com</span>
            </div>
          </div>

          {/* Platform Intro Statement */}
          <div className="mt-6 space-y-3 text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold text-sm sm:text-base text-[#FACC15]">
              Service: sahajAI – AI Chatbot, AI Assistance and Retrieval-Augmented Generation Platform
            </p>
            <p>
              This Privacy Policy explains how <strong>Aivista Technologies Private Limited</strong> (&quot;Aivista&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, stores, processes, protects and, where applicable, deletes information submitted to or generated through sahajAI (&quot;SahajAI&quot;, &quot;Service&quot; or &quot;Platform&quot;).
            </p>
            <p>
              By accessing or using SahajAI, you acknowledge that you have read this Privacy Policy. Where consent is required by applicable law, we will obtain such consent through an appropriate notice, checkbox, consent mechanism or other legally recognised method.
            </p>
          </div>
        </div>

        {/* Policy Body Document */}
        <div
          className={`p-6 sm:p-10 rounded-2xl border space-y-8 text-xs sm:text-sm leading-relaxed ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm'
              : 'bg-[#141a27] border-gray-800 shadow-md'
          }`}
        >
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              1. About SahajAI
            </h2>
            <p>
              SahajAI is an artificial-intelligence-based chatbot and assistance platform using retrieval-augmented generation (&quot;RAG&quot;), locally/on-premises hosted large language models (&quot;LLMs&quot;), knowledge bases and related software components.
            </p>
            <p>Depending on the configuration of the Service, SahajAI may use models including, but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li><strong className={isLight ? 'text-gray-800' : 'text-gray-200'}>Qwen-family models;</strong></li>
              <li><strong className={isLight ? 'text-gray-800' : 'text-gray-200'}>Mistral/Ministral-family models;</strong> and</li>
              <li><strong className={isLight ? 'text-gray-800' : 'text-gray-200'}>Meta Llama-family models.</strong></li>
            </ul>
            <p>
              The particular model used may change depending on the Service configuration, task, performance requirements and availability.
            </p>
            <p>
              SahajAI may process information submitted by users in order to answer questions, retrieve relevant information, provide assistance, improve system performance and, where the user has been appropriately informed and the applicable legal basis exists, train, fine-tune, evaluate or otherwise improve SahajAI.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              2. Information We May Collect
            </h2>
            <p>Depending on how you use SahajAI, we may collect or process:</p>

            <div className="space-y-2">
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                2.1 Information you provide
              </h3>
              <p>This may include:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>prompts and questions;</li>
                <li>chat messages and conversation history;</li>
                <li>documents, files, images or other material submitted to the Service;</li>
                <li>information contained in documents uploaded for RAG processing;</li>
                <li>feedback, ratings and corrections;</li>
                <li>account information;</li>
                <li>name, email address and other contact information;</li>
                <li>information provided when contacting us; and</li>
                <li>any other information you voluntarily provide.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                2.2 Automatically generated technical information
              </h3>
              <p>We may collect technical and operational information such as:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address;</li>
                <li>browser and device information;</li>
                <li>operating system;</li>
                <li>timestamps;</li>
                <li>session identifiers;</li>
                <li>authentication information;</li>
                <li>usage statistics;</li>
                <li>error logs;</li>
                <li>security logs;</li>
                <li>performance information; and</li>
                <li>information concerning interactions with the Service.</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-gray-100'}`}>
                2.3 Information contained in submitted content
              </h3>
              <p>
                Users should assume that information contained in prompts, conversations, documents or uploaded files may be processed by SahajAI.
              </p>
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'}`}>
                <strong>⚠️ Sensitive Data Notice:</strong> Do not submit passwords, authentication credentials, payment-card information, highly confidential business information, government-issued identity documents, or sensitive personal information unless the Service specifically requests or permits such information and you are authorised to provide it.
              </div>
            </div>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              3. How We Use Information
            </h2>
            <p>We may process information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, operate and maintain SahajAI.</li>
              <li>To generate AI responses.</li>
              <li>To perform retrieval-augmented generation and search against authorised knowledge sources.</li>
              <li>To authenticate users and maintain accounts.</li>
              <li>To maintain conversation history where enabled.</li>
              <li>To monitor and improve system reliability and security.</li>
              <li>To detect misuse, fraud, attacks and security incidents.</li>
              <li>To troubleshoot technical problems.</li>
              <li>To evaluate AI performance, accuracy and safety.</li>
              <li>To improve prompts, retrieval systems, workflows and AI models.</li>
              <li>To train, fine-tune, evaluate or improve SahajAI models where permitted by applicable law and the applicable user consent/legal basis.</li>
              <li>To respond to support requests and communications.</li>
              <li>To comply with applicable legal obligations.</li>
              <li>To establish, exercise or defend legal claims.</li>
              <li>To protect the rights, property, security and safety of SahajAI, our users and others.</li>
            </ul>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 4 */}
          <section className="space-y-3.5">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              4. Use of User Data for AI Training and Improvement
            </h2>
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#FACC15] mb-1.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>IMPORTANT NOTICE</span>
              </h3>
              <p>
                SahajAI may use eligible user-submitted content, including prompts, conversations, feedback, documents or other submitted material, to train, fine-tune, evaluate or improve SahajAI and its associated AI systems, subject to applicable law, the user&apos;s consent where required, contractual commitments and the controls described in this Privacy Policy.
              </p>
            </div>
            <p>Where applicable, we may:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>remove or reduce directly identifying information;</li>
              <li>aggregate or transform information;</li>
              <li>filter inappropriate or sensitive information;</li>
              <li>use selected datasets rather than complete conversation histories;</li>
              <li>use human or automated review for quality and safety purposes; and</li>
              <li>maintain separate training, evaluation and production environments.</li>
            </ul>
            <p>Users should not submit information for which they do not have the right or authority to permit such processing.</p>
            <p>Where the Service provides an available opt-out mechanism for model improvement or training, users may exercise that option in accordance with the instructions provided by SahajAI.</p>
            <p>For enterprise customers, separate contractual terms may govern whether customer data is used for model training or improvement.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              5. RAG and Knowledge-Base Processing
            </h2>
            <p>
              SahajAI may process documents and other information supplied by users or authorised administrators to create or maintain searchable knowledge representations, including embeddings, indexes, metadata and related retrieval structures.
            </p>
            <p>Information submitted for RAG processing may therefore exist in:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>original document storage;</li>
              <li>processed text;</li>
              <li>metadata;</li>
              <li>vector/embedding databases;</li>
              <li>search indexes;</li>
              <li>caches;</li>
              <li>backups; and</li>
              <li>security and audit logs.</li>
            </ul>
            <p>
              Deletion of an original document may not immediately remove every derived representation from backup or disaster-recovery systems. We will apply our applicable deletion and retention procedures to such information.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              6. On-Premises and Self-Hosted AI Processing
            </h2>
            <p>
              SahajAI may use AI models hosted on infrastructure controlled by us or our authorised infrastructure providers.
            </p>
            <p>
              Where an on-premises deployment is used, user content may be processed within the applicable deployment environment rather than being sent to a third-party public AI chatbot.
            </p>
            <p>
              However, &quot;on-premises&quot; does not by itself mean that no information leaves the customer&apos;s or operator&apos;s infrastructure. Depending on the deployment architecture, information may be processed by hosting, networking, monitoring, authentication, backup or other service providers.
            </p>
            <p>
              The actual deployment architecture applicable to a particular customer should be confirmed in the relevant contractual or technical documentation.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              7. Sharing and Disclosure of Information
            </h2>
            <p>We do not sell personal data merely for the purpose of selling personal data.</p>
            <p>We may disclose information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>authorised employees and personnel;</li>
              <li>infrastructure and hosting providers;</li>
              <li>security and monitoring providers;</li>
              <li>technology and software providers;</li>
              <li>professional advisers;</li>
              <li>auditors;</li>
              <li>legal authorities where legally required;</li>
              <li>entities involved in corporate restructuring, merger, acquisition or transfer of assets; and</li>
              <li>other parties where authorised by the user or required/permitted by law.</li>
            </ul>
            <p>
              Third-party service providers receiving information are expected to process it only for authorised purposes and subject to appropriate contractual or technical controls where applicable.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              8. Open-Source AI Models
            </h2>
            <p>
              SahajAI may incorporate, modify, fine-tune, orchestrate or otherwise use third-party open-weight/open-source AI models and software.
            </p>
            <p>
              The applicable third-party model licences remain applicable to those components. Nothing in this Privacy Policy transfers ownership of third-party intellectual property to SahajAI or its users.
            </p>
            <p>
              Details concerning model attribution and licensing are provided in our Open-Source Model Attribution and Licensing Declaration.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              9. Data Security
            </h2>
            <p>We use reasonable technical and organisational safeguards appropriate to the nature of the information processed.</p>
            <p>These may include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>access controls;</li>
              <li>authentication and authorisation;</li>
              <li>encryption where appropriate;</li>
              <li>network security;</li>
              <li>logging and monitoring;</li>
              <li>vulnerability management;</li>
              <li>backups;</li>
              <li>role-based access;</li>
              <li>administrative controls; and</li>
              <li>incident-response procedures.</li>
            </ul>
            <p>No internet-connected or computer-based service can guarantee absolute security.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              10. Data Retention
            </h2>
            <p>
              We retain information only for as long as reasonably necessary for the purposes described in this Policy, contractual requirements, legitimate operational requirements, security requirements or applicable law.
            </p>
            <p>Our retention periods may differ according to the type of information.</p>
            <p>Unless otherwise specified:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>account information may be retained while an account remains active and for a reasonable period thereafter;</li>
              <li>conversation data may be retained for 30 days;</li>
              <li>uploaded documents may be retained for 30 days or until deletion by the authorised user;</li>
              <li>security and audit logs may be retained for 30 days;</li>
              <li>training datasets may be retained for 30 days subject to applicable law and our deletion procedures; and</li>
              <li>backups may persist for 30 days before scheduled deletion or overwriting.</li>
            </ul>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              11. User Rights
            </h2>
            <p>Subject to applicable law, users may have rights relating to their personal data, including rights to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>obtain information about processing;</li>
              <li>access personal information;</li>
              <li>request correction or updating;</li>
              <li>request deletion/erasure where applicable;</li>
              <li>withdraw consent where processing is based on consent;</li>
              <li>request information regarding the use of personal data;</li>
              <li>raise a grievance; and</li>
              <li>exercise other rights available under applicable data-protection law.</li>
            </ul>
            <p>Requests may be submitted using the contact details below.</p>
            <p>We may need to verify the identity and authority of a person making a request before acting upon it.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              12. Children&apos;s Data
            </h2>
            <p>
              SahajAI is not intended to knowingly collect personal information from children in circumstances where parental or guardian consent is legally required unless appropriate mechanisms are implemented.
            </p>
            <p>
              Where applicable law requires parental/guardian consent for processing a child&apos;s personal data, such consent must be obtained before use of the Service.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              13. Third-Party Websites and Services
            </h2>
            <p>SahajAI may contain links to third-party websites or services.</p>
            <p>We are not responsible for the privacy practices, security or content of third-party websites.</p>
            <p>Users should review the privacy policies applicable to such third-party services.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              14. International Data Transfers
            </h2>
            <p>
              Depending on our infrastructure and service configuration, information may be processed or stored in India or other jurisdictions.
            </p>
            <p>Where personal data is transferred across jurisdictions, we will apply safeguards required by applicable law.</p>
            <p>Enterprise customers may receive additional information concerning infrastructure location and data residency.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              15. Changes to This Privacy Policy
            </h2>
            <p>We may update this Privacy Policy from time to time.</p>
            <p>
              The updated version will be published on the SahajAI website with a revised &quot;Last Updated&quot; date.
            </p>
            <p>Where legally required, we will provide additional notice or obtain consent before implementing material changes.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 16 */}
          <section className="space-y-4">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              16. Contact and Grievance
            </h2>
            <p>For privacy questions, requests or grievances, contact:</p>

            <div
              className={`p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm ${
                isLight
                  ? 'bg-gray-50 border-gray-200 text-gray-700'
                  : 'bg-[#182238]/70 border-gray-800 text-gray-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Data Protection / Privacy Contact:</span>
                  <a href="mailto:privacy@sahajai.aivistatech.com" className="text-[#FACC15] hover:underline font-medium">
                    privacy@sahajai.aivistatech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Organisation:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>Aivista Technologies Private Limited.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Email:</span>
                  <a href="mailto:syed.arshad@aivistatech.com" className="text-[#FACC15] hover:underline font-medium">
                    syed.arshad@aivistatech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Address:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>Kolkata.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Grievance Contact:</span>
                  <a href="mailto:syed.arshad@aivistatech.com" className="text-[#FACC15] hover:underline font-medium">
                    syed.arshad@aivistatech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Response Time:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>30 days</span>
                </div>
              </div>
            </div>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              17. Important AI-Specific Privacy Notice
            </h2>
            <p>
              SahajAI is an AI system. Information supplied to the system may be processed algorithmically and, where applicable, may contribute to model evaluation, training or improvement.
            </p>
            <p>
              Users should therefore exercise appropriate care before entering confidential, privileged, proprietary or sensitive information.
            </p>
            <p>
              Where an organisation requires strict isolation of its information from model training, it should use a deployment or contractual configuration that expressly provides for no-training/no-model-improvement use of customer data.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              18. Governing Law
            </h2>
            <p>
              This Privacy Policy shall be interpreted in accordance with applicable laws and regulations, including applicable Indian data-protection and information-technology laws, as may be amended from time to time.
            </p>
            <p>
              Nothing in this Policy limits any mandatory rights available to individuals under applicable law.
            </p>
          </section>

          {/* Ending mark */}
          <div className="pt-6 pb-2 text-center text-xs text-gray-500 font-medium">
            — End of Privacy Policy —
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 px-4 text-center text-xs ${
          isLight ? 'bg-white border-gray-200 text-gray-500' : 'bg-[#111827] border-gray-800 text-gray-400'
        }`}
      >
        <p>© 2026 Aivista Technologies Private Limited. All rights reserved.</p>
        <p className="mt-1">sahajAI • AI Chatbot &amp; Retrieval-Augmented Generation Platform</p>
      </footer>
    </div>
  )
}
