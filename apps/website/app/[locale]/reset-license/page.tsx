"use client";

import { Container } from "@/components/Container";
import { SERVER_LICENSE_URL } from "@/components/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface License {
	email: string;
	serverIp?: string[];
	licenseKey: string;
	productName: string;
	createdAt: string;
	lastVerifiedAt: string;
	billingType: string;
	activatedAt: string;
	type: string;
}

export default function ResetLicensePage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [showRender, setShowRender] = useState<"otp" | "email">("email");
	const [isLoading, setIsLoading] = useState(false);
	const [otp, setOtp] = useState("");

	const sendEmail = async (email: string) => {
		try {
			const result = await fetch(`${SERVER_LICENSE_URL}/license/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await result.json();

			if (data.error) {
				toast.error(
					"Error sending verification code. Please try again later.",
					{
						description: data.error,
					},
				);
			} else {
				toast.success(
					"We've sent you a code to verify your email. Please check your email for the code.",
				);
				setShowRender("otp");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again later.", {
				duration: 15000,
				description: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		await sendEmail(email);
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (otp.length !== 6) {
				toast.error("Please enter a valid 6-digit code.");
				return;
			}

			const result = await fetch(`${SERVER_LICENSE_URL}/license/verify-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, otpCode: otp }),
			});

			const data = await result.json();
			if (data.error) {
				toast.error("Error verifying code. Please try again.", {
					description: data.error,
				});
			} else {
				const temporalId = data.temporalId;
				console.log(temporalId);
				router.push(`/license/view?temporalId=${temporalId}`);
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again later.", {
				duration: 15000,
				description: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container className="relative pt-20 pb-16 text-center">
			<div className="mx-auto max-w-2xl">
				<h1 className="font-display text-4xl font-medium tracking-tight text-white sm:text-5xl">
					Reset Your License
				</h1>
				<p className="mt-4 text-lg text-muted-foreground">
					{showRender === "otp"
						? "Enter the verification code sent to your email."
						: "Enter your email address and we'll send you instructions to reset your license."}
				</p>

				{showRender === "email" ? (
					<form
						onSubmit={handleSubmit}
						className="mt-10 flex flex-col items-center gap-4"
					>
						<div className="w-full max-w-sm">
							<Input
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full"
								disabled={isLoading}
							/>
						</div>
						<Button
							type="submit"
							className="w-full max-w-sm"
							disabled={isLoading}
						>
							{isLoading ? "Sending..." : "Reset License"}
						</Button>
					</form>
				) : (
					<form
						onSubmit={handleVerifyOtp}
						className="mt-10 flex flex-col items-center gap-4"
					>
						<div className="w-full max-w-sm flex justify-center gap-2">
							<InputOTP
								value={otp}
								onChange={setOtp}
								maxLength={6}
								disabled={isLoading}
								required
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
							<Button
								type="button"
								variant="ghost"
								onClick={() => {
									sendEmail(email);
								}}
								disabled={isLoading}
							>
								<ExternalLink className="w-4 h-4" />
							</Button>
						</div>
						<Button
							type="submit"
							className="w-full max-w-sm"
							disabled={isLoading}
						>
							{isLoading ? "Verifying..." : "Verify Code"}
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setShowRender("email")}
							disabled={isLoading}
						>
							Back to Email
						</Button>
					</form>
				)}
			</div>
		</Container>
	);
}
