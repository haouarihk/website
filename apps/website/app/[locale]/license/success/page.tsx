"use client";
import { SERVER_LICENSE_URL } from "@/components/pricing";
import { Button, buttonVariants } from "@/components/ui/button";
import confetti from "canvas-confetti";
import copy from "copy-to-clipboard";
import {
	CheckCircle2,
	Copy,
	CopyIcon,
	Loader2,
	Mail,
	RefreshCcw,
	Terminal,
} from "lucide-react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LicenseSessionResponse {
	type: "basic" | "professional" | "business";
	billingType: "monthly" | "yearly";
	key: string;
}

export default function LicenseSuccess() {
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [loading, setLoading] = useState(true);

	const query = useSearchParams();

	const sessionId = query.get("session_id");

	if (!sessionId) {
		redirect("/");
	}

	const [data, setData] = useState<LicenseSessionResponse | null>(null);

	useEffect(() => {
		setLoading(true);

		fetch(
			`${SERVER_LICENSE_URL}/stripe/get-license-from-session?sessionId=${sessionId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		)
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					setData(data);
				}
			})
			.catch((err) => {
				setError(err);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [sessionId]);

	useEffect(() => {
		if (data) {
			confetti({
				particleCount: 150,
				spread: 100,
				origin: { y: 0.6 },
			});
		}
	}, [data]);

	const copyToClipboard = () => {
		copy(data?.key ?? "");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("Copied to clipboard");
	};

	return (
		<div className="relative min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
			<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

			{loading || error ? (
				<div className="relative pt-48 pb-28">
					<div className="mx-auto max-w-4xl text-center flex justify-center items-center h-full">
						{loading ? (
							<Loader2 className="h-16 w-16 text-zinc-500 animate-spin" />
						) : (
							<div className="flex flex-col gap-4">
								<p className="text-zinc-400 text-sm">
									Something went wrong, please try again {error}{" "}
									<Button
										variant="outline"
										size="icon"
										onClick={() => {
											window.location.reload();
										}}
									>
										<RefreshCcw className="h-4 w-4" />
									</Button>
									<br />
									Please contact us on Discord or email
								</p>
								<div className="flex justify-center items-center gap-2">
									<Link
										href="mailto:support@dokploy.com"
										className={buttonVariants({
											variant: "outline",
											size: "sm",
											className:
												"rounded-full bg-[#5965F2]  hover:bg-[#4A55E0]",
										})}
									>
										Send Email
									</Link>
									<Button
										className="rounded-full bg-[#5965F2]  hover:bg-[#4A55E0]"
										asChild
									>
										<Link
											href="https://discord.gg/2tBnJ3jDJc"
											aria-label="Dokploy on GitHub"
											target="_blank"
											className="flex flex-row items-center gap-2 text-white"
										>
											<svg
												role="img"
												className="h-6 w-6 fill-white"
												viewBox="0 0 24 24"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
											</svg>
											Discord
										</Link>
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="relative pt-24 pb-28">
					<div className="mx-auto max-w-4xl text-center">
						<div className="flex justify-center mb-8">
							<div className="rounded-full bg-green-500/10 p-4">
								<CheckCircle2 className="h-16 w-16 text-green-500" />
							</div>
						</div>

						<h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl mb-6">
							Thank you for your purchase!
						</h1>

						<p className="text-xl leading-8 text-zinc-400 mb-6">
							Your Dokploy license has been successfully activated. Here's your
							API key to get started.
						</p>

						<div className="flex items-center justify-center gap-2 mb-12">
							<Mail className="h-5 w-5 text-zinc-500" />
							<p className="text-sm text-zinc-500">
								We've also sent your API key to your email for safekeeping
							</p>
						</div>

						<div className="bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8 mb-12">
							<div className="flex flex-col items-center space-y-6">
								<Terminal className="h-10 w-10 text-zinc-500" />
								<div className="space-y-4 w-full">
									<div className="text-left space-y-3">
										<p className="text-zinc-400 text-sm">
											Steps to enable paid features
										</p>
										<ul className="space-y-3">
											<li className="flex items-center gap-2">
												<span>1. Install Dokploy</span>
												<code className="text-green-500 font-mono bg-black rounded-lg p-1">
													curl -sSL https://dokploy.com/install.sh | sh
												</code>
												<CopyIcon
													className="w-4 h-4 cursor-pointer"
													onClick={() => {
														copy(
															"curl -sSL https://dokploy.com/install.sh | sh",
														);
														toast.success("Copied to clipboard");
													}}
												/>
											</li>
											<li>
												<span>
													2. Navigate to Settings → License in your Dokploy
													dashboard
												</span>
											</li>
											<li>
												<span>
													3. Enter your license key below and click Validate
												</span>
											</li>
											<li>
												<span>
													4. All premium features will be automatically unlocked
													depending on your license type
												</span>
											</li>
										</ul>
									</div>

									<div className="flex flex-col gap-2 justify-start items-start">
										<span className="text-white text-sm">License Details:</span>
										<span className="text-zinc-400 text-sm">
											License Type:{" "}
											{data?.type === "basic"
												? "Basic"
												: data?.type === "professional"
													? "Professional"
													: "Business"}
										</span>

										<span className="text-zinc-400 text-sm">
											Billing Type:{" "}
											{data?.billingType === "monthly" ? "Monthly" : "Yearly"}
										</span>

										<span className="text-zinc-400 text-sm">License Key:</span>
										<div className="flex items-center justify-between space-x-4 bg-black/50 rounded-lg p-4 border border-zinc-800">
											<code className="text-green-500 text-lg font-mono">
												{data?.key}
											</code>
											<Button
												variant="outline"
												size="icon"
												onClick={copyToClipboard}
												className="transition-all duration-200 hover:bg-green-500/10 hover:text-green-500"
											>
												{copied ? (
													<CheckCircle2 className="h-5 w-5" />
												) : (
													<Copy className="h-5 w-5" />
												)}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Link href="https://docs.dokploy.com/docs/core/installation">
								<Button className="w-full sm:w-auto hover:bg-zinc-800">
									View Documentation
								</Button>
							</Link>
							<Button
								className="rounded-full bg-[#5965F2]  hover:bg-[#4A55E0]"
								asChild
							>
								<Link
									href="https://discord.gg/2tBnJ3jDJc"
									aria-label="Dokploy on GitHub"
									target="_blank"
									className="flex flex-row items-center gap-2 text-white"
								>
									<svg
										role="img"
										className="h-6 w-6 fill-white"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
									</svg>
									Discord
								</Link>
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
