import BottomCTA from './components/BottomCTA';
import FAQ from './components/FAQ';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';

export default function WebsiteIndex() {
  return (
    <div className={`mx-auto flex h-full flex-1 flex-col`}>
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <FAQ />
      <BottomCTA />
    </div>
  );
}
