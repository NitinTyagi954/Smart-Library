import { WhatsAppReminders } from "@/components/admin/whatsapp-reminders"

export default function RemindersPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-serif">WhatsApp Reminders</h1>
        <p className="text-muted-foreground">Send renewal reminders to students via WhatsApp.</p>
      </div>
      <WhatsAppReminders />
    </div>
  )
}
