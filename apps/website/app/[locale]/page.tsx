import { CallToAction } from "@/components/CallToAction";
import { Faqs } from "@/components/Faqs";
import { Hero } from "@/components/Hero";
import { PrimaryFeatures } from "@/components/PrimaryFeatures";
import { Testimonials } from "@/components/Testimonials";
import { FeaturesSectionDemo } from "@/components/features";

export default function Home() {
	return (
		<div>
			<main>
				<Hero />
				<FeaturesSectionDemo />
				<PrimaryFeatures />
				<Testimonials />
				<Faqs />
				<CallToAction />
			</main>
		</div>
	);
}
