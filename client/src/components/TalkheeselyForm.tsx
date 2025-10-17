import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Mail, User, Phone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TalkheeselyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    contactType: "email",
    interested: "yes"
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // فحص ما إذا كان الإيميل مسجل مسبقاً
    if (formData.contactType === "email") {
      try {
        const checkRes = await fetch(`https://connect.mailerlite.com/api/subscribers?email=${encodeURIComponent(formData.contact)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_MAILERLITE_API_KEY}`,
          },
        });

        if (checkRes.ok) {
          const data = await checkRes.json();
          if (data.data && data.data.length > 0) {
            toast({
              title: "الإيميل مسجل مسبقاً",
              description: "هذا الإيميل مسجل بالفعل في قائمتنا. سنتواصل معك قريباً!",
              variant: "destructive",
            });
            return;
          }
        }
      } catch (error) {
        console.error("Error checking existing email:", error);
        // نستمر في التسجيل حتى لو فشل الفحص
      }
    }

    try {
      const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email: formData.contactType === "email" ? formData.contact : undefined,
          fields: {
            name: formData.name,
            contact_type: formData.contactType,
          },
          groups: [import.meta.env.VITE_MAILERLITE_GROUP_ID],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error("فشل إرسال البيانات");
      }

      setIsSubmitted(true);
      toast({
        title: "تم التسجيل بنجاح! 🎉",
        description: "سنتواصل معك قريباً لإرسال رابط النسخة التجريبية",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "حدث خطأ",
        description: "تعذر إرسال البيانات، حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Form field changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-6">
          <Card className="max-w-lg mx-auto text-center shadow-xl border-0 bg-card/80 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 animate-pulse"></div>
            <div className="absolute top-4 right-4 text-2xl animate-bounce delay-300">🎉</div>
            <div className="absolute top-4 left-4 text-2xl animate-bounce delay-500">✨</div>
            <div className="absolute bottom-4 right-4 text-xl animate-bounce delay-700">🌟</div>
            <div className="absolute bottom-4 left-4 text-xl animate-bounce delay-1000">💫</div>

            <CardContent className="p-10 relative z-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                  <CheckCircle className="w-12 h-12 text-white drop-shadow-md" />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-primary/30 rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-accent/20 rounded-full animate-ping delay-300"></div>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-4 animate-fade-in">
                🎊 مرحباً بك في عائلة تلخيصلي! 🎊
              </h3>

              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 mb-6 border border-primary/10">
                <p className="text-lg text-foreground mb-3 leading-relaxed">
                  <span className="font-semibold text-primary">شكراً لك</span> على انضمامك إلينا في هذه الرحلة التعليمية المثيرة!
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  نحن متحمسون جداً لوجودك معنا ونتطلع لمساعدتك في رحلتك التعليمية مع تلخيصلي 📚✨
                </p>
              </div>

              <div className="bg-card/50 rounded-xl p-4 mb-6 border border-primary/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">سيتم إرسال الرابط خلال 24 ساعة</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  سنتواصل معك عبر البريد الإلكتروني أو واتساب لإرسال رابط النسخة التجريبية المجانية
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-0.5">💡</div>
                  <div className="text-right">
                    <p className="text-blue-700 dark:text-blue-300 font-medium text-sm mb-1">
                      نصيحة مهمة
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      تأكد من فتح البريد الإلكتروني أو تطبيق واتساب لاستلام الرابط بسرعة
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  شارك الخبر السار مع أصدقائك أيضاً! 🌟
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              جرب <span className="text-primary">تلخيصلي</span> مجاناً
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              سجل الآن واحصل على النسخة التجريبية المجانية
            </p>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-foreground">تسجيل النسخة التجريبية</CardTitle>
              <CardDescription className="text-muted-foreground">
                املأ البيانات أدناه وسنرسل لك رابط النسخة التجريبية
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-right flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    الاسم الكامل
                  </Label>
                  <Input
                    id="name"
                    placeholder="اكتب اسمك الكامل"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-right"
                    required
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-right">طريقة التواصل المفضلة</Label>
                  <RadioGroup
                    value={formData.contactType}
                    onValueChange={(value) => handleInputChange("contactType", value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="email" id="email" data-testid="radio-contact-email" />
                      <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                        <Mail className="w-4 h-4 text-primary" />
                        البريد الإلكتروني
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="whatsapp" id="whatsapp" data-testid="radio-contact-whatsapp" />
                      <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                        <Phone className="w-4 h-4 text-primary" />
                        واتساب
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-right">
                    {formData.contactType === "email" ? "البريد الإلكتروني" : "رقم واتساب"}
                  </Label>
                  <Input
                    id="contact"
                    type={formData.contactType === "email" ? "email" : "tel"}
                    placeholder={formData.contactType === "email" ? "example@email.com" : "+966 50 123 4567"}
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    className="text-right"
                    required
                    data-testid="input-contact-form"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-right">هل ترغب بتجربة النسخة التجريبية؟</Label>
                  <RadioGroup
                    value={formData.interested}
                    onValueChange={(value) => handleInputChange("interested", value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="yes" id="yes" data-testid="radio-interested-yes" />
                      <Label htmlFor="yes" className="cursor-pointer">نعم، متحمس للتجربة! 🚀</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="maybe" id="maybe" data-testid="radio-interested-maybe" />
                      <Label htmlFor="maybe" className="cursor-pointer">ربما لاحقاً</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-3 font-semibold text-lg hover-elevate active-elevate-2"
                  data-testid="button-register-trial"
                >
                  <span>سجل في النسخة التجريبية</span>
                  <ArrowLeft className="mr-3 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              🔒 بياناتك محمية ولن نشاركها مع أطراف خارجية
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalkheeselyForm;
