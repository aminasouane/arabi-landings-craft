import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BookOpen, Clock, Users, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ThankYouDialog from "@/components/ThankYouDialog";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComingSoonDialog = ({ open, onOpenChange }: ComingSoonDialogProps) => {
  const [contactType, setContactType] = useState("email");
  const [contactValue, setContactValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
  const { toast } = useToast();

  // عدّاد زمني للإطلاق في 30 أكتوبر 2025
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    const launchDate = new Date('2025-10-30T00:00:00');
    const now = new Date().getTime();
    const difference = launchDate.getTime() - now;
    
    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      
      return { days, hours, minutes, isExpired: false };
    }
    
    return { days: 0, hours: 0, minutes: 0, isExpired: true };
  }

  // تحديث العدّاد كل دقيقة
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactValue.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال بيانات التواصل",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use relative URL for Serverless Function
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "مستخدم مهتم", // اسم افتراضي
          email: contactType === "email" ? contactValue : undefined,
          phone: contactType === "whatsapp" ? contactValue : undefined,
          contactType: contactType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API Error:", data);
        throw new Error(data.message || "فشل إرسال البيانات");
      }

      setIsLoading(false);
      
      // عرض نافذة الشكر بدلاً من toast
      setIsSubmitted(true);
      setShowThankYouDialog(true);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast({
        title: "حدث خطأ",
        description: error instanceof Error ? error.message : "تعذر إرسال البيانات، حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    }
  };

  const handleThankYouClose = () => {
    setShowThankYouDialog(false);
    // Reset form after closing dialog
    setContactValue("");
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              ✅ شكراً لك!
            </h3>
            <p className="text-muted-foreground">
              سنخبرك فور إطلاق النسخة التجريبية
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Users className="w-4 h-4" />
              <span>انضممت لقائمة الانتظار</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <span>🚀</span>
              النسخة التجريبية قادمة قريبًا!
            </DialogTitle>
            <DialogDescription className="sr-only">
              نموذج التسجيل للحصول على إشعار عند إطلاق النسخة التجريبية من تطبيق تلخيصلي
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* العدّاد الزمني */}
            <div className="bg-muted rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">متبقي على الإطلاق</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary" data-testid="dialog-days">{timeLeft.days}</div>
                  <div className="text-xs text-muted-foreground">يوم</div>
                </div>
                <div className="bg-background rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary" data-testid="dialog-hours">{timeLeft.hours}</div>
                  <div className="text-xs text-muted-foreground">ساعة</div>
                </div>
                <div className="bg-background rounded-xl p-3">
                  <div className="text-2xl font-bold text-primary" data-testid="dialog-minutes">{timeLeft.minutes}</div>
                  <div className="text-xs text-muted-foreground">دقيقة</div>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                نحن نعمل حاليًا على إطلاق تطبيق تلخيصلي.
              </p>
              <p className="text-sm text-primary font-medium">
                سجّل بياناتك لتكون من أوائل من يجرب النسخة التجريبية.
              </p>
            </div>

            {/* أيقونة الطالب */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>

            {/* نموذج التسجيل */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">طريقة التواصل المفضلة</Label>
                <RadioGroup value={contactType} onValueChange={setContactType} className="flex gap-6">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="email" id="email" data-testid="radio-email" />
                    <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="whatsapp" id="whatsapp" data-testid="radio-whatsapp" />
                    <Label htmlFor="whatsapp" className="text-sm">رقم واتساب</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-medium">
                  {contactType === "email" ? "البريد الإلكتروني" : "رقم واتساب"}
                </Label>
                <Input
                  id="contact"
                  type={contactType === "email" ? "email" : "tel"}
                  placeholder={contactType === "email" ? "example@email.com" : "+966 5X XXX XXXX"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="text-right"
                  dir="ltr"
                  data-testid="input-contact"
                />
              </div>

              <Button
                type="submit"
                className="w-full hover-elevate active-elevate-2"
                size="lg"
                disabled={isLoading}
                data-testid="button-submit"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>جارٍ التسجيل...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>سجّل اهتمامك</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              سنحافظ على خصوصية بياناتك ولن نرسل إلا التحديثات المهمة
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ThankYouDialog
        open={showThankYouDialog}
        onOpenChange={handleThankYouClose}
      />
    </>
  );
};

export default ComingSoonDialog;
