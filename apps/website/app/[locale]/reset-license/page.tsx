"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ResetLicensePage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Here you would add the API call to reset the license
			// For now, we'll just simulate a success response
			await new Promise((resolve) => setTimeout(resolve, 1500));

			// toast({
			// 	title: "Success!",
			// 	description:
			// 		"If an account exists with this email, you will receive instructions to reset your license.",
			// 	variant: "default",
			// });

			setEmail("");
		} catch (error) {
			// toast({
			// 	title: "Error",
			// 	description: "Something went wrong. Please try again later.",
			// 	variant: "destructive",
			// });
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
