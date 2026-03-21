import { useNavigate } from 'react-router-dom';
import { Hero } from '../sections/Hero';
import { HowItWorks } from '../sections/HowItWorks';
import { Features } from '../sections/Features';
import { GreatCompany } from '../sections/GreatCompany';

export default function Index() {
    const navigate = useNavigate();

    return (
        <div className="py-2 pb-10 space-y-6">
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
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-[40px] p-8 md:p-12 lg:p-16 shadow-lg w-full mx-auto max-w-7xl text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                    Ready to Discover Your Learning Style?
                </h2>
                <p className="text-lg text-white/90 font-medium mb-8 max-w-2xl mx-auto">
                    Take our personalized assessment to unlock a customized learning experience designed for your brain.
                </p>
                <button
                    onClick={() => navigate('/assessment')}
                    className="inline-flex items-center gap-3 bg-white text-blue-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105"
                >
                    Start Your Free Assessment
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </button>
            </div>
        </div>
    );
}