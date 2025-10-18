import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // API endpoint for MailerLite subscription
  app.post("/api/subscribe", async (req, res) => {
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
      
      // For testing purposes, we'll skip MailerLite API call and just log the data
      console.log("Subscription data:", { name, email, phone, contactType });
      
      // Try to send to MailerLite
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
      } catch (mailerLiteError) {
        console.error("MailerLite API failed:", mailerLiteError);
        return res.status(500).json({ message: "حدث خطأ في الاتصال بخدمة MailerLite" });
      }

      res.json({ success: true, message: "تم التسجيل بنجاح" });
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
