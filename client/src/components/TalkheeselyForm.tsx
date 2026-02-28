import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TalkheeselyForm = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            ابدأ الآن وحقق أقصى استفادة من تطبيقك
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            انضم لآلاف الطلبة الذين يستخدمون تلخيصلي للحصول على ملخصات دقيقة وموثوقة
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-4 hover-elevate active-elevate-2"
            onClick={() => window.location.href = "https://app.telkhiseli.info/"}
          >
            <span>افتح التطبيق الآن</span>
            <ArrowLeft className="mr-3 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TalkheeselyForm;
