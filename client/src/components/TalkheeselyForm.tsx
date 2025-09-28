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

  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.VITE_MAILERLITE_API_KEY}`, // ✅ تصحيح الهيدر
      },
      body: JSON.stringify({
        email: formData.contactType === "email" ? formData.contact : undefined,
        fields: {
          name: formData.name,
          contact_type: formData.contactType,
        },
        groups: [import.meta.env.VITE_MAILERLITE_GROUP_ID], // ✅ التصحيح
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
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-6">
          <Card className="max-w-md mx-auto text-center shadow-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">شكراً لك!</h3>
              <p className="text-muted-foreground mb-6">
                تم تسجيلك بنجاح. سنتواصل معك خلال 24 ساعة لإرسال رابط النسخة التجريبية.
              </p>
              <div className="bg-primary/10 rounded-2xl p-4">
                <p className="text-primary font-medium text-sm">
                  💡 نصيحة: تأكد من فتح البريد الإلكتروني أو واتساب لاستلام الرابط
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
          {/* عنوان القسم */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              جرب <span className="text-primary">تلخيصلي</span> مجاناً
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              سجل الآن واحصل على النسخة التجريبية المجانية
            </p>
          </div>

          {/* النموذج */}
          <Card className="shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-foreground">تسجيل النسخة التجريبية</CardTitle>
              <CardDescription className="text-muted-foreground">
                املأ البيانات أدناه وسنرسل لك رابط النسخة التجريبية
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* الاسم */}
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

                {/* نوع التواصل */}
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

                {/* معلومات التواصل */}
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-right">
                    {formData.contactType === "email" ? "البريد الإلكتروني" : "رقم واتساب"}
                  </Label>
                  <Input
                    id="contact"
                    type={formData.contactType === "email" ? "email" : "tel"}
                    placeholder={
                      formData.contactType === "email" 
                        ? "example@email.com" 
                        : "+966 50 123 4567"
                    }
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    className="text-right"
                    required
                    data-testid="input-contact-form"
                  />
                </div>

                {/* السؤال */}
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

                {/* زر الإرسال */}
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

          {/* معلومة إضافية */}
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
