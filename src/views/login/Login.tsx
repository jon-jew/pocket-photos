"use client";

import React, { useState, useEffect } from 'react';

import Script from 'next/script';
import { redirect, useRouter } from 'next/navigation';

import Cookies from 'universal-cookie';
import { onIdTokenChanged } from '@/library/firebase/auth';
import { signInWithPhoneNumber as _signInWithPhoneNumber, RecaptchaVerifier, User } from "firebase/auth";
import { toast } from 'react-toastify';

import LocalPhoneIcon from '@mui/icons-material/LocalPhone';

import { auth } from '@/library/firebase/clientApp';
import useUserSession from '@/components/hooks/useUserSesssion';
import IconHeader from '@/components/iconHeader';
import TornContainer from '@/components/tornContainer/TornContainer';
import Textfield from '@/components/ui/textfield';
import Button from '@/components/ui/button';
import NumberInput from '@/components/ui/numberInput';
import Link from 'next/link';

interface LoginProps {
  initialUser: User | undefined;
}

const Login: React.FC<LoginProps> = ({ initialUser }) => {
  const cookies = new Cookies(null, { path: '/' });
  const router = useRouter();
  // const user = useUserSession(initialUser);

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [codeAttempts, setCodeAttempts] = useState<number>(0);
  const [mode, setMode] = useState<'phone' | 'code'>('phone');

  const handleSendOTP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log('Sending OTP to:', `+1${phoneNumber}`);
    _signInWithPhoneNumber(auth, `+1${phoneNumber}`, window.recaptchaVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setMode('code');
        setLoading(false);
        toast.success('One time code sent to your phone!');
      }).catch((error) => {
        // Error; SMS not sent
        setLoading(false);
        console.error('sign in error', error)
        toast.error('Failed to send code.');
      });
  };

  const handleChangeOtp = (value: string) => {
    setOtpCode(value);
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (window.confirmationResult) {
      window.confirmationResult.confirm(otpCode).then((res) => {
        // User signed in successfully.

        // window.location.reload();

        // router.back();
      }).catch((error: { message: string }) => {
        // User couldn't sign in (bad verification code?)
        console.error(error.message);
        if (codeAttempts > 5) {
          toast.error('Too many attempts.');
          router.push('/');
        }
        else if (error.message.includes('(auth/invalid-verification-code)')) {
          setCodeAttempts(codeAttempts + 1);
          setOtpCode('');
          toast.error('Invalid code');
        }
      });
    } else {
      console.error('Missing confirmation');
      toast.error('Failed to verify code.');
      setMode('phone');
    }
  };

  useEffect(() => {
    if (initialUser) {
      toast.info('User already logged in');
      router.push('/');
    } else if (!initialUser) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        'size': 'invisible',
      });
    }
  }, []);

  useEffect(() => {
    return onIdTokenChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        await cookies.set("__session", idToken);
        router.push('/');
        toast.success('Signed in successfully!');
      } else {
        await cookies.remove("__session");
      }
      if (initialUser?.uid === user?.uid) {
        return;
      }
    });
  }, [initialUser]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Script
        strategy="lazyOnload"
        src="https://www.google.com/recaptcha/enterprise.js?render=6LcRkcwrAAAAAGM5FKmXxQ2fVBWX8cQmX1zrtH7y"
      />
      <IconHeader />
      <TornContainer isLoading={loading}>
        {mode == 'phone' &&
          <form className="centered-col gap-2 width-full" onSubmit={handleSendOTP}>
            <h3 className="mb-2">
              Login using your<br />
              phone number
            </h3>
            <Textfield
              isLoading={loading}
              label="Phone Number"
              type="tel"
              maxLength={10}
              onChange={(e) => setPhoneNumber(e.target.value)}
              LeadingIcon={<LocalPhoneIcon sx={{ fontSize: '18px' }} />}
              buttonLabel="Send OTP"
              buttonType="submit"
              buttonId="sign-in-button"
              buttonDisabled={phoneNumber.length !== 10}
            />
            {/* <div id="recaptcha-container" className="mt-4"></div> */}

            <p className="text-xs mt-8 max-w-lg">
              By entering your phone number, you agree to our Terms of Service
              and <Link className="underline" href="/privacy-policy">Privacy Policy</Link>.
              Standard message and data rates may apply.
            </p>
          </form>
        }
        {mode == 'code' &&
          <form onSubmit={handleOtpSubmit} className="centered-col w-full">
            <h3 className="mb-3">
              Enter one time code<br />
              texted to your phone
            </h3>
            <div className="mb-3 relative h-[66px]">
              <div className="absolute top-[50%] left-[10px] -translate-1/2">
                <NumberInput
                  onChange={handleChangeOtp}
                  value={otpCode}
                />
              </div>
            </div>
            <Button
              disabled={otpCode.length !== 6}
              variant="primary"
              type="submit"
            >
              Verify
            </Button>
          </form>
        }
      </TornContainer>
    </div>
  );
};

export default Login;
