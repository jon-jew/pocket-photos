import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for our application.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-secondary">
        <h1 className="text-4xl text-primary font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="mt-8 prose prose-lg text-gray-300">
          <p>
            This privacy policy ("Policy") describes how the application operator ("we", "us", or "our") collects, protects, and uses the personally identifiable information ("Personal Information") you ("User", "you", or "your") may provide through our application and any of its products or services (collectively, "Application" or "Services").
          </p>
          <p className="mt-5">
            It also describes the choices available to you regarding our use of your Personal Information and how you can access and update this information. This Policy is a legally binding agreement between you and us. By accessing and using the Application and Services, you acknowledge that you have read, understood, and agree to be bound by the terms of this Policy.
          </p>

          <h2 className="mt-8">Collection of information</h2>
          <p className="mt-2">
            We receive and store any information you knowingly provide to us when you create an account, publish content, or fill any online forms in the Application. When required, this information may include your email address, name, or other Personal Information. You can choose not to provide us with certain information, but then you may not be able to take advantage of some of the Application's features.
          </p>

          <h2 className="mt-8">Use and processing of collected information</h2>
          <p className="mt-2">
            Any of the information we collect from you may be used to personalize your experience; improve our Application; improve customer service and respond to queries and emails of our customers; send notification emails such as password reminders, updates, etc.; run and operate our Application and Services.
          </p>

          <h2 className="mt-8">Disclosure of information</h2>
          <p className="mt-2">
            We will not share your Personal Information with third parties except as described in this Policy. We may share your information with our affiliate companies, and service providers that assist in the operation of the Application.
          </p>

          <h2 className="mt-8">Data security</h2>
          <p className="mt-2">
            We secure information you provide on computer servers in a controlled, secure environment, protected from unauthorized access, use, or disclosure. We maintain reasonable administrative, technical, and physical safeguards in an effort to protect against unauthorized access, use, modification, and disclosure of Personal Information in its control and custody.
          </p>

          <h2 className="mt-8">Your rights</h2>
          <p className="mt-2">
            You have the right to access, update, or delete your Personal Information. If you wish to exercise this right, please contact us through the contact information provided below.
          </p>

          <h2 className="mt-8">Changes to this Privacy Policy</h2>
          <p className="mt-2">
            We reserve the right to modify this Policy relating to the Application or Services at any time, effective upon posting of an updated version of this Policy in the Application. When we do, we will revise the updated date at the top of this page. Continued use of the Application and Services after any such changes shall constitute your consent to such changes.
          </p>

          <h2 className="mt-8">Contacting us</h2>
          <p className="mt-2">
            If you would like to contact us to understand more about this Policy or wish to contact us concerning any matter relating to individual rights and your Personal Information, you may send an email to jonathan.jew@gmail.com.
          </p>
        </div>
      </div>
    </main>
  );
}