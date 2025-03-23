"use client";

import { Container } from "@/components/Container";
import { SERVER_LICENSE_URL } from "@/components/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
export default function ResetLicensePage() {
	const [email, setEmail] = useState("");
	const [showOtp, setShowOtp] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await fetch(`${SERVER_LICENSE_URL}/license/verification`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await result.json();
			console.log(data);

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
				setShowOtp(true);
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
					Enter your email address and we'll send you instructions to reset your
					license.
				</p>

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
			</div>
		</Container>
	);
}
