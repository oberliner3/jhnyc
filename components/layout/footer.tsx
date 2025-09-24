import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/common/logo'
import { APP_CONTACTS, FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";
import { PaymentMethods } from '@/components/icons/payment-methods';
import { subscribeToNewsletter } from '@/app/api/newsletter/actions';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      {/* Newsletter Section */}
      <div className=" text-primary-foreground bg-primary shadow">
        <div className="container px-4 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Get Exclusive Offers</h2>
            <p className="mb-6 opacity-90">
              Subscribe to our newsletter and get 10% off your first order plus
              access to exclusive deals.
            </p>
            <form action={subscribeToNewsletter} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="bg-primary-foreground text-foreground"
                required
              />
              <Button variant="secondary" type="submit">
                Subscribe
              </Button>
            </form>
            <p className="text-xs mt-3 opacity-75">
              By subscribing, you agree to receive promotional emails. You can
              unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Premium e-commerce storefront delivering quality products with
              exceptional service.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{APP_CONTACTS.address.office}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{APP_CONTACTS.phone.main}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>{APP_CONTACTS.email.getInTouch}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Legal */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Facebook className="h-4 w-4" />
                  <span className="sr-only">Facebook</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Instagram className="h-4 w-4" />
                  <span className="sr-only">Instagram</span>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="container px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 {SITE_CONFIG.name}. All rights reserved.
          </p>
          <PaymentMethods />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/returns-exchange" className="hover:text-foreground">
              Returns & Exchange
            </Link>
            <Link href="/shipping-delivery" className="hover:text-foreground">
              Shipping & Delivery
            </Link>
            <Link href="/rewards-terms" className="hover:text-foreground">
              Rewards Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}