import React from 'react'
import {
  AlertTriangle,
  Calendar,
  Globe,
  Building2,
  Mail,
  MapPin,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle2,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { ThinkingBulb } from './ThinkingBulb'

export const DisclaimerPage: React.FC = () => {
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
      id="disclaimer-page"
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
              <span className="text-[#FACC15]">sahaj</span>
              <span className={isLight ? 'text-gray-950' : 'text-white'}>AI</span>
            </span>
          </a>

          <div className="h-5 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">
              Disclaimer
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
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  DISCLAIMER
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Operated by: Aivista Technologies Private Limited
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FACC15]/15 text-[#FACC15] border border-[#FACC15]/30 self-start sm:self-auto">
              sahajai.aivistatech.com
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
              <span><strong>Last Updated:</strong> 07 October 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span><strong>Website:</strong> sahajai.aivistatech.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span><strong>Platform:</strong> SahajAI (RAG Assistance)</span>
            </div>
          </div>

          {/* Platform Intro Statement */}
          <div className="mt-6 space-y-3 text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold text-sm sm:text-base text-[#FACC15]">
              Platform: SahajAI – AI Chatbot, AI Assistance and Retrieval-Augmented Generation (RAG) Platform
            </p>
            <p>
              This Disclaimer sets forth the terms, limitations, and responsibilities governing the use of SahajAI and AI-generated outputs produced through our Platform.
            </p>
          </div>
        </div>

        {/* Disclaimer Body Document */}
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
              1. General Disclaimer
            </h2>
            <p>
              SahajAI is an artificial intelligence-based chatbot and assistance platform designed to provide information, answer questions, retrieve relevant content, analyse submitted information, and assist users through artificial intelligence and Retrieval-Augmented Generation (RAG) technologies.
            </p>
            <p>
              The information and responses generated by SahajAI are provided for general informational, assistance and productivity purposes only. Although we strive to provide useful and relevant responses, AI-generated content may occasionally be inaccurate, incomplete, outdated, misleading or inappropriate for a particular situation.
            </p>
            <p>
              Users should independently verify important information before relying upon or acting on any response generated by SahajAI.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 2 */}
          <section className="space-y-3.5">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              2. AI-Generated Content
            </h2>
            <p>
              SahajAI may generate responses using Large Language Models (LLMs), retrieval systems, knowledge bases and other artificial intelligence technologies.
            </p>
            <p>
              AI systems are probabilistic in nature. Therefore, SahajAI does not guarantee that any generated response will be:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>completely accurate or factually correct;</li>
              <li>complete or comprehensive;</li>
              <li>current or up to date;</li>
              <li>free from errors, omissions or inconsistencies;</li>
              <li>suitable for a user&apos;s specific circumstances; or</li>
              <li>appropriate for professional or critical decision-making.</li>
            </ul>
            <p className="font-semibold text-[#FACC15]">
              A response that appears confident should not automatically be considered correct.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              3. Retrieval-Augmented Generation (RAG)
            </h2>
            <p>
              SahajAI may use Retrieval-Augmented Generation to generate responses based on documents, databases, knowledge bases or other information made available to the Platform.
            </p>
            <p>
              The accuracy and usefulness of a RAG-generated response may depend on the accuracy, completeness, relevance and currency of the underlying source material.
            </p>
            <p>
              SahajAI does not independently guarantee that information contained in user-uploaded documents or connected knowledge sources is correct.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 4 */}
          <section className="space-y-3.5">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              4. No Professional Advice
            </h2>
            <p>
              Unless expressly stated otherwise through a specific authorised service, SahajAI&apos;s responses should not be considered a substitute for professional advice.
            </p>
            <p>In particular, AI-generated responses should not be relied upon as professional:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>legal advice;</li>
              <li>medical or healthcare advice;</li>
              <li>financial or investment advice;</li>
              <li>tax or accounting advice;</li>
              <li>regulatory or compliance advice; or</li>
              <li>other specialised professional advice.</li>
            </ul>
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'}`}>
              <strong>⚠️ Professional Judgement Notice:</strong> Users should consult an appropriately qualified professional before making decisions where professional judgement is required.
            </div>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              5. User Responsibility
            </h2>
            <p>
              Users are responsible for evaluating SahajAI&apos;s responses before using, publishing, sharing or relying upon them.
            </p>
            <p>
              Users should exercise additional caution where an AI-generated response could affect health, safety, employment, finances, legal rights, regulatory obligations, business operations or other significant decisions.
            </p>
            <p>
              Users are also responsible for ensuring that information, documents and other content submitted to SahajAI are provided lawfully and that they have the necessary rights, permissions or authority to submit such content.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              6. Confidential and Sensitive Information
            </h2>
            <p>
              Users should exercise appropriate care when entering information into SahajAI.
            </p>
            <p>
              Unless specifically permitted by the applicable deployment, agreement or workflow, users should avoid submitting passwords, authentication credentials, payment-card information, government-issued identification information, highly confidential business information, privileged information or sensitive personal data.
            </p>
            <p>
              The handling of personal information and user-submitted content is further described in the SahajAI Privacy Policy.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              7. AI Models and Third-Party Technologies
            </h2>
            <p>
              SahajAI may use, integrate, configure, fine-tune or interact with third-party open-source, open-weight or publicly licensed AI models and software, which may include model families such as Qwen, Mistral/Ministral and Meta Llama.
            </p>
            <p>
              The applicable intellectual-property rights, licences and trademarks relating to such third-party technologies remain with their respective owners.
            </p>
            <p>
              The inclusion or use of a third-party technology, model, product name or trademark does not imply sponsorship, endorsement, partnership or affiliation unless expressly stated.
            </p>
            <p>
              Additional information may be provided through SahajAI&apos;s Open-Source Model Attribution and Licensing Declaration.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              8. User-Submitted Content and AI Improvement
            </h2>
            <p>
              Depending on the applicable SahajAI deployment, user consent, contractual terms and applicable law, eligible user-submitted content may be processed for purposes including providing AI responses, RAG processing, evaluation, security, system improvement, model improvement, fine-tuning or training.
            </p>
            <p>
              Users should not submit content for which they do not have the necessary authority or rights.
            </p>
            <p>
              Enterprise or dedicated deployments may be subject to separate contractual terms governing data processing, retention, training and model improvement.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              9. Third-Party Information and Links
            </h2>
            <p>
              SahajAI may generate or display information relating to third-party websites, products, organisations or services.
            </p>
            <p>
              A reference or link to a third party does not constitute an endorsement or guarantee by Aivista Technologies Private Limited.
            </p>
            <p>
              We are not responsible for the availability, accuracy, security, content, products, services, privacy practices or policies of third-party websites or services.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              10. Service Availability
            </h2>
            <p>
              SahajAI may be modified, updated, suspended or temporarily unavailable due to maintenance, technical problems, infrastructure issues, model availability, security requirements or other operational circumstances.
            </p>
            <p>
              We do not guarantee uninterrupted, error-free or continuously available access to the Platform.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              11. Limitation of Reliance
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Aivista Technologies Private Limited does not accept responsibility for decisions, actions, losses or consequences arising solely from reliance on AI-generated responses without appropriate independent verification.
            </p>
            <p>
              Nothing in this Disclaimer excludes or limits any liability or statutory right that cannot lawfully be excluded or limited under applicable law.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              12. Intellectual Property
            </h2>
            <p>
              SahajAI may contain proprietary technology, interfaces, software, workflows, RAG architecture, retrieval mechanisms, prompts, configurations and other materials belonging to Aivista Technologies Private Limited or its licensors.
            </p>
            <p>
              Third-party models, software, trademarks and other intellectual property remain subject to their respective ownership and licensing terms.
            </p>
            <p>
              Users must not interpret access to SahajAI as granting ownership of or unrestricted rights to any underlying third-party model, software or intellectual property.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              13. Changes to This Disclaimer
            </h2>
            <p>
              Aivista Technologies Private Limited may update this Disclaimer periodically to reflect changes in SahajAI&apos;s functionality, technologies, legal requirements, deployment architecture or business practices.
            </p>
            <p>
              The latest version should be published on the SahajAI website with the applicable &quot;Last Updated&quot; date.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              14. Acceptance
            </h2>
            <p>
              By accessing or using SahajAI, you acknowledge that you are interacting with an artificial intelligence system and understand that its responses may contain errors or inaccuracies.
            </p>
            <p>
              You agree to exercise appropriate judgement and independently verify information before making significant decisions based on SahajAI-generated content.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 15 */}
          <section className="space-y-4">
            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              15. Contact
            </h2>
            <p>
              For questions concerning SahajAI, this Disclaimer, privacy, data processing or related matters, please contact:
            </p>

            <div
              className={`p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm ${
                isLight
                  ? 'bg-gray-50 border-gray-200 text-gray-700'
                  : 'bg-[#182238]/70 border-gray-800 text-gray-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Organisation:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>Aivista Technologies Private Limited</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Website:</span>
                  <a href="https://sahajai.aivistatech.com" target="_blank" rel="noreferrer" className="text-[#FACC15] hover:underline font-medium">
                    sahajai.aivistatech.com
                  </a>
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
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Registered Office:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>Kolkata</span>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notice Callout Box */}
          <div
            className={`p-5 rounded-2xl border ${
              isLight
                ? 'bg-yellow-50 border-yellow-200 text-yellow-950'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#FACC15] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#FACC15] mb-1">
                  Important Notice
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  SahajAI is an AI-powered assistance platform. AI-generated responses may be inaccurate or incomplete. Always verify important information independently before relying on it.
                </p>
              </div>
            </div>
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
