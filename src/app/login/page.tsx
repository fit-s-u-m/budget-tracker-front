'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockKeyhole, User } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="text-primary-foreground font-bold text-2xl">B</span>
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Login with Telegram</CardTitle>
                    <CardDescription className="text-center">
                      Go to our telegram bot `@nehemiah` regiser with /start and enter the 6-digit code we just sent you.
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    <form action={dispatch} className="space-y-4">
                        <InputOTP name="otp" maxLength={6}> 
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        <div className="flex items-center space-x-2">
                            <div
                                aria-live="polite"
                                aria-atomic="true"
                                className="flex h-8 items-end space-x-1"
                            >
                                {errorMessage && (
                                    <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
                                )}
                            </div>
                        </div>
                        <LoginButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full cursor-pointer" aria-disabled={pending} disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
        </Button>
    );
}
