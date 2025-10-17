import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, BookOpen } from "lucide-react";
import ComingSoonDialog from "./ComingSoonDialog";

const TalkheeselyFooter = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStartClick = () => {
    console.log('Start now clicked in footer');
    setIsDialogOpen(true);
  };

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* عناصر خلفية مزخرفة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* دعوة أخيرة للتسجيل */}
        <div className="py-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              لا تضيع وقتك في المحاضرات الطويلة
            </h3>
            <p className="text-background/80 mb-6 text-lg leading-relaxed">
              انضم لآلاف الطلبة الذين وفروا وقتهم ورفعوا درجاتهم مع تلخيصلي
            </p>
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl font-semibold text-lg hover-elevate active-elevate-2 group"
              onClick={handleStartClick}
              data-testid="button-start-footer"
            >
              <span>ابدأ الآن مجاناً</span>
              <ArrowLeft className="mr-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* محتوى التذييل الرئيسي */}
        <div className="py-8 text-center">
          <div className="mb-6">
            <h4 className="text-xl font-bold mb-2 text-primary">تلخيصلي</h4>
            <p className="text-background/80 max-w-md mx-auto leading-relaxed">
              تطبيق ذكي يساعد الطلبة على تلخيص المحاضرات وتحسين نتائجهم الأكاديمية
            </p>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-students">+500</div>
              <div className="text-sm text-background/70">طالب مسجل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-lectures">+1000</div>
              <div className="text-sm text-background/70">محاضرة ملخصة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-satisfaction">95%</div>
              <div className="text-sm text-background/70">معدل الرضا</div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* التذييل السفلي */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-background/70 text-sm">
          <div className="flex items-center gap-2">
            <span>© 2025 تلخيصلي • جميع الحقوق محفوظة</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>صُنع بـ</span>
            <Heart className="h-4 w-4 text-primary fill-current" />
            <span>للطلبة العرب</span>
          </div>
        </div>
      </div>

      {/* نافذة التسجيل */}
      <ComingSoonDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </footer>
  );
};

export default TalkheeselyFooter;
