import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const { name, email, phone, contactType } = req.body;
    
    // Validate required fields
    if (!name || !contactType) {
      return res.status(400).json({ message: "الاسم وطريقة التواصل مطلوبان" });
    }
    
    if (contactType === "email" && !email) {
      return res.status(400).json({ message: "البريد الإلكتروني مطلوب" });
    }
    
    if (contactType === "whatsapp" && !phone) {
      return res.status(400).json({ message: "رقم واتساب مطلوب" });
    }
    
    // Check if email already exists in MailerLite
    if (contactType === "email" && email) {
      try {
        console.log("Checking if email exists:", email);
        const checkResponse = await fetch(`https://connect.mailerlite.com/api/subscribers?search=${encodeURIComponent(email)}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
          },
        });

        console.log("Check response status:", checkResponse.status);
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          console.log("Check response data:", checkData);
          
          // Check if subscriber exists and is in our group
          if (checkData.data && Array.isArray(checkData.data)) {
            const existingSubscriber = checkData.data.find((subscriber: any) => 
              subscriber.email === email
            );

            if (existingSubscriber) {
              console.log("Found existing subscriber:", existingSubscriber);
              
              // Get subscriber details with groups
              try {
                const subscriberDetailsResponse = await fetch(`https://connect.mailerlite.com/api/subscribers/${existingSubscriber.id}`, {
                  method: "GET",
                  headers: {
                    "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
                  },
                });

                if (subscriberDetailsResponse.ok) {
                  const subscriberDetails = await subscriberDetailsResponse.json();
                  console.log("Subscriber details:", subscriberDetails);
                  
                  // Check if subscriber is already in our group
                  const isInOurGroup = subscriberDetails.data.groups?.some((group: any) => 
                    group.id.toString() === process.env.MAILERLITE_GROUP_ID
                  );
                  
                  console.log("Is in our group:", isInOurGroup, "Group ID:", process.env.MAILERLITE_GROUP_ID);
                  
                  if (isInOurGroup) {
                    console.log("Email already exists in our group");
                    return res.status(409).json({ 
                      message: "هذا البريد الإلكتروني مسجل بالفعل في قائمة الانتظار" 
                    });
                  }
                }
              } catch (detailsError) {
                console.error("Error getting subscriber details:", detailsError);
                // Continue with registration even if details check fails
              }
            }
          }
        } else {
          const errorText = await checkResponse.text();
          console.error("Check API error:", errorText);
        }
      } catch (checkError) {
        console.error("Error checking existing subscriber:", checkError);
        // Continue with registration even if check fails
      }
    }
    
    // Log subscription data
    console.log("Subscription data:", { name, email, phone, contactType });
    
    // Send to MailerLite
    try {
      const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.MAILERLITE_API_KEY}`,
        },
        body: JSON.stringify({
          email: contactType === "email" ? email : undefined,
          fields: {
            name: name,
            contact_type: contactType,
            phone: contactType === "whatsapp" ? phone : undefined,
          },
          groups: [process.env.MAILERLITE_GROUP_ID],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("MailerLite API Error:", errorData);
        
        // Check if it's a duplicate subscriber error
        if (errorData.includes("already") || errorData.includes("duplicate") || response.status === 409) {
          return res.status(409).json({
            message: "هذا البريد الإلكتروني مسجل بالفعل في قائمة الانتظار"
          });
        }
        
        return res.status(400).json({ message: "فشل إرسال البيانات إلى MailerLite" });
      }
      
      // Register contact in Resend audience and send confirmation email (only for email contacts)
      if (contactType === "email" && email && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // First, add contact to Resend audience
          const audienceResponse = await resend.contacts.create({
            email: email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            unsubscribed: false,
            audienceId: process.env.RESEND_AUDIENCE_ID || 'default'
          });
          
          console.log("Contact added to Resend audience:", audienceResponse);
          
          // Generate confirmation token
          const confirmationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://telkhiseli.info';
          const confirmationUrl = `${siteUrl}/confirm-email?token=${confirmationToken}`;
          
          // Send confirmation email
          const { data, error } = await resend.emails.send({
            from: 'تلخيصلي <noreply@telkhiseli.info>',
            to: [email],
            subject: 'يرجى تأكيد بريدك الإلكتروني - تلخيصلي',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; direction: rtl; text-align: right;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #4F46E5; margin-bottom: 10px;">شكراً لتسجيلك في تلخيصلي!</h1>
                  <p style="font-size: 18px; color: #666;">يرجى تأكيد بريدك الإلكتروني لإكمال التسجيل</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                  <h2 style="color: #4F46E5; margin-bottom: 15px;">مرحباً ${name}!</h2>
                  <p>شكراً لك على اهتمامك بتطبيق تلخيصلي. لتأكيد تسجيلك، يرجى النقر على الزر أدناه:</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      تأكيد البريد الإلكتروني
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666;">إذا لم يعمل الزر، انسخ والصق الرابط التالي في متصفحك:</p>
                  <p style="font-size: 12px; color: #4F46E5; word-break: break-all;">${confirmationUrl}</p>
                </div>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                  <h2 style="color: #4F46E5; margin-bottom: 15px;">ما هو تلخيصلي؟</h2>
                  <p>تطبيقنا يساعدك على تلخيص المحاضرات الحية بسرعة وذكاء. مع تلخيصلي ستحصل على:</p>
                  
                  <ul style="line-height: 1.8; margin-top: 15px; padding-right: 20px;">
                    <li style="margin-bottom: 8px;">✅ تلخيص دروسك وملاحظاتك في دقائق</li>
                    <li style="margin-bottom: 8px;">✅ تجربة مجانية لتجربة جميع الميزات قبل الاشتراك</li>
                    <li style="margin-bottom: 8px;">✅ قريبا ستصلك دعوة خاصة لتجربة النسخة المجانية الأولى</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                  <p style="font-size: 16px; margin-bottom: 10px;">بعد تأكيد بريدك، سنرسل لك آخر التحديثات حول الإطلاق الرسمي</p>
                  <div style="background-color: #4F46E5; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                    <span>🚀 قريباً!</span>
                  </div>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                  <p style="font-size: 14px; color: #666;">أنت تتلقى هذا البريد لأنك سجلت في تلخيصلي.</p>
                  <p style="font-size: 14px; color: #666;">إذا لم تكن أنت من قام بالتسجيل، يرجى تجاهل هذا البريد.</p>
                  <p style="font-size: 14px; color: #666;">© 2025 تلخيصلي. جميع الحقوق محفوظة.</p>
                </div>
              </div>
            `
          });
          
          if (error) {
            console.error("Resend Email API Error:", error);
          } else {
            console.log("Confirmation email sent successfully via Resend:", data);
          }
        } catch (resendError) {
          console.error("Failed to register contact or send confirmation email via Resend:", resendError);
          // لا تعيد خطأ، فالتسجيل في MailerLite تم بنجاح
        }
      }
    } catch (mailerLiteError) {
      console.error("MailerLite API failed:", mailerLiteError);
      return res.status(500).json({ message: "حدث خطأ في الاتصال بخدمة MailerLite" });
    }

    res.json({ success: true, message: "تم التسجيل بنجاح. يرجى تأكيد بريدك الإلكتروني." });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
}
