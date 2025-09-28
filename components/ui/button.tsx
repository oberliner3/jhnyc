import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };

// Preset button wrappers for consistent sizing/spacing across primary flows
// Usage examples:
//   <PrimaryCTA asChild><Link href="/products">Shop Now</Link></PrimaryCTA>
//   <SecondaryCTA onClick={...}>Learn More</SecondaryCTA>
//   <DangerButton onClick={handleDelete}>Delete</DangerButton>
//   <IconButton aria-label="Open cart"><ShoppingCart /></IconButton>

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Large primary call-to-action button.
 * Defaults: variant="default" (primary), size="lg".
 */
export function PrimaryCTA({
	className,
	variant = "default",
	size = "lg",
	...props
}: ButtonProps) {
	return (
		<Button
			variant={variant}
			size={size}
			className={cn(className)}
			{...props}
		/>
	);
}

/**
 * Large secondary call-to-action button.
 * Defaults: variant="secondary", size="lg".
 */
export function SecondaryCTA({
	className,
	variant = "secondary",
	size = "lg",
	...props
}: ButtonProps) {
	return (
		<Button
			variant={variant}
			size={size}
			className={cn(className)}
			{...props}
		/>
	);
}

/**
 * Destructive action button (e.g., delete, sign out confirmations).
 * Defaults: variant="destructive", size="default".
 */
export function DangerButton({
	className,
	variant = "destructive",
	size = "default",
	...props
}: ButtonProps) {
	return (
		<Button
			variant={variant}
			size={size}
			className={cn(className)}
			{...props}
		/>
	);
}

/**
 * Icon-only button with accessible label.
 * Defaults: variant="ghost", size="icon".
 * Remember to include sr-only text inside when used without aria-label.
 */
export function IconButton({
	className,
	variant = "ghost",
	size = "icon",
	...props
}: ButtonProps) {
	return (
		<Button
			variant={variant}
			size={size}
			className={cn(className)}
			{...props}
		/>
	);
}
