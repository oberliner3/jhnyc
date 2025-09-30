"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { countries } from "@/lib/countries";
import { Label } from "@/components/ui/label";

export interface CountrySelectorProps {
	value: string;
	onValueChange: (value: string) => void;
	error?: string;
}

export function CountrySelector({
	value,
	onValueChange,
	error,
}: CountrySelectorProps) {
	const [open, setOpen] = React.useState(false);
	const selectedCountry = countries.find((country) => country.code === value);

	return (
		<div className="flex flex-col gap-1.5">
			<Label
				htmlFor="country-trigger"
				className={cn(error && "text-destructive")}
			>
				Country/Region
			</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						id="country-trigger"
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className={cn(
							"w-full justify-between h-10",
							error && "border-destructive",
							!value && "text-muted-foreground",
						)}
					>
						{selectedCountry ? (
							<span className="flex items-center gap-2">
								{selectedCountry.emoji} {selectedCountry.name}
							</span>
						) : (
							"Select country"
						)}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search country..." />
						<CommandEmpty>No country found.</CommandEmpty>
						<CommandGroup className="max-h-[300px] overflow-auto">
							{countries.map((country) => (
								<CommandItem
									key={country.code}
									value={country.name}
									onSelect={() => {
										onValueChange(country.code);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value === country.code ? "opacity-100" : "opacity-0",
										)}
									/>
									<span className="flex items-center gap-2">
										{country.emoji} {country.name}
										<span className="text-muted-foreground ml-auto">
											{country.code}
										</span>
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
			{error && <span className="text-sm text-destructive">{error}</span>}
		</div>
	);
}
