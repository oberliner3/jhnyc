import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies and similar technologies on our website.',
};

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 1, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you 
              visit a website. They are widely used to make websites work more efficiently and to provide 
              information to website owners.
            </p>

            <h2>How We Use Cookies</h2>
            <p>
              We use cookies and similar technologies to improve your browsing experience, analyze website 
              traffic, and provide personalized content and advertisements.
            </p>

            <h3>Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality 
              such as security, network management, and accessibility. You cannot opt-out of these cookies.
            </p>
            <ul>
              <li>Authentication and security</li>
              <li>Shopping cart functionality</li>
              <li>Form submission</li>
              <li>Load balancing</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and 
              reporting information anonymously. This helps us improve our website performance and user experience.
            </p>
            <ul>
              <li>Google Analytics</li>
              <li>Page view tracking</li>
              <li>User behavior analysis</li>
              <li>Performance monitoring</li>
            </ul>

            <h3>Marketing Cookies</h3>
            <p>
              These cookies are used to track visitors across websites to display relevant and engaging 
              advertisements. They may be set by us or by third-party advertising partners.
            </p>
            <ul>
              <li>Targeted advertising</li>
              <li>Social media integration</li>
              <li>Retargeting campaigns</li>
              <li>Conversion tracking</li>
            </ul>

            <h3>Functional Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization, such as remembering your 
              preferences and settings.
            </p>
            <ul>
              <li>Language preferences</li>
              <li>Theme settings</li>
              <li>Recently viewed products</li>
              <li>Customer support chat</li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>
              We may use third-party services that place their own cookies on your device. These include:
            </p>
            <ul>
              <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
              <li><strong>Facebook Pixel:</strong> For advertising and social media integration</li>
              <li><strong>Payment Processors:</strong> For secure payment processing</li>
              <li><strong>Customer Support:</strong> For live chat and support services</li>
            </ul>

            <h2>Managing Your Cookie Preferences</h2>
            <h3>Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can typically:
            </p>
            <ul>
              <li>View what cookies are stored on your device</li>
              <li>Delete existing cookies</li>
              <li>Block cookies from specific websites</li>
              <li>Block third-party cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3>Cookie Banner</h3>
            <p>
              When you first visit our website, you&apos;ll see a cookie banner that allows you to:
            </p>
            <ul>
              <li>Accept all cookies</li>
              <li>Reject non-essential cookies</li>
              <li>Customize your cookie preferences</li>
              <li>Learn more about our cookie usage</li>
            </ul>

            <h3>Opt-Out Links</h3>
            <p>
              You can opt out of certain third-party cookies using these resources:
            </p>
            <ul>
              <li><a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
              <li><a href="https://www.facebook.com/help/568137493302217" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Facebook Pixel Opt-out</a></li>
              <li><a href="https://optout.networkadvertising.org/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Network Advertising Initiative</a></li>
            </ul>

            <h2>Impact of Disabling Cookies</h2>
            <p>
              If you disable cookies, some features of our website may not function properly:
            </p>
            <ul>
              <li>Shopping cart may not remember items</li>
              <li>Login sessions may not be maintained</li>
              <li>Personalized content may not be displayed</li>
              <li>Analytics and improvements may be limited</li>
            </ul>

            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for legal, regulatory, or operational reasons. We will notify you of any material 
              changes by posting the updated policy on our website.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <ul>
              <li>Email: <a href="mailto:privacy@example.com" className="text-primary hover:underline">privacy@example.com</a></li>
              <li>Phone: (970) 710-6334</li>
              <li>Address: 1308 E 41st Pl, Los Angeles, CA 90011, USA</li>
            </ul>

            <h2>Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding cookies and data processing:
            </p>
            <ul>
              <li>Right to information about data processing</li>
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
            </ul>

            <p>
              For more information about your privacy rights, please see our{' '}
              <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}