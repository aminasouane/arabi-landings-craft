  import { Resend } from 'resend';

  export default async function handler(req: any, res: any) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: 'رمز التأكيد مطلوب' });
      }
      
      // Decode token to get email and timestamp
      let decodedToken;
      try {
        decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      } catch (error) {
        return res.status(400).json({ message: 'رمز التأكيد غير صالح' });
      }
      
      const [email, timestamp] = decodedToken.split(':');
      
      if (!email || !timestamp) {
        return res.status(400).json({ message: 'رمز التأكيد غير صالح' });
      }
      
      // Check if token is expired (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (tokenAge > maxAge) {
        return res.status(400).json({ message: 'انتهت صلاحية رابط التأكيد' });
      }
      
      // Update subscriber status in MailerLite to confirmed
      try {
        // First, find the subscriber by email
        const searchResponse = await fetch(`https://connect.mailerlite.com/api/subscribers?search=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        });
        
        if (!searchResponse.ok) {
          throw new Error('Failed to search for subscriber');
        }
        
        const searchData = await searchResponse.json();
        
        if (!searchData.data || searchData.data.length === 0) {
          return res.status(404).json({ message: 'المشترك غير موجود' });
        }
        
        const subscriber = searchData.data.find((s: any) => s.email === email);
        
        if (!subscriber) {
          return res.status(404).json({ message: 'المشترك غير موجود' });
        }
        
        // Update subscriber status
        const updateResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${subscriber.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
          body: JSON.stringify({
            email: email,
            fields: {
              ...subscriber.fields,
              email_confirmed: "true",
              confirmation_date: new Date().toISOString().split('T')[0]
            },
            groups: subscriber.groups || [process.env.MAILERLITE_GROUP_ID],
          }),
        });
        
        if (!updateResponse.ok) {
          throw new Error('Failed to update subscriber');
        }
        
        // Send welcome email after confirmation
        if (process.env.RESEND_API_KEY) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            
            const { data, error } = await resend.emails.send({
              from: 'تلخيصلي <noreply@telkhiseli.info>',
              to: [email],
              subject: 'تم تأكيد بريدك الإلكتروني - مرحباً بك في تلخيصلي!',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; direction: rtl; text-align: right;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #4F46E5; margin-bottom: 10px;">تم تأكيد بريدك الإلكتروني!</h1>
                    <p style="font-size: 18px; color: #666;">مرحباً بك في مجتمع تلخيصلي</p>
                  </div>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h2 style="color: #4F46E5; margin-bottom: 15px;">شكراً لتأكيد تسجيلك!</h2>
                    <p>نحن سعداء بانضمامك إلى مجتمع تلخيصلي. الآن ستتلقى جميع التحديثات حول إطلاق تطبيقنا.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <div style="background-color: #4F46E5; color: white; padding: 15px; border-radius: 5px; display: inline-block;">
                        <span style="font-size: 18px; font-weight: bold;">🎉 أنت الآن عضو مؤكد!</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h2 style="color: #4F46E5; margin-bottom: 15px;">ماذا بعد ذلك؟</h2>
                    <p>مع تلخيصلي ستحصل على:</p>
                    
                    <ul style="line-height: 1.8; margin-top: 15px; padding-right: 20px;">
                      <li style="margin-bottom: 8px;">✅ إشعارات فورية عند إطلاق التطبيق</li>
                      <li style="margin-bottom: 8px;">✅ دعوة حصرية لتجربة النسخة التجريبية الأولى</li>
                      <li style="margin-bottom: 8px;">✅ نصائح وحيل لاستخدام التطبيق بفعالية</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <p style="font-size: 16px; margin-bottom: 10px;">تابع بريدك الإلكتروني لتصلك آخر التحديثات</p>
                  </div>
                  
                  <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                    <p style="font-size: 14px; color: #666;">إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.</p>
                    <p style="font-size: 14px; color: #666;">© 2025 تلخيصلي. جميع الحقوق محفوظة.</p>
                  </div>
                </div>
              `
            });
            
            if (error) {
              console.error("Failed to send welcome email:", error);
            } else {
              console.log("Welcome email sent successfully:", data);
            }
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // Don't fail the request if email sending fails
          }
        }
        
        res.json({ success: true, message: 'تم تأكيد بريدك الإلكتروني بنجاح' });
      } catch (error) {
        console.error("Error confirming email:", error);
        res.status(500).json({ message: 'حدث خطأ أثناء تأكيد البريد الإلكتروني' });
      }
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
  }
