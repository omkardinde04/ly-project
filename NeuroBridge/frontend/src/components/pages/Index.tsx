import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDyslexia } from '../../contexts/DyslexiaContext';
import { getTranslation } from '../../utils/translations';
import { Hero } from '../sections/Hero';
import { HowItWorks } from '../sections/HowItWorks';
import { Features } from '../sections/Features';
import { GreatCompany } from '../sections/GreatCompany';
import { CommunitySectionPreview } from '../sections/CommunitySectionPreview';

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
    <div className="py-2 pb-10 space-y-3">

      <div id="landing-content" className="space-y-6 w-full flex flex-col">
        <div id="hero-section">
          <Hero />
        </div>

        {/* How It Works Section (Standalone Card) */}
        <div id="how-it-works-section" className="bg-[#F5F9FD] rounded-[40px] p-8 md:p-12 lg:p-16 shadow-sm w-full border border-white/50 mx-auto max-w-7xl">
          <HowItWorks />
        </div>

        {/* Unified Seamless Container for Features and GreatCompany */}
        <div id="features-section" className="bg-[#F5F9FD] rounded-[40px] p-8 md:p-12 lg:p-16 shadow-sm w-full border border-white/50 mx-auto max-w-7xl flex flex-col gap-y-20">
          <Features />
          <GreatCompany />
        </div>

        {/* Community Preview Section */}
        <CommunitySectionPreview />

        {/* CTA Section */}

      </div>
    </div>
  );
}