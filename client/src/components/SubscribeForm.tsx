"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
})

export default function SubscribeForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_MAILERLITE_TOKEN}`, // ✅ من .env
        },
        body: JSON.stringify({
          email: values.email,
          groups: [import.meta.env.VITE_MAILERLITE_GROUP], // ✅ من .env
        }),
      })

      if (response.ok) {
        alert("🎉 تم تسجيلك بنجاح!")
        form.reset()
      } else {
        const errorData = await response.json()
        console.error("MailerLite error:", errorData)
        alert("⚠️ حدث خطأ أثناء التسجيل")
      }
    } catch (err) {
      console.error(err)
      alert("❌ لم نتمكن من الاتصال بالخادم")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>بريدك الإلكتروني</FormLabel>
              <FormControl>
                <Input placeholder="أدخل بريدك الإلكتروني" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-cyan-600 text-white">
          اشترك
        </Button>
      </form>
    </Form>
  )
}
