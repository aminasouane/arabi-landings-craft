import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Mail, User, Phone, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ThankYouDialog from "@/components/ThankYouDialog";

const TalkheeselyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    contactType: "email",
    interested: "yes"
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
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
    // Use relative URL for Serverless Function
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.contactType === "email" ? formData.contact : undefined,
        phone: formData.contactType === "whatsapp" ? formData.contact : undefined,
        contactType: formData.contactType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("API Error:", data);
      throw new Error(data.message || "فشل إرسال البيانات");
    }

    setIsSubmitted(true);
    setShowThankYouDialog(true);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "تعذر إرسال البيانات، حاول مرة أخرى لاحقاً";
    
    // Special handling for duplicate email
    if (errorMessage.includes("مسجل بالفعل")) {
      toast({
        title: "البريد الإلكتروني مسجل بالفعل",
        description: "هذا البريد الإلكتروني موجود بالفعل في قائمة الانتظار",
        variant: "default",
      });
    } else {
      toast({
        title: "حدث خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
                تم تسجيلك بنجاح. يمكنك الآن استخدام التطبيق.
              </p>
              <Button
                className="w-full py-3 font-semibold text-lg"
                onClick={() => window.location.href = "https://app.telkhiseli.info/"}
              >
                <span>افتح التطبيق الآن</span>
                <ArrowLeft className="mr-3 h-5 w-5" />
              </Button>
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
          </div>

          {/* النموذج */}
          <Card className="shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-foreground">سجل الآن في التطبيق</CardTitle>
              <CardDescription className="text-muted-foreground">
                املأ البيانات أدناه للدخول للتطبيق
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
                  type="button" 
                  className="w-full py-3 font-semibold text-lg hover-elevate active-elevate-2"
                  onClick={() => window.location.href = "https://app.telkhiseli.info/"}
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

// Add the ThankYouDialog component with proper state management
const TalkheeselyFormWithDialog = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    contactType: "email",
    interested: "yes"
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);
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
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.contactType === "email" ? formData.contact : undefined,
        phone: formData.contactType === "whatsapp" ? formData.contact : undefined,
        contactType: formData.contactType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("API Error:", data);
      throw new Error(data.message || "فشل إرسال البيانات");
    }

    setIsSubmitted(true);
    setShowThankYouDialog(true);
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "تعذر إرسال البيانات، حاول مرة أخرى لاحقاً";
    
    // Special handling for duplicate email
    if (errorMessage.includes("مسجل بالفعل")) {
      toast({
        title: "البريد الإلكتروني مسجل بالفعل",
        description: "هذا البريد الإلكتروني موجود بالفعل في قائمة الانتظار",
        variant: "default",
      });
    } else {
      toast({
        title: "حدث خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }
};

  const handleInputChange = (field: string, value: string) => {
    console.log(`Form field changed: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThankYouClose = () => {
    setShowThankYouDialog(false);
    // Reset form after closing dialog
    setFormData({
      name: "",
      contact: "",
      contactType: "email",
      interested: "yes"
    });
    setIsSubmitted(false);
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
                تم تسجيلك بنجاح. يمكنك الآن استخدام التطبيق.
              </p>
              <Button
                className="w-full py-3 font-semibold text-lg"
                onClick={() => window.location.href = "https://app.telkhiseli.info/"}
              >
                <span>افتح التطبيق الآن</span>
                <ArrowLeft className="mr-3 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
        <ThankYouDialog
          open={showThankYouDialog}
          onOpenChange={handleThankYouClose}
        />
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-6">
        <div className="max-w-lg mx-auto">
          {/* عنوان القسم */}
          <div className="text-center mb-8">
          </div>

          {/* النموذج */}
          <Card className="shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-foreground">سجل الآن في التطبيق</CardTitle>
              <CardDescription className="text-muted-foreground">
                املأ البيانات أدناه للدخول للتطبيق
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
                  type="button"
                  className="w-full py-3 font-semibold text-lg hover-elevate active-elevate-2"
                  onClick={() => window.location.href = "https://app.telkhiseli.info/"}
                  data-testid="button-register-trial"
                >
                  <span>ابدأ الآن</span>
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
      <ThankYouDialog
        open={showThankYouDialog}
        onOpenChange={handleThankYouClose}
      />
    </section>
  );
};

export default TalkheeselyFormWithDialog;
