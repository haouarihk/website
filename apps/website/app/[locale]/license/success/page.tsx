"use client";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { CheckCircle2, Copy, Mail, Terminal } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LicenseSuccess() {
	const [copied, setCopied] = useState(false);
	// Generate a realistic-looking API key
	const apiKey = `dk_live_${Array.from(
		crypto.getRandomValues(new Uint8Array(24)),
	)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("")}`;

	useEffect(() => {
		// Launch confetti when the page loads
		confetti({
			particleCount: 150,
			spread: 100,
			origin: { y: 0.6 },
		});
	}, []);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(apiKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black">
			<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

			<Container className="relative pt-24 pb-28">
				<div className="mx-auto max-w-3xl text-center">
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
								<div className="flex items-center justify-between space-x-4 bg-black/50 rounded-lg p-4 border border-zinc-800">
									<code className="text-green-500 text-lg font-mono">
										{apiKey}
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

								<div className="text-left space-y-3">
									<p className="text-zinc-400 text-sm">
										To start using your license, add this API key to your
										configuration file:
									</p>
									<pre className="bg-black/50 rounded-lg p-4 overflow-x-auto border border-zinc-800">
										<code className="text-sm font-mono text-zinc-300">
											{`# .env
DOKPLOY_LICENSE_KEY=${apiKey}`}
										</code>
									</pre>
								</div>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link href="https://docs.dokploy.com/docs/core/installation">
							<Button
								variant="outline"
								className="w-full sm:w-auto hover:bg-zinc-800"
							>
								View Documentation
							</Button>
						</Link>
						<Link href="https://discord.gg/dokploy">
							<Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
								Join our Discord
							</Button>
						</Link>
					</div>
				</div>
			</Container>
		</div>
	);
}
