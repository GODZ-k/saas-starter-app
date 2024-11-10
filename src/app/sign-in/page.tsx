"use client";
import React, { ChangeEvent, useState } from "react";
import { useSignIn } from "@clerk/nextjs";
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
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
     const result  =  await signIn.create({
        identifier: emailAddress,password
      });


      if (result.status == "complete") {
        await setActive({
            session: result.createdSessionId,
          });
          router.push("/dashboard");
      }else{
        console.log(JSON.stringify(result, null, 2));
      }

    } catch (error: any) {
      console.log(error);
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
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
