import { CallToAction } from "@/components/CallToAction";
import { Faqs } from "@/components/Faqs";
import { Hero } from "@/components/Hero";
import { PrimaryFeatures } from "@/components/PrimaryFeatures";
import { Testimonials } from "@/components/Testimonials";
import { FeaturesSectionDemo } from "@/components/features";
import { Pricing } from "@/components/pricing";
import { RippleDemo } from "@/components/sponsors";
import { StatsSection } from "@/components/stats";

export default function Home() {
	return (
		<div>
			<main>
				<Hero />
				<FeaturesSectionDemo />
				<PrimaryFeatures />
				<StatsSection />
				<Testimonials />
				<div className="w-full relative">
					<Pricing />
				</div>
				<Faqs />
				<RippleDemo />
				<CallToAction />
			</main>
		</div>
	);
}
