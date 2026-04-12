import { useState } from 'react';
import { ChevronLeft, Mail, AlertCircle, Loader } from 'lucide-react';

interface PrivacySupportProps {
  onBack: () => void;
}

type Tab = 'privacy' | 'support';

export function PrivacySupport({ onBack }: PrivacySupportProps) {
  const [tab, setTab] = useState<Tab>('privacy');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitMessage('');

    try {
      // In a real app, you'd send this to your backend
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitMessage('Thank you! We\'ll get back to you soon.');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (err) {
      setSubmitMessage('Failed to send. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-text-muted" />
        </button>
        <h2 className="text-2xl font-bold text-text-primary">Help & Support</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setTab('privacy')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            tab === 'privacy'
              ? 'text-accent border-accent'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          Privacy & Terms
        </button>
        <button
          onClick={() => setTab('support')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            tab === 'support'
              ? 'text-accent border-accent'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          Support
        </button>
      </div>

      {/* Privacy Tab */}
      {tab === 'privacy' && (
        <div className="space-y-8">
          {/* Privacy Policy */}
          <section>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Privacy Policy</h3>
            <div className="bg-surface-2 rounded-xl p-6 space-y-4 text-text-secondary">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">1. Information We Collect</h4>
                <p>
                  When you create an account, we collect your email address, name, and password. We also collect
                  information about your conversations and usage patterns to improve our service.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">2. How We Use Your Information</h4>
                <p>
                  We use your information to provide, maintain, and improve our service. Your conversations are
                  private and only you can access them. We never share your data with third parties without your consent.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">3. Data Security</h4>
                <p>
                  We use industry-standard encryption (SSL/TLS) to protect your data in transit. Your passwords are
                  hashed using bcrypt and never stored in plain text. All data is housed on secure servers with regular backups.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">4. Your Rights</h4>
                <p>
                  You have the right to: access all your data, request corrections, delete your account and all associated
                  data, and export your conversations. You can exercise these rights through your account settings.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">5. Cookies</h4>
                <p>
                  We use authentication tokens to keep you logged in. These tokens expire after 1 hour of inactivity
                  for security. We do not use tracking cookies.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">6. Changes to This Policy</h4>
                <p>
                  We may update this privacy policy from time to time. We will notify you of significant changes
                  via email. Your continued use of Sparks indicates your acceptance of the updates.
                </p>
              </div>
            </div>
          </section>

          {/* Terms of Service */}
          <section>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Terms of Service</h3>
            <div className="bg-surface-2 rounded-xl p-6 space-y-4 text-text-secondary">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">1. Acceptable Use</h4>
                <p>
                  You agree not to use Sparks for illegal activities, to harass others, or to create content that
                  violates our community guidelines. This includes but is not limited to: hate speech, violence,
                  explicit content, and spam.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">2. Intellectual Property</h4>
                <p>
                  Content generated by you in Sparks is owned by you. We retain the right to use anonymized,
                  aggregated data for research and service improvement. You grant us a license to display your
                  conversations if you choose to share them publicly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">3. Disclaimer</h4>
                <p>
                  Sparks is provided "as-is" without warranties. We do not guarantee uninterrupted service or
                  error-free operation. We are not liable for data loss, service interruptions, or indirect damages.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">4. Limitation of Liability</h4>
                <p>
                  Our total liability is limited to the amount you paid for the service in the past 12 months.
                  In no case shall we be liable for indirect, incidental, or consequential damages.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-2">5. Account Termination</h4>
                <p>
                  We reserve the right to terminate accounts that violate our terms. You can delete your account
                  at any time. Upon termination, we will delete your data within 30 days.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Support Tab */}
      {tab === 'support' && (
        <div className="space-y-8">
          {/* FAQ */}
          <section>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {[
                {
                  q: 'How do I reset my password?',
                  a: 'Click "Forgot password?" on the login page and enter your email. We\'ll send you a reset link.',
                },
                {
                  q: 'Can I delete my account?',
                  a: 'Yes, go to Account Settings → Danger Zone → Delete Account. All your data will be permanently deleted.',
                },
                {
                  q: 'Are my conversations private?',
                  a: 'Absolutely. Your conversations are encrypted and only you can access them. No one else can see your chats.',
                },
                {
                  q: 'What models can I use?',
                  a: 'We support various free and open-source models. Check the Models page to see available options.',
                },
                {
                  q: 'How do I export my chats?',
                  a: 'Go to Settings → Export Conversations to download all your chats as a JSON file.',
                },
              ].map((faq, i) => (
                <div key={i} className="bg-surface-2 rounded-lg p-4">
                  <h4 className="font-semibold text-text-primary mb-2">{faq.q}</h4>
                  <p className="text-text-secondary text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Support */}
          <section>
            <h3 className="text-xl font-semibold text-text-primary mb-4">Contact Support</h3>
            <div className="bg-surface-2 rounded-xl p-6">
              <form onSubmit={handleSubmitSupport} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Brief subject of your message"
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent resize-none"
                    required
                  />
                </div>

                {submitMessage && (
                  <div className={`p-3 rounded-lg flex items-start gap-2 ${
                    submitMessage.includes('Thank')
                      ? 'bg-green-400/10 text-green-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{submitMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader size={16} className="animate-spin" />}
                  Send Message
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
