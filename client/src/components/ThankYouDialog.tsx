import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Heart } from "lucide-react";

interface ThankYouDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ThankYouDialog = ({ open, onOpenChange }: ThankYouDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center border-0 shadow-2xl bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex flex-col items-center gap-6 py-8">
          {/* أيقونة النجاح المتحركة */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" />
            </div>
          </div>

          {/* رسالة الشكر */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              شكراً لك! 🎉
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              لقد تم تسجيلك بنجاح في قائمة الانتظار
            </p>
            <p className="text-sm text-muted-foreground">
              سنرسل لك رابط النسخة التجريبية فور إطلاقها
            </p>
          </div>

          {/* معلومات إضافية */}
          <div className="bg-card/50 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">
                أنت الآن من أوائل من سيجرب تلخيصلي
              </span>
            </div>
          </div>

          {/* زر الإغلاق */}
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            رائع!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThankYouDialog;
