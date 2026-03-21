import { Hero } from '../sections/Hero';
import { HowItWorks } from '../sections/HowItWorks';
import { Features } from '../sections/Features';
import { GreatCompany } from '../sections/GreatCompany';

export default function Index() {
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

            {/* Footer */}
            
        </div>
    );
}