import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { AudioControl } from '../ui/AudioControl';
import { Hero } from '../sections/Hero';
import { HowItWorks } from '../sections/HowItWorks';
import { Features } from '../sections/Features';
import { GreatCompany } from '../sections/GreatCompany';

export default function Index() {
    const navigate = useNavigate();
    const { isDyslexiaMode, toggleDyslexiaMode, language } = useDyslexia();
    const t = getTranslation(language);
    
    const [pageContent, setPageContent] = useState(`${t.inclusiveLearning}. ${t.heroTitle} ${t.heroSubtitle}`);

    useEffect(() => {
        // Collect readable text from the entire page after rendering
        const timer = setTimeout(() => {
            const contentDiv = document.getElementById('landing-content');
            if (contentDiv) {
                // Select semantic tags that represent actual readable content, avoiding buttons/labels
                const elements = contentDiv.querySelectorAll('h1, h2, h3, h4, p');
                const extractedText = Array.from(elements)
                    .map(el => (el as HTMLElement).innerText.trim())
                    .filter(text => text.length > 0)
                    .join('. ');
                
                if (extractedText) {
                    setPageContent(extractedText);
                }
            }
        }, 500); // Small delay ensures child components (Hero, Features, etc.) mount completely

        return () => clearTimeout(timer);
    }, [language, t]);

    return (
        <div className="py-2 pb-10 space-y-6">
            {/* Accessibility Bar */}
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4 px-4 lg:px-0">
               {/* Left: Text to Speech */}
               <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                  <AudioControl text={pageContent} showControls={true} />
               </div>

               {/* Right: Language Selector and Dyslexia Toggle */}
               <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
                 <select
                   value={language}
                   onChange={(e) => window.location.reload()}
                   className="bg-white border-2 border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium focus:border-blue-400 focus:outline-none transition-colors cursor-pointer"
                   aria-label="Select language"
                 >
                   <option value="en">🇬🇧 EN</option>
                   <option value="hi">🇮🇳 HI</option>
                   <option value="mr">🇮🇳 MR</option>
                 </select>

                 <div className="flex items-center gap-3 bg-[#EBF3FC] px-4 py-1.5 rounded-full border border-[#D1E4F9]">
                   <span className="text-[#306CBE] font-bold text-sm hidden md:inline-flex items-center gap-1.5">
                     <span className="text-base">🎨</span> Dyslexia Mode
                   </span>
                   <button
                     onClick={toggleDyslexiaMode}
                     className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:ring-offset-1 ${
                       isDyslexiaMode ? 'bg-[#4A90E2]' : 'bg-[#B1CBEA]'
                     }`}
                     aria-label="Toggle dyslexia mode"
                   >
                     <span
                       className={`absolute inset-y-0 left-0 m-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                         isDyslexiaMode ? 'translate-x-[20px]' : 'translate-x-0'
                       }`}
                     />
                   </button>
                 </div>
               </div>
            </div>

            <div id="landing-content" className="space-y-6 w-full flex flex-col">
              <Hero />
            
            {/* How It Works Section (Standalone Card) */}
            <div className="bg-[#F5F9FD] rounded-[40px] p-8 md:p-12 lg:p-16 shadow-sm w-full border border-white/50 mx-auto max-w-7xl">
                <HowItWorks />
            </div>

            {/* Unified Seamless Container for Features and GreatCompany */}
            <div className="bg-[#F5F9FD] rounded-[40px] p-8 md:p-12 lg:p-16 shadow-sm w-full border border-white/50 mx-auto max-w-7xl flex flex-col gap-y-20">
                <Features />
                <GreatCompany />
            </div>

            {/* CTA Section */}
            
          </div>
        </div>
    );
}