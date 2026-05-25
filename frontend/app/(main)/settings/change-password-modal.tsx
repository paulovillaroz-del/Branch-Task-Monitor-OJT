"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { X, Mail, CheckCircle2 } from "lucide-react"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function ChangePasswordModal({ isOpen, onClose, userEmail }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isChangingPass, setIsChangingPass] = useState(false)
  const [isSuccessUI, setIsSuccessUI] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 🔥 HYDRATION LOCK LAYER: Tinitiyak na stable muna ang client-side dynamic states 
  // bago mag-execute ng DOM tree modifications para i-lock ang Radix accessibility identifiers.
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSendCode = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      alert("Passwords must match.")
      return
    }
    setIsSendingCode(true)
    try {
      // 🔴 PORT FIXED: Pinalitan mula 8080 patungong 40241 kung saan aktibong tumatakbo ang Go backend mo
      const res = await fetch("http://localhost:40241/user/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
      if (res.ok) setIsCodeSent(true)
      else alert("Failed to send code. Please check if your email profile configuration is active.")
    } catch (err) {
      alert("Server is offline. Kindly check your terminal orchestration pipelines.")
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleChangePassword = async () => {
    setIsChangingPass(true)
    try {
      // 🔴 PORT FIXED: Pinalitan mula 8080 patungong 40241 para mag-sync sa active PostgreSQL target schemas
      const res = await fetch("http://localhost:40241/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          new_password: newPassword,
          code: verificationCode,
        }),
      })
      if (res.ok) setIsSuccessUI(true)
      else alert("Invalid verification code. Please try again.")
    } catch (err) {
      alert("Error updating password structure layout layers.")
    } finally {
      setIsChangingPass(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setNewPassword("")
      setConfirmPassword("")
      setVerificationCode("")
      setIsCodeSent(false)
      setIsSuccessUI(false)
    }, 300)
  }

  if (!mounted || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-[300px] shadow-xl border-border/30 bg-background/95 backdrop-blur-md animate-in zoom-in-95 duration-200 m-4 overflow-hidden rounded-2xl">
        {!isSuccessUI ? (
          <>
            <CardHeader className="relative pb-2 pt-5 px-5">
              <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:bg-transparent" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="text-base font-semibold text-center">Update Password</CardTitle>
              <CardDescription className="text-xs text-center">
                {!isCodeSent ? "Create a new strong password." : "Check your Gmail for the code."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2 pb-5 px-5">
              <div className="space-y-3">
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" disabled={isCodeSent} className="h-9 text-sm bg-transparent" />
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" disabled={isCodeSent} className="h-9 text-sm bg-transparent" />
              </div>
              {!isCodeSent ? (
                <Button onClick={handleSendCode} disabled={isSendingCode} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm rounded-lg">
                  {isSendingCode ? "Sending..." : "Send Code"}
                </Button>
              ) : (
                <div className="space-y-3 mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <Input maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className="bg-transparent text-center tracking-[0.5em] font-mono h-10 text-lg" />
                  <Button onClick={handleChangePassword} disabled={isChangingPass || verificationCode.length !== 6} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm rounded-lg">
                    {isChangingPass ? "Verifying..." : "Verify & Save"}
                  </Button>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-6 space-y-2 animate-in zoom-in duration-300 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" strokeWidth={1} />
            <h3 className="text-lg font-medium text-foreground">Password Updated</h3>
            <p className="text-xs text-muted-foreground pb-2">Your account is now secured.</p>
            <Button onClick={handleClose} variant="ghost" className="mt-2 w-full text-muted-foreground hover:text-foreground text-sm h-9">Close</Button>
          </div>
        )}
      </Card>
    </div>
  )
}