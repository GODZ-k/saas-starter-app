"use client";
import React, { ChangeEvent, useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState("");
  const router = useRouter();

  if (!isLoaded) {
    return <div>Loading ....</div>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (error: any) {
      console.log(error);
      setError(error.errors[0].message);
    }
  }

  async function onPressVerification(e: React.FormEvent) {
    e.preventDefault();
    try {
      const completeSignup = await signUp?.attemptEmailAddressVerification({
        code,
      });

      if (completeSignup?.status !== "complete") {
        console.log(JSON.stringify(completeSignup, null, 2));
      }

      if (completeSignup?.status === "complete") {
        await setActive({
          session: completeSignup.createdSessionId,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
      setError(error.errors[0].message);
    }
  }

  return (
    <div className=" flex justify-center items-center w-full h-screen">
      <Card className=" w-96">
        <CardHeader>
          <CardTitle>Signup to get todo master</CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
            <form onSubmit={submit} className=" space-y-4">
              <div className=" space-y-2">
                <Label htmlFor="email">Your email address</Label>
                <Input
                  type="text"
                  placeholder="Enter your email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
              <div className=" space-y-2">
                <Label htmlFor="email">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button className=" w-fit" type="submit">
                Sign up
              </Button>
            </form>
          ) : (
            <form onSubmit={onPressVerification} className=" space-y-4">
              <div className=" space-y-2">
                <Label>Enter Otp</Label>
                <Input type="text" placeholder="Enter Otp" value={code} onChange={(e)=> setCode(e.target.value)} required/>
              </div>
              <Button type="submit">Verify</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
