import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import {
  ArticleHeader,
  ArticleSection,
  ArticleWrapper,
  UnorderdList,
} from "@/components/common/static-page";
import { APP_CONTACTS, SITE_CONFIG } from "@/lib/constants";
export const metadata: Metadata = generateSEO({
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  const weCollect : string[] = [
          'Personal information (name, email, phone number)',
          'Payment information (processed securely by our payment processors)',
          'Shipping and billing addresses',
          'Communication preferences',
  ]
  return (
    <ArticleWrapper>
      <ArticleHeader
        title={"Privacy Policy"}
        lastUpdate={SITE_CONFIG.lastUpdate}
      />

      <ArticleSection
      title='Information We Collect'
      first='We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.'
      >
      <UnorderdList list={weCollect} />
      </ArticleSection>
      <section>
        <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
        <p className="text-muted-foreground mb-4">
          We use the information we collect to provide, maintain, and improve
          our services:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Process and fulfill your orders</li>
          <li>Send you order confirmations and updates</li>
          <li>Provide customer support</li>
          <li>Send marketing communications (with your consent)</li>
          <li>Improve our website and services</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
        <p className="text-muted-foreground">
          We do not sell, trade, or otherwise transfer your personal information
          to third parties without your consent, except as described in this
          policy or as required by law.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
        <p className="text-muted-foreground">
          If you have any questions about this Privacy Policy, please contact us
          at {APP_CONTACTS.email.privacy}.
        </p>
      </section>
    </ArticleWrapper>
  );
}

