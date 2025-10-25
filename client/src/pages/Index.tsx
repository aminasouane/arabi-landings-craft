import TalkheeselyHero from "@/components/TalkheeselyHero";
import TalkheeselyFeatures from "@/components/TalkheeselyFeatures";
import TalkheeselyForm from "@/components/TalkheeselyForm";
import TalkheeselyFooter from "@/components/TalkheeselyFooter";
const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TalkheeselyHero />
      <TalkheeselyFeatures />
      <TalkheeselyForm />
      <TalkheeselyFooter />
    </div>
  );
};

export default Index;
