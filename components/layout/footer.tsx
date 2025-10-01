import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { subscribeToNewsletter } from "@/app/api/newsletter/actions";
import { Logo } from "@/components/common/logo";
import { SafeHtml } from "@/components/common/safe-html";
import { PaymentMethods } from "@/components/icons/payment-methods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { APP_CONTACTS, FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-gray-50 mx-auto p-0 border-t w-screen">
      {/* Newsletter Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="px-4 py-12 container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-2 font-bold text-2xl">Stay in the Loop</h2>
            <p className="opacity-90 mb-6">
              Get exclusive offers, new product updates, and style tips
              delivered to your inbox.
            </p>
            <form
              action={subscribeToNewsletter}
              className="flex gap-2 mx-auto max-w-md"
            >
              <Input
                type="email"
                name="email"
                placeholder="Enter your email address"
                className="bg-white border-0 focus:ring-2 focus:ring-white/20 text-gray-900"
                required
              />
              <Button
                variant="secondary"
                type="submit"
                className="bg-white hover:bg-gray-100 font-medium text-primary"
              >
                Subscribe
              </Button>
            </form>
            <p className="opacity-75 mt-3 text-xs">
              By subscribing, you agree to receive promotional emails. You can
              unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-4 py-12 container">
        <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-2">
            <Logo />
            <p className="text-gray-600 text-sm leading-relaxed">
              Your trusted destination for premium products. We&apos;re
              committed to delivering exceptional quality and outstanding
              customer service.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>
                  <SafeHtml html={APP_CONTACTS.address.office} />
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{APP_CONTACTS.phone.main}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{APP_CONTACTS.email.getInTouch}</span>
              </div>
            </div>
          </div>

          {/* Our Policies */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Our Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/policies/privacy"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/return-refund"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Return and Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/shipping"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Contact Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/policies/billing-terms"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Billing Terms And Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/order-cancellation"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Order Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/secure-payment"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Secure Payment
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/cookie"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="bg-white px-4 py-6 border-t container">
        <div className="flex md:flex-row flex-col justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2025 {SITE_CONFIG.name}. All rights reserved.
          </p>
          <FooterBottomLinks />
          <PaymentMethods />
        </div>
      </div>
    </footer>
  );
}

function FooterBottomLinks() {
  return (
    <div className="flex flex-wrap gap-2 text-gray-600 text-xs">
      <Link
        href="/policies/privacy"
        className="hover:text-gray-900 transition-colors"
      >
        Privacy Policy
      </Link>
      <Link
        href="/policies/terms"
        className="hover:text-gray-900 transition-colors"
      >
        Terms of Service
      </Link>
      <Link
        href="/policies/return-refund"
        className="hover:text-gray-900 transition-colors"
      >
        Return and Refund Policy
      </Link>
      <Link
        href="/policies/shipping"
        className="hover:text-gray-900 transition-colors"
      >
        Shipping Policy
      </Link>
      <Link
        href="/policies/cookie"
        className="hover:text-gray-900 transition-colors"
      >
        Cookie Policy
      </Link>
      <Link href="/contact" className="hover:text-gray-900 transition-colors">
        Contact
      </Link>
    </div>
  );
}
