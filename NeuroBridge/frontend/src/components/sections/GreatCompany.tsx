import { Clapperboard, MonitorPlay, Rocket, Palette, Zap, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function GreatCompany() {
  const people = [
    {
      icon: <Clapperboard size={24} />,
      quote: `"I was seen as the dumbest person in school. But movies let me think in pictures, not words."`,
      name: "Steven Spielberg",
      role: "Legendary Film Director · Schindler's List, E.T."
    },
    {
      icon: <MonitorPlay size={24} />,
      quote: `"Creativity is just connecting things. Dyslexia made me see connections others missed."`,
      name: "Steve Jobs",
      role: "Co-founder, Apple · Visionary Entrepreneur"
    },
    {
      icon: <Rocket size={24} />,
      quote: `"My brain works differently — and that's exactly why I could imagine things no one else dared to."`,
      name: "Richard Branson",
      role: "Founder, Virgin Group · Billionaire Entrepreneur"
    },
    {
      icon: <Palette size={24} />,
      quote: `"I struggled to read as a child. But I could see beauty and tell stories that words couldn't capture."`,
      name: "Leonardo da Vinci",
      role: "Artist, Inventor & Renaissance Genius"
    },
    {
      icon: <Zap size={24} />,
      quote: `"My teachers gave up on me. I proved that the mind, not the grade, is the real measure of a person."`,
      name: "Albert Einstein",
      role: "Physicist · Nobel Prize Winner"
    },
    {
      icon: <Waves size={24} />,
      quote: `"Dyslexia taught me to work harder and focus deeper. It's the reason I never gave up."`,
      name: "Michael Phelps",
      role: "23× Olympic Gold Medalist · World Record Holder"
    }
  ];

  return (
    <div className="bg-surface-2 rounded-[48px] p-8 md:p-12 lg:p-16 w-full text-text relative overflow-hidden shadow-lg mx-auto">
      
      {/* Decorative dark circle blob in the top right corner */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-accent/30 rounded-full z-0"
      />

      {/* Content wrapper to stay above exactly decorative backgrounds */}
      <div className="relative z-10 flex flex-col items-start gap-4 mb-16">
        <div className="bg-surface text-text px-5 py-2 rounded-full text-sm font-extrabold shadow-sm">
          You're in Great Company
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-[56px] font-black text-text leading-tight tracking-tight mt-2">
          Dyslexia didn't stop them.<br/>It shaped them.
        </h2>
        <p className="text-text-muted text-xl font-medium max-w-2xl leading-relaxed mt-2">
          Brilliant people think differently — just like you.
        </p>
      </div>

      {/* Grid of famous dyslexic people */}
      <motion.div 
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {people.map((person, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-surface rounded-[32px] p-8 hover:bg-surface-2 transition-colors border border-border flex flex-col h-full group shadow-sm"
          >
            
            {/* Top Icon */}
            <div className="bg-bg w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform text-primary">
              {person.icon}
            </div>
            
            {/* Quote */}
            <p className="text-[15px] text-text-muted italic leading-relaxed mb-6 font-serif grow">
              {person.quote}
            </p>
            
            {/* Identity line */}
            <div className="mb-6">
              <h4 className="text-text font-bold text-lg">{person.name}</h4>
              <p className="text-text-muted text-xs font-medium mt-1 leading-snug">{person.role}</p>
            </div>
            
            {/* Badge */}
            <div className="bg-coral-soft text-coral px-4 py-1.5 rounded-full text-xs font-bold w-max tracking-wide uppercase shadow-sm">
              Has Dyslexia
            </div>
          </motion.div>
        ))}
      </motion.div>

    </div>
  );
}
