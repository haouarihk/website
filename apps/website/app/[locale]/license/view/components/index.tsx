"use client";

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
