import { PlusCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";
import Ripple from "./ui/ripple";

export const RippleDemo = () => {
	const t = useTranslations("HomePage");
	return (
		<div className="mt-20 flex flex-col justify-center gap-y-10 w-full">
			<div className="flex flex-col justify-start gap-4  px-4">
				<h1 className="mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight  text-primary  sm:text-5xl text-center">
					{t("hero.sponsors.title")}
				</h1>
				<p className="mx-auto max-w-2xl text-lg tracking-tight text-muted-foreground text-center">
					{t("hero.sponsors.description")}
				</p>
			</div>
			<div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl">
				<p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
					<Button variant="secondary" className="rounded-full p-0 m-0">
						<PlusCircleIcon className="size-10 text-muted-foreground hover:text-primary transition-colors" />
					</Button>
					{/* <PlusCircleIcon className="size-10 " /> */}
				</p>
				<Ripple />
			</div>
		</div>
	);
};
