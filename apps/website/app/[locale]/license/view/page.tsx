import Link from "next/link";
import { useParams } from "next/navigation";

export const SERVER_LICENSE_URL =
	process.env.NODE_ENV === "development"
		? "http://localhost:4002/api"
		: "https://licenses.dokploy.com";

const LicenseCard = ({ license, stripeSuscription }: any) => {
	return (
		<div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl mx-auto border border-gray-700">
			<div className="space-y-6">
				{/* License Information Section */}
				<div>
					<h2 className="text-2xl font-bold text-white mb-4">
						License Information
					</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-semibold text-gray-400">License ID</p>
							<p className="text-gray-200">{license.id}</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">License Key</p>
							<p className="text-gray-200 break-all">{license.licenseKey}</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">
								Activation Status
							</p>
							<p className="text-gray-200">
								{license.activatedAt ? "Activated" : "Not Activated"}
							</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">
								Last Verification
							</p>
							<p className="text-gray-200">
								{license.lastVerifiedAt || "Not Verified"}
							</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">Created At</p>
							<p className="text-gray-200">
								{new Date(license.createdAt).toLocaleDateString()}
							</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">
								Last Updated
							</p>
							<p className="text-gray-200">
								{new Date(license.updatedAt).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>

				{/* Subscription Information Section */}
				<div>
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-2xl font-bold text-white">
							Subscription Information
						</h2>
						<button
							type="button"
							className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center space-x-2"
							// onClick={() => {
							// 	// Handle subscription management here
							// }}
						>
							<span>Manage Subscription</span>
						</button>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm font-semibold text-gray-400">
								Subscription ID
							</p>
							<p className="text-gray-200">{stripeSuscription.id}</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">Quantity</p>
							<p className="text-gray-200">
								{stripeSuscription.quantity} licenses
							</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">
								Billing Type
							</p>
							<p className="text-gray-200 capitalize">
								{stripeSuscription.billingType}
							</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-400">
								Stripe Customer ID
							</p>
							<p className="text-gray-200">{license.stripeCustomerId}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export const ViewLicensePage = async ({
	searchParams,
}: {
	searchParams: Promise<{ temporalId: string }>;
}) => {
	const newParams = await searchParams;
	const temporalId = newParams.temporalId;
	const licences = await fetch(
		`${SERVER_LICENSE_URL}/license/all?temporalId=${temporalId}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
	const data = await licences.json();

	if (!data.success) {
		return (
			<div className="flex flex-col gap-4 items-center justify-center mx-auto py-8 px-4">
				<h1 className="text-3xl font-bold text-white mb-8 text-center">
					License Details
				</h1>
				<span className="text-red-500 text-center flex flex-col gap-2">
					{data.error}, Please try again in
					<Link href="/reset-license" className="text-white">
						Reset License
					</Link>
				</span>
			</div>
		);
	}

	console.log(data);

	return (
		<div className="flex flex-col gap-4 items-center justify-center mx-auto py-8 px-4">
			<h1 className="text-3xl font-bold text-white mb-8 text-center">
				License Details
			</h1>
			{data?.licenses?.map((item: any) => (
				<LicenseCard
					key={item.license.id}
					license={item.license}
					stripeSuscription={item.stripeSuscription}
				/>
			))}
		</div>
	);
};

export default ViewLicensePage;
