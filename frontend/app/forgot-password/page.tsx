'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, ArrowLeft, Loader2, KeyRound, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New Success State
  const [error, setError] = useState('');
  const router = useRouter();

  // --- STEP 1: Request the 6-digit code ---
  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
  const res = await fetch("http://localhost:40241/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || "Failed to send code.");
      }
    } catch (err) {
      setError("Server connection failed. Check your Go backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: Verify code and Update Password ---
  const handleVerifyAndReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
  const res = await fetch("http://localhost:40241/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: code.trim(), 
          new_password: newPassword 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true); // Trigger Success UI
        // Automatically redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3500);
      } else {
        setError(data.error || "Invalid or expired code.");
      }
    } catch (err) {
      setError("Connection lost. Make sure your Go backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-[400px] w-full shadow-2xl border-border/50 bg-card overflow-hidden">
        {isSuccess ? (
          // --- MODERN SUCCESS UI ---
          <div className="p-8 text-center space-y-6 animate-in zoom-in duration-500">
            <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-10 h-10" />
                </div>
            </div>
            
            <div className="space-y-2">
                <CardTitle className="text-2xl font-bold">Password Updated!</CardTitle>
                <CardDescription className="text-sm font-medium">
                    Your account is now secure. We are redirecting you to the login page...
                </CardDescription>
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting
            </div>

            <Button 
                variant="link" 
                onClick={() => router.push('/login')}
                className="text-primary text-xs font-bold"
            >
                Click here if not redirected automatically
            </Button>
          </div>
        ) : (
          <>
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {step === 1 ? "Reset Password" : "Verify Identity"}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                {step === 1 
                  ? "Enter your email to receive a verification code." 
                  : `A 6-digit code was sent to ${email}`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {step === 1 ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="email" 
                        placeholder="your@email.com"
                        className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  {error && <div className="text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded border border-red-100">⚠️ {error}</div>}

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 font-bold shadow-lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Verification Code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Verification Code</Label>
                    <div className="relative group">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="text" 
                        placeholder="000000"
                        maxLength={6}
                        className="pl-10 bg-secondary/30 border-none h-11 tracking-[0.5em] font-mono text-center text-lg"
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-10 bg-secondary/30 border-none h-11 focus-visible:ring-1 focus-visible:ring-primary"
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  {error && <div className="text-red-500 text-[10px] font-bold bg-red-50 p-2 rounded border border-red-100">⚠️ {error}</div>}

                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 font-bold shadow-lg shadow-emerald-600/20" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Reset Password"}
                  </Button>

                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="w-full text-[10px] text-muted-foreground hover:text-primary hover:underline font-bold transition-colors"
                  >
                    Did not receive a code? Use a different email
                  </button>
                </form>
              )}

              <Button 
                variant="ghost" 
                type="button"
                className="w-full gap-2 mt-4 text-muted-foreground text-xs hover:bg-transparent hover:text-foreground"
                onClick={() => router.push('/login')}
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}