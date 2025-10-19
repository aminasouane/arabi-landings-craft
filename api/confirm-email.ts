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

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Handle both GET (from URL) and POST (from body) requests
    let token;
    
    if (req.method === 'GET') {
      // Get token from URL query parameters
      token = req.query.token;
    } else {
      // Get token from request body
      token = req.body.token;
    }
    
    console.log("Confirm email request method:", req.method);
    console.log("Token received:", token ? "Yes" : "No");
    
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
    
    // Update contact status in Resend to confirmed
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('Resend API key not configured');
      }
      
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Update contact status to subscribed (confirmed)
      const updateOptions: any = {
        audienceId: process.env.RESEND_AUDIENCE_ID,
        email: email,
        unsubscribed: false // Confirm the subscription
      };
      
      const updateResponse = await resend.contacts.update(updateOptions);
      
      console.log("Contact updated in Resend:", updateResponse);
      
      // Also update in MailerLite for backup (but don't rely on it)
      try {
        const searchResponse = await fetch(`https://connect.mailerlite.com/api/subscribers?search=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.data && searchData.data.length > 0) {
            const subscriber = searchData.data.find((s: any) => s.email === email);
            
            if (subscriber) {
              // Update subscriber status in MailerLite
              const updateMailerLiteResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${subscriber.id}`, {
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
                    confirmation_date: new Date().toISOString().split('T')[0],
                    confirmed_via: "resend"
                  },
                  groups: subscriber.groups || [process.env.MAILERLITE_GROUP_ID],
                }),
              });
              
              if (updateMailerLiteResponse.ok) {
                console.log("Contact also updated in MailerLite");
              } else {
                console.log("Failed to update contact in MailerLite, but Resend update succeeded");
              }
            }
          }
        }
      } catch (mailerLiteError) {
        console.log("Failed to update MailerLite, but Resend update succeeded:", mailerLiteError);
        // Don't fail the request if MailerLite update fails
      }
      
      // Send welcome email after confirmation
      if (process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // Get subscriber name from email if not available
          const firstName = email.split('@')[0];
          
          const { data, error } = await resend.emails.send({
            from: 'تلخيصلي <noreply@telkhiseli.info>',
            to: [email],
            reply_to: 'support@telkhiseli.info',
            subject: 'مرحباً بك في تلخيصلي! تم تأكيد اشتراكك',
            html: `
              <!DOCTYPE html>
              <html lang="ar" dir="rtl">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>مرحباً بك في تلخيصلي!</title>
              </head>
              <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f7fa; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <div style="background-color: #4F46E5; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">تلخيصلي</h1>
                    <p style="color: #e0e7ff; margin: 10px 0 0; font-size: 16px;">أداة تلخيص المحاضرات الذكية</p>
                  </div>
                  
                  <!-- Main Content -->
                  <div style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="width: 80px; height: 80px; background-color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <h2 style="color: #333; margin-bottom: 15px; font-size: 24px;">تم تأكيد اشتراكك بنجاح!</h2>
                      <p style="color: #666; font-size: 16px; line-height: 1.5;">مرحباً بك في مجتمع تلخيصلي، ${firstName}!</p>
                    </div>
                    
                    <!-- Success Message -->
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
                      <p style="margin: 0; color: #166534; font-size: 16px; line-height: 1.5;">
                        <strong>🎉 تهانينا!</strong> أنت الآن عضو مؤكد في تلخيصلي. ستكون من أوائل من يحصل على دعوة لتجربة النسخة التجريبية.
                      </p>
                    </div>
                    
                    <!-- What's Next -->
                    <div style="background-color: #f8f9ff; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                      <h3 style="color: #4F46E5; margin-top: 0; margin-bottom: 20px; font-size: 20px; text-align: center;">ماذا بعد ذلك؟</h3>
                      <ul style="padding-right: 20px; margin: 0; line-height: 1.8;">
                        <li style="margin-bottom: 12px; color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> إشعار فوري عند إطلاق النسخة التجريبية</li>
                        <li style="margin-bottom: 12px; color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> دعوة حصرية لتجربة جميع الميزات</li>
                        <li style="margin-bottom: 12px; color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> نصائح وحيل للاستفادة القصوى من التطبيق</li>
                        <li style="color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> وصول مبكر للميزات الجديدة</li>
                      </ul>
                    </div>
                    
                    <!-- Social Proof -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <p style="color: #666; font-size: 16px; margin-bottom: 15px;">انضم إلى <strong>أكثر من 1000 طالب</strong> ينتظرون إطلاق تلخيصلي</p>
                      <div style="display: flex; justify-content: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background-color: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div style="width: 40px; height: 40px; background-color: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div style="width: 40px; height: 40px; background-color: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div style="width: 40px; height: 40px; background-color: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: bold; font-size: 12px;">+997</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">هل لديك أي أسئلة؟ <a href="mailto:support@telkhiseli.info" style="color: #4F46E5; text-decoration: none; font-weight: 500;">تواصل معنا</a></p>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">© 2025 تلخيصلي. جميع الحقوق محفوظة.</p>
                    <div style="margin-top: 15px;">
                      <a href="https://telkhiseli.info" style="color: #4F46E5; text-decoration: none; font-weight: 500;">زيارة موقعنا</a>
                      <span style="margin: 0 10px; color: #6c757d;">|</span>
                      <a href="https://twitter.com/telkhiseli" style="color: #4F46E5; text-decoration: none; font-weight: 500;">تابعنا على تويتر</a>
                    </div>
                  </div>
                </div>
              </body>
              </html>
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
      
      // Return different response based on request method
      if (req.method === 'GET') {
        // For GET requests (from email link), return JSON with success message
        res.json({ success: true, message: 'تم تأكيد بريدك الإلكتروني بنجاح' });
      } else {
        // For POST requests, return JSON with success message
        res.json({ success: true, message: 'تم تأكيد بريدك الإلكتروني بنجاح' });
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      res.status(500).json({ message: 'حدث خطأ أثناء تأكيد البريد الإلكتروني' });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
}
