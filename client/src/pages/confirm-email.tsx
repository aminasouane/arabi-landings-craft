import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ConfirmEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  // Extract token from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('رابط التأكيد غير صالح');
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch('/api/confirm-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('تم تأكيد بريدك الإلكتروني بنجاح! شكراً لتسجيلك في تلخيصلي.');
        } else {
          setStatus('error');
          setMessage(data.message || 'فشل تأكيد البريد الإلكتروني');
        }
      } catch (error) {
        setStatus('error');
        setMessage('حدث خطأ أثناء تأكيد البريد الإلكتروني');
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              {status === 'loading' && <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
              {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {status === 'error' && <AlertCircle className="h-8 w-8 text-red-600" />}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === 'loading' && 'جاري تأكيد البريد الإلكتروني...'}
              {status === 'success' && 'تم تأكيد البريد الإلكتروني!'}
              {status === 'error' && 'فشل التأكيد'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 mb-2">ماذا بعد ذلك؟</h3>
                  <p className="text-sm text-green-700">
                    سنرسل لك آخر التحديثات حول إطلاق تطبيق تلخيصلي. تابع بريدك الإلكتروني للحصول على أحدث الأخبار!
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  العودة إلى الصفحة الرئيسية
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-red-800 mb-2">ماذا يمكنني فعله؟</h3>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>تأكد من أن رابط التأكيد صحيح وكامل</li>
                    <li>تحقق من أن الرابط لم ينتهِ صلاحيته</li>
                    <li>اطلب رابط تأكيد جديد</li>
                  </ul>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="flex-1"
                  >
                    العودة إلى الصفحة الرئيسية
                  </Button>
                  <Button 
                    onClick={() => window.location.href = 'mailto:support@telkhiseli.info'}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    تواصل مع الدعم
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}