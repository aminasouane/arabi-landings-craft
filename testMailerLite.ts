import fetch from "node-fetch"; // إذا لم يكن مثبتًا، نفّذي: npm install node-fetch@2

const API_KEY = process.env.VITE_MAILERLITE_API_KEY;
const GROUP_ID = process.env.VITE_MAILERLITE_GROUP_ID;

async function testSubscriber() {
  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        email: "test@example.com", // غيري البريد هنا للاختبار
        fields: {
          name: "Test User",
          contact_type: "email",
        },
        groups: [GROUP_ID],
      }),
    });

    const data = await res.json();
    console.log("API Response:", data);

    if (!res.ok) {
      console.error("❌ فشل الاختبار:", data);
    } else {
      console.log("✅ الاختبار نجح!");
    }
  } catch (error) {
    console.error("❌ خطأ في الاتصال:", error);
  }
}

testSubscriber();
