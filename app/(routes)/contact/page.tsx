import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { APP_CONTACTS } from '@/lib/constants'


export const metadata: Metadata = generateSEO({
  title: 'Contact Us',
  description: 'Get in touch with our team. We\'re here to help with any questions or concerns.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
          Contact Us
        </h1>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium mb-2"
                  >
                    Full Name
                  </label>
                  <Input id="fullName" type="text" required />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email
                </label>
                <Input id="email" type="email" required />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2"
                >
                  Subject
                </label>
                <Input id="subject" type="text" required />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                variant={"secondary"}
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in touch</h2>
            <p className="text-muted-foreground mb-8">
              We&apos;d love to hear from you. Send us a message and we&apos;ll
              respond as soon as possible.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">
                    {APP_CONTACTS.email.getInTouch}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">
                    {APP_CONTACTS.phone.main}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: APP_CONTACTS.address.office }} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-muted-foreground">
                    Mon - Fri: 9:00 AM - 6:00 PM
                    <br />
                    Sat - Sun: 10:00 AM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

