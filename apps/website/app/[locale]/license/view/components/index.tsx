"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SERVER_LICENSE_URL } from "../page";
interface Props {
	customerId: string;
}
export const ManageSubscriptionButton = ({ customerId }: Props) => {
	return (
		<button
			type="button"
			onClick={async () => {
				const getSessionId = await fetch(
					`${SERVER_LICENSE_URL}/stripe/create-customer-portal-session`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ customerId }),
					},
				);
				const result = await getSessionId.json();
				window.open(result.url, "_blank");
			}}
			className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
		>
			<span>Manage Subscription</span>
		</button>
	);
};

interface RemoveServerIpProps {
	licenseKey: string;
	serverIp: string;
}
export const RemoveServerIpButton = ({
	licenseKey,
	serverIp,
}: RemoveServerIpProps) => {
	const [loading, setLoading] = useState(false);
	const removeServerIp = async () => {
		setLoading(true);
		const response = await fetch(
			`${SERVER_LICENSE_URL}/license/remove-server`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ licenseKey, serverIp }),
			},
		);
		const result = await response.json();

		if (result.success) {
			toast.success("Server IP removed successfully");
		} else {
			toast.error(result.error);
		}

		window.location.reload();
	};
	return (
		<Dialog>
			<DialogTrigger>
				<Button variant="ghost" size="icon">
					<Trash2 className="w-4 h-4 text-red-500" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you absolutely sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will remove the server IP from
						the license.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="destructive"
						disabled={loading}
						onClick={removeServerIp}
					>
						{loading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							"Remove Server IP"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
