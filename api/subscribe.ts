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
          status: "active", // هذا يمنع إرسال بريد التأكيد
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
      
      // Register contact in Resend and send confirmation email (only for email contacts)
      if (contactType === "email" && email && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          
          // First, check if contact already exists in Resend
          let existingContact = null;
          if (process.env.RESEND_AUDIENCE_ID) {
            try {
              // Use any type to bypass TypeScript issues with Resend API
              const getOptions: any = {
                audienceId: process.env.RESEND_AUDIENCE_ID,
                email: email
              };
              
              existingContact = await resend.contacts.get(getOptions);
              console.log("Existing contact found in Resend:", existingContact);
            } catch (getError) {
              // Contact doesn't exist, continue with creation
              console.log("Contact not found in Resend, will create new one");
            }
          }
          
          // If contact exists and is already subscribed, return error
          if (existingContact && existingContact.data && existingContact.data.unsubscribed === false) {
            return res.status(409).json({
              message: "هذا البريد الإلكتروني مسجل ومؤكد بالفعل"
            });
          }
          
          // Create contact in Resend (general contacts, not in specific audience yet)
          // Using any type to bypass TypeScript issues with Resend API
          const contactOptions: any = {
            audienceId: process.env.RESEND_AUDIENCE_ID,
            email: email,
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' '),
            unsubscribed: true // Start as unsubscribed until confirmed
          };
          
          const contactResponse = await resend.contacts.create(contactOptions);
          console.log("Contact created in Resend:", contactResponse);
          
          // Generate confirmation token
          const confirmationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.telkhiseli.info';
          const confirmationUrl = `${siteUrl}/confirm-email?token=${confirmationToken}`;
          
          // Send confirmation email
          console.log("Sending confirmation email to:", email);
          console.log("Using RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Set" : "Not set");
          
          const { data, error } = await resend.emails.send({
            from: 'تلخيصلي <noreply@telkhiseli.info>',
            to: [email],
            reply_to: 'support@telkhiseli.info',
            subject: 'تأكيد اشتراكك في تلخيصلي',
            html: `
              <!DOCTYPE html>
              <html lang="ar" dir="rtl">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>تأكيد اشتراكك في تلخيصلي</title>
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
                      <h2 style="color: #333; margin-bottom: 15px; font-size: 24px;">شكراً لتسجيلك، ${name.split(' ')[0]}!</h2>
                      <p style="color: #666; font-size: 16px; line-height: 1.5;">يرجى تأكيد بريدك الإلكتروني لتفعيل اشتراكك والحصول على آخر التحديثات</p>
                    </div>
                    
                    <!-- Confirmation Button -->
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${confirmationUrl}" style="background-color: #4F46E5; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 18px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                        تأكيد البريد الإلكتروني
                      </a>
                    </div>
                    
                    <!-- Alternative Link -->
                    <div style="text-align: center; margin-bottom: 40px;">
                      <p style="color: #666; font-size: 14px; margin: 0;">إذا لم يعمل الزر أعلاه، انسخ والصق الرابط التالي في متصفحك:</p>
                      <p style="color: #4F46E5; font-size: 13px; word-break: break-all; margin: 8px 0 0;">${confirmationUrl}</p>
                    </div>
                    
                    <!-- Features Section -->
                    <div style="background-color: #f8f9ff; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                      <h3 style="color: #4F46E5; margin-top: 0; margin-bottom: 20px; font-size: 20px; text-align: center;">ماذا ستحصل مع تلخيصلي؟h3>
                      <ul style="padding-right: 20px; margin: 0; line-height: 1.8;">
                        <li style="margin-bottom: 12px; color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> تلخيص المحاضرات الحية في دقائق</li>
                        <li style="margin-bottom: 12px; color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> تنظيم الملاحظات تلقائيًا</li>
                        <li style="margin-bottom: 12px; color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> تجربة مجانية قبل الاشتراك</li>
                        <li style="color: #444; font-size: 16px;"><span style="color: #4F46E5; font-weight: bold;">✓</span> دعوة حصرية للنسخة التجريبية الأولى</li>
                      </ul>
                    </div>
                    
                    <!-- Security Notice -->
                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>ملاحظة أمان:</strong> هذا الرابط صالح لمدة 24 ساعة فقط. إذا لم تطلب هذا البريد، يرجى تجاهله.
                      </p>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">أنت تتلقى هذا البريد لأنك سجلت في تلخيصلي.</p>
                    <p style="margin: 0; color: #6c757d; font-size: 14px;">© 2025 تلخيصلي. جميع الحقوق محفوظة.</p>
                    <div style="margin-top: 15px;">
                      <a href="https://telkhiseli.info" style="color: #4F46E5; text-decoration: none; font-weight: 500;">زيارة موقعنا</a>
                      <span style="margin: 0 10px; color: #6c757d;">|</span>
                      <a href="mailto:support@telkhiseli.info" style="color: #4F46E5; text-decoration: none; font-weight: 500;">تواصل معنا</a>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `
          });
          
          if (error) {
            console.error("Resend Email API Error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
          } else {
            console.log("Confirmation email sent successfully via Resend:", data);
            if (data && data.id) {
              console.log("Email ID:", data.id);
            }
          }
        } catch (resendError) {
          console.error("Failed to register contact or send confirmation email via Resend:", resendError);
          console.error("Resend error details:", JSON.stringify(resendError, null, 2));
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
