import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Box } from "lucide-react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [step, setStep] = useState<"email" | "otp" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email"); return; }
    toast.success("OTP sent to your email");
    setStep("otp");
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) { toast.error("Enter a valid OTP"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (password.length < 6) { toast.error("Min 6 characters"); return; }
    toast.success("Password reset successfully!");
    setStep("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3">
            <Box className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-1">We'll send you a verification code</p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" /></div>
            <Button type="submit" className="w-full">Send OTP</Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleReset} className="space-y-4">
            <div><Label>OTP Code</Label><Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="1234" /></div>
            <div><Label>New Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div><Label>Confirm Password</Label><Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
            <Button type="submit" className="w-full">Reset Password</Button>
          </form>
        )}

        {step === "done" && (
          <div className="text-center">
            <p className="text-success font-medium mb-4">Password reset successfully!</p>
            <Link to="/auth/login"><Button className="w-full">Go to Login</Button></Link>
          </div>
        )}

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/auth/login" className="text-primary hover:underline">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
