// pages/subscribe.ts
import type { NextApiRequest, NextApiResponse } from "next";

const MAILERLITE_TOKEN = process.env.MAILERLITE_TOKEN;
const MAILERLITE_GROUP = process.env.VITE_MAILERLITE_GROUP;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, contact } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ message: "Name and contact are required" });
  }

  try {
    const response = await fetch(`https://api.mailerlite.com/api/v2/groups/${MAILERLITE_GROUP}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILERLITE_TOKEN}`,
      },
      body: JSON.stringify({ email: contact, name }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ message: text });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
}
