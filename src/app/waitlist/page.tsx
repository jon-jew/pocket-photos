import { Metadata } from 'next';
import Image from "next/image";

import { submitWaitlist } from '@/library/firebase/waitlistServer';
import Button from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'plurr - Join the waitlist!',
  description: 'Sign up to stay informed about everything new with plurr.',
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { prevAlbumId } = await searchParams;
  const submitWaitlistWithId = submitWaitlist.bind(null, prevAlbumId ? prevAlbumId : null);

  return (
    <main className="flex flex-col w-full h-screen justify-start items-center p-8">
      <div className="centered-col relative w-full max-w-xl !justify-end h-[250px] text-primary mb-8">
        <Image
          priority
          alt="Plurr Logo"
          className="mb-3"
          width={125}
          height={120}
          src="/logo.svg"
        />
        <h1 className="leading-[48px]">PLURR</h1>
        <p className="leading-[20px]">
          Do now.<br />Connect later
        </p>
      </div>
      <form
        action={submitWaitlistWithId}
        className="centered-col min-w-[350px] w-[50%] max-w-[600px] bg-[#81818133] gap-3 px-4 py-5 rounded-lg"
      >
        <h2 className="text-primary !text-2xl">Join the waitlist!</h2>
        <p className="!text-xs mt-2 text-gray-200">
          Sign up with either<br />
          your email or mobile number<br />
          to stay in the loop for<br />
          all our exciting updates.
        </p>
        <div className="text-left w-[250px] mt-3">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="bg-gray-50 font-secondary border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="example@gmail.com"
            required
          />
        </div>
        <div className="text-left w-[250px] mt-3 mb-4">
          <label
            htmlFor="phoneNumber"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Mobile number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            className="bg-gray-50 font-secondary border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="212-555-1234"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            title="212-555-1234"
            required
          />
        </div>
        <Button type="submit" fullWidth>
          Join
        </Button>
      </form>
    </main>
  );
}