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
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "مشترك في النشرة البريدية", // اسم افتراضي
          email: values.email,
          contactType: "email",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("🎉 تم تسجيلك بنجاح!")
        form.reset()
      } else {
        console.error("API Error:", data)
        alert(`⚠️ ${data.message || "حدث خطأ أثناء التسجيل"}`)
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
