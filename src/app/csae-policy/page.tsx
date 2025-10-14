import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSAE Policy',
  description: 'Our policy regarding Child Sexual Abuse and Exploitation (CSAE).',
};

export default function CSAEPolicyPage() {
  return (
    <main className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-primary">
          Child Sexual Abuse and Exploitation (CSAE) Policy
        </h1>
        <p className="text-sm text-gray-400 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Our Commitment</h2>
          <p>
            We have a zero-tolerance policy for any content or activity that involves or promotes Child Sexual Abuse and Exploitation (CSAE). Protecting children is a fundamental responsibility, and we are committed to maintaining a safe online environment. Any user found to be involved in the creation, distribution, or promotion of Child Sexual Abuse Material (CSAM) will be permanently banned from our service, and all credible instances will be reported to the appropriate authorities.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">2. Prohibited Activities</h2>
          <p className="mb-2">
            The following activities are strictly prohibited on our platform:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Uploading, posting, sharing, or otherwise distributing any content that depicts, describes, or encourages child sexual abuse. This includes images, videos, and text.
            </li>
            <li>
              Using our platform to solicit, groom, or engage in any form of sexual communication with minors.
            </li>
            <li>
              Sharing links to or directing users to off-platform sites containing CSAM.
            </li>
            <li>
              Engaging in any activity that endangers or exploits children.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">3. Reporting Mechanisms</h2>
          <p className="mb-2">
            User vigilance is crucial in combating CSAE. If you encounter any content or user that you suspect violates this policy, please report it immediately using our in-app reporting tools or by contacting our safety team directly at <a href="mailto:jonathan.jew@gmail.com" className="text-blue-600 hover:underline">jonathan.jew@gmail.com</a>.
          </p>
          <p>
            We are legally and morally obligated to report all credible instances of CSAM to the National Center for Missing & Exploited Children (NCMEC) and/or other relevant law enforcement agencies worldwide.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">4. Enforcement and Moderation</h2>
          <p>
            Our dedicated safety team uses a combination of automated detection technologies and human review to identify and remove CSAE content. Upon confirmation of a policy violation:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>
              The offending content will be immediately removed.
            </li>
            <li>
              The responsible user account will be permanently terminated without warning.
            </li>
            <li>
              A report, including the content and user information, will be filed with NCMEC and/or law enforcement as required by law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">5. Cooperation with Law Enforcement</h2>
          <p>
            We cooperate fully with law enforcement agencies in the investigation and prosecution of individuals involved in CSAE. This includes preserving data and providing user information in response to valid legal requests.
          </p>
        </section>
      </div>
    </main>
  );
}