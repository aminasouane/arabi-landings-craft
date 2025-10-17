import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Sparkles, Clock } from "lucide-react";
import ComingSoonDialog from "./ComingSoonDialog";
import ComingSoonVideoDialog from "./ComingSoonVideoDialog";

const TalkheeselyHero = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  
  // عدّاد زمني للإطلاق في 30 نوفمبر 2025
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    const launchDate = new Date('2025-11-30T00:00:00');
    const now = new Date().getTime();
    const difference = launchDate.getTime() - now;
    
    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds, isExpired: false };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  // تحديث العدّاد كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
      {/* خلفية مزخرفة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* الشارة */}
          <div className="inline-flex items-center gap-3 bg-card border rounded-full px-6 py-3 mb-8 shadow-sm">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-foreground font-medium">تطبيق ذكي للطلبة</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>

          {/* العنوان الرئيسي */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            خلاص محاضرتك صار أسهل
            <span className="block text-primary mt-2">
              مع تلخيصلي 📚✨
            </span>
          </h1>

          {/* الوصف */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            تطبيق ذكي يحول المحاضرات الطويلة إلى ملخصات مفيدة وسهلة الفهم باستخدام الذكاء الاصطناعي
          </p>

          {/* أزرار الدعوة للعمل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 hover-elevate active-elevate-2"
              onClick={() => {
                console.log('Trial signup clicked');
                setIsDialogOpen(true);
              }}
            >
              <span>جرب النسخة التجريبية مجانًا</span>
              <ArrowLeft className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-4 hover-elevate active-elevate-2"
              onClick={() => {
                console.log('Demo video clicked');
                setIsVideoDialogOpen(true);
              }}
            >
              شاهد كيف يعمل
            </Button>
          </div>

          {/* عدّاد الإطلاق */}
          <div className="bg-card border rounded-2xl p-6 mb-8 max-w-lg mx-auto shadow-sm" data-testid="countdown-timer">
            {!timeLeft.isExpired ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">متبقي على الإطلاق</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary" data-testid="days-count">{timeLeft.days}</div>
                    <div className="text-xs text-muted-foreground">يوم</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary" data-testid="hours-count">{timeLeft.hours}</div>
                    <div className="text-xs text-muted-foreground">ساعة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary" data-testid="minutes-count">{timeLeft.minutes}</div>
                    <div className="text-xs text-muted-foreground">دقيقة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary" data-testid="seconds-count">{timeLeft.seconds}</div>
                    <div className="text-xs text-muted-foreground">ثانية</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="text-2xl mb-2">🚀</div>
                <h3 className="text-foreground font-bold text-lg mb-2">متاح الآن!</h3>
                <Button 
                  className="font-semibold px-6 py-2"
                  onClick={() => {
                    console.log('Launch app clicked');
                    setIsDialogOpen(true);
                  }}
                  data-testid="button-launch"
                >
                  جرب الآن
                </Button>
              </div>
            )}
          </div>

          {/* المميزات السريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">🎯</div>
              <span className="text-sm font-medium">ملخص دقيق</span>
            </div>
            
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">⚡</div>
              <span className="text-sm font-medium">سرعة فائقة</span>
            </div>
            
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">🤖</div>
              <span className="text-sm font-medium">ذكاء اصطناعي</span>
            </div>
            
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">📱</div>
              <span className="text-sm font-medium">سهل الاستخدام</span>
            </div>
          </div>
        </div>
      </div>

      {/* مؤشر التمرير */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

      {/* Dialog للنسخة التجريبية */}
      <ComingSoonDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
      
      {/* Dialog للفيديو التوضيحي */}
      <ComingSoonVideoDialog 
        open={isVideoDialogOpen} 
        onOpenChange={setIsVideoDialogOpen} 
      />
    </section>
  );
};

export default TalkheeselyHero;
