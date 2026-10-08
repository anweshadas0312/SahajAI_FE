import React from 'react'
import {
  Calendar,
  Globe,
  Building2,
  Mail,
  MapPin,
  ArrowLeft,
  Sun,
  Moon,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Scale,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { ThinkingBulb } from './ThinkingBulb'

export const TermsPage: React.FC = () => {
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
      id="terms-page"
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#EAB308]">
              Terms &amp; Model Licensing
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30">
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
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[#EAB308]" />}
          </button>

          <a
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAB308] hover:bg-[#EAB308] text-gray-950 text-xs font-bold shadow-md shadow-yellow-500/10 transition cursor-pointer"
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
              <div className="w-12 h-12 rounded-2xl bg-[#EAB308]/15 border border-[#EAB308]/30 flex items-center justify-center text-[#EAB308] shrink-0 shadow-xs">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isLight ? 'text-gray-950' : 'text-white'}`}>
                  TERMS AND CONDITIONS &amp; MODEL DECLARATION
                </h1>
                <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Aivista Technologies Private Limited
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30 self-start sm:self-auto">
              sahajAI.aivistatech.com
            </span>
          </div>

          {/* Metadata Grid */}
          <div
            className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs ${
              isLight
                ? 'bg-gray-50/80 border-gray-200 text-gray-600'
                : 'bg-[#192236]/60 border-gray-800 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span><strong>Last Updated:</strong> 07th October 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span><strong>Website:</strong> sahajAI.aivistatech.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span><strong>Operator:</strong> Aivista Technologies</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#EAB308] shrink-0" />
              <span><strong>Version:</strong> 1.0</span>
            </div>
          </div>

          {/* Platform Intro Statement */}
          <div className="mt-6 space-y-3 text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold text-sm sm:text-base text-[#EAB308]">
              Project: sahajAI — Terms of Service and Open-Source Licensing Framework
            </p>
            <p>
              By accessing, browsing, or utilizing sahajAI (&quot;Platform&quot;, &quot;Service&quot;), operated by <strong>Aivista Technologies Private Limited</strong>, you agree to these Terms and Conditions and acknowledge our open-source model attribution and licensing declarations below.
            </p>
          </div>
        </div>

        {/* Declaration Body Document */}
        <div
          className={`p-6 sm:p-10 rounded-2xl border space-y-8 text-xs sm:text-sm leading-relaxed ${
            isLight
              ? 'bg-white border-gray-200 shadow-sm'
              : 'bg-[#141a27] border-gray-800 shadow-md'
          }`}
        >
          {/* Main Title Banner */}
          <div className="text-center py-2 border-b pb-6 border-gray-200 dark:border-gray-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Open-Source Licensing Framework</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isLight ? 'text-gray-950' : 'text-white'}`}>
              OPEN-SOURCE MODEL ATTRIBUTION AND LICENSING DECLARATION
            </h2>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>1. Purpose</span>
            </h3>
            <p>
              SahajAI incorporates, interfaces with, or is developed using certain third-party open-source, open-weight and/or publicly licensed software and artificial-intelligence models.
            </p>
            <p>
              This Declaration identifies the principal third-party AI model families used by SahajAI and acknowledges the rights and intellectual-property interests of their respective authors and licensors.
            </p>
            <p>
              SahajAI does not claim ownership of the underlying third-party models merely because those models are hosted, configured, fine-tuned, orchestrated or integrated into SahajAI.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 2 */}
          <section className="space-y-5">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>2. Third-Party Model Attribution</span>
            </h3>

            {/* 2.1 Qwen */}
            <div
              className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#182238]/60 border-gray-800'
              }`}
            >
              <h4 className="text-sm font-bold text-[#EAB308] flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <span>2.1 Qwen / Qwen2.5</span>
              </h4>
              <p>SahajAI may use Qwen2.5-family models developed by the <strong>Qwen Team / Alibaba Cloud</strong>.</p>
              <p>Copyright and licensing rights relating to Qwen materials remain with their respective rights holders.</p>
              <p>The applicable Qwen model licence must be reviewed for the exact model version deployed by SahajAI.</p>
              <p>
                Certain Qwen2.5 model repositories are distributed under the <strong>Qwen License Agreement</strong> rather than Apache 2.0. Accordingly, SahajAI does not represent that all Qwen2.5 models are Apache-2.0 licensed.
              </p>
              <p>
                Where the applicable Qwen licence requires attribution, SahajAI provides the applicable attribution and licensing information. Where applicable, SahajAI acknowledges the requirement to identify the use of Qwen in accordance with the relevant Qwen licence.
              </p>
            </div>

            {/* 2.2 Mistral */}
            <div
              className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#182238]/60 border-gray-800'
              }`}
            >
              <h4 className="text-sm font-bold text-[#EAB308] flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>2.2 Mistral / Ministral</span>
              </h4>
              <p>SahajAI may use <strong>Mistral AI</strong> models, including models from the Ministral/Mistral 3 family.</p>
              <p>
                Mistral AI has released the Ministral 3 family under the <strong>Apache License, Version 2.0</strong>, subject to the applicable model documentation and licence terms.
              </p>
              <p className="font-semibold text-gray-400">Copyright © Mistral AI and applicable contributors.</p>
              <p>
                Where Apache-2.0 licensed Mistral components are distributed by SahajAI, SahajAI preserves the applicable copyright notices, licence notices and attribution information required by Apache License 2.0.
              </p>
            </div>

            {/* 2.3 Meta Llama */}
            <div
              className={`p-4 sm:p-5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#182238]/60 border-gray-800'
              }`}
            >
              <h4 className="text-sm font-bold text-[#EAB308] flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>2.3 Meta Llama</span>
              </h4>
              <p>SahajAI may use <strong>Meta Llama-family models</strong>, including Llama 3.2.</p>
              <p>
                Llama models are subject to the applicable <strong>Meta Llama Community License Agreement</strong> and associated acceptable-use and attribution requirements, rather than being represented as Apache-2.0 licensed software.
              </p>
              <p className="font-semibold text-gray-400">Copyright © Meta Platforms, Inc. and applicable contributors.</p>
              <p>
                The exact licence applicable to the deployed Llama model shall be retained with the corresponding model distribution and deployment records.
              </p>
            </div>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>3. Apache License 2.0 Notice</span>
            </h3>
            <p>
              Where SahajAI distributes or incorporates software, model components or other materials licensed under the Apache License, Version 2.0, the applicable Apache License 2.0 terms remain in force.
            </p>
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <span>A copy of the Apache License, Version 2.0, is available at:</span>
              <a
                href="https://www.apache.org/licenses/LICENSE-2.0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#EAB308] hover:underline"
              >
                <span>apache.org/licenses/LICENSE-2.0</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p>
              Unless required by the applicable licence, the inclusion of an Apache-2.0 licensed component does not imply endorsement by the original authors.
            </p>
            <p>
              Modified Apache-licensed files/components, where distributed, shall retain appropriate notices identifying material modifications.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 4 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>4. Preservation of Notices</span>
            </h3>
            <p>Where applicable, SahajAI will preserve:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>copyright notices;</li>
              <li>licence notices;</li>
              <li>NOTICE files;</li>
              <li>attribution requirements;</li>
              <li>model cards;</li>
              <li>third-party licence texts; and</li>
              <li>other legally required notices.</li>
            </ul>
            <p>
              The applicable notices may be provided through a &quot;Third-Party Licences&quot;, &quot;Open Source&quot;, &quot;Legal Notices&quot; or similar section of the SahajAI website or product distribution.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>5. No Ownership Claim Over Third-Party Models</span>
            </h3>
            <p>
              SahajAI and Aivista Technologies Private Limited do not claim ownership of the original third-party model weights, source code, documentation, trademarks or other intellectual property belonging to the respective model developers or licensors.
            </p>
            <p>SahajAI may own its own:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>application software;</li>
              <li>user interface;</li>
              <li>RAG architecture;</li>
              <li>retrieval pipelines;</li>
              <li>orchestration logic;</li>
              <li>prompts and system configurations;</li>
              <li>integration code;</li>
              <li>evaluation framework;</li>
              <li>independently created datasets;</li>
              <li>independently created fine-tuning material;</li>
              <li>deployment configuration; and</li>
              <li>other original materials,</li>
            </ul>
            <p>subject always to the rights and restrictions applicable to third-party components.</p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 6 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>6. SahajAI Modifications and Fine-Tuning</span>
            </h3>
            <p>
              SahajAI may configure, adapt, fine-tune, evaluate or otherwise modify third-party models.
            </p>
            <p>
              Such modifications do not automatically transfer ownership of the underlying model to SahajAI.
            </p>
            <p>
              Where a third-party licence imposes attribution, notice, display, redistribution, use or other conditions on modifications or derivative materials, SahajAI will comply with those requirements to the extent applicable.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 7 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>7. User Data and Model Training</span>
            </h3>
            <p>
              SahajAI may use authorised user data for training, fine-tuning, evaluation or improvement of SahajAI, subject to the SahajAI Privacy Policy, applicable consent/legal basis, contractual restrictions and applicable third-party model licences.
            </p>
            <p>
              The use of user-provided data does not give SahajAI ownership of intellectual property that belongs to the user or another lawful rights holder.
            </p>
            <p>
              Users are responsible for ensuring that they have the necessary rights and permissions to submit data for processing, RAG indexing, training, fine-tuning or other permitted uses.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 8 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>8. Third-Party Software</span>
            </h3>
            <p>
              In addition to AI models, SahajAI may use open-source libraries, frameworks, databases, inference engines, operating-system components and other third-party software.
            </p>
            <p>
              A complete software bill of materials and applicable licence notices may be maintained separately and made available upon request or through the SahajAI legal notices page.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 9 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>9. Licence Compliance</span>
            </h3>
            <p>
              SahajAI&apos;s deployment and distribution procedures are intended to preserve and comply with the applicable licences of third-party components.
            </p>
            <p>
              Where licence terms differ between model versions, the licence accompanying the exact deployed model shall control.
            </p>
            <p>
              Users should not rely solely on this summary when redistributing third-party model weights or other third-party materials.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 10 */}
          <section className="space-y-3">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>10. Trademark Notice</span>
            </h3>
            <p>
              Names such as Qwen, Mistral, Ministral, Llama, Meta and other third-party names, marks and logos belong to their respective owners.
            </p>
            <p>
              Their use in this document is for identification and attribution purposes only and does not imply sponsorship, endorsement or affiliation unless expressly stated.
            </p>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Section 11 */}
          <section className="space-y-3.5">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-gray-950' : 'text-white'}`}>
              <span>11. Licence Verification</span>
            </h3>
            <p>Before each production deployment or redistribution, SahajAI&apos;s maintainers should verify:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>the exact model name and version;</li>
              <li>the model repository;</li>
              <li>the licence file;</li>
              <li>applicable acceptable-use policies;</li>
              <li>attribution requirements;</li>
              <li>redistribution requirements;</li>
              <li>modification/derivative-work requirements;</li>
              <li>trademark requirements; and</li>
              <li>any commercial-use restrictions.</li>
            </ol>
          </section>

          <hr className={isLight ? 'border-gray-200' : 'border-gray-800'} />

          {/* Contact Details Card */}
          <section className="space-y-4">
            <h3 className={`text-base sm:text-lg font-bold ${isLight ? 'text-gray-950' : 'text-white'}`}>
              Legal &amp; Licensing Contact
            </h3>
            <p>For questions concerning open-source licensing, model attribution, or terms of service, please contact:</p>

            <div
              className={`p-5 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm ${
                isLight
                  ? 'bg-gray-50 border-gray-200 text-gray-700'
                  : 'bg-[#182238]/70 border-gray-800 text-gray-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Organisation:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>Aivista Technologies Private Limited</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Website:</span>
                  <a href="https://sahajai.aivistatech.com" target="_blank" rel="noreferrer" className="text-[#EAB308] hover:underline font-medium">
                    sahajai.aivistatech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Email:</span>
                  <a href="mailto:syed.arshad@aivistatech.com" className="text-[#EAB308] hover:underline font-medium">
                    syed.arshad@aivistatech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                <div>
                  <span className={`block font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Registered Office:</span>
                  <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>Kolkata</span>
                </div>
              </div>
            </div>
          </section>

          {/* Ending mark */}
          <div className="pt-6 pb-2 text-center text-xs text-gray-500 font-medium">
            — End of Open-Source Model Attribution and Licensing Declaration —
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
