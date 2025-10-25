import TalkheeselyHero from "@/components/TalkheeselyHero";
import TalkheeselyFeatures from "@/components/TalkheeselyFeatures";
import TalkheeselyForm from "@/components/TalkheeselyForm";
import TalkheeselyFooter from "@/components/TalkheeselyFooter";
import ComingSoonDialog from "@/components/ComingSoonDialog";
const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TalkheeselyHero />
      <TalkheeselyFeatures />
      <TalkheeselyForm />
    <ComingSoonDialog open={true} onOpenChange={() => {}} />
      <TalkheeselyFooter />
    </div>
  );
};

export default Index;
