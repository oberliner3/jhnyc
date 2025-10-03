"use client";

import { Edit, MapPin, Trash2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useFormState } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Address } from "@/lib/types";
import { addAddress, getAddresses } from "./actions";

export default function AddressesPage() {
	const [state, formAction] = useFormState(addAddress, null);
	const [addresses, setAddresses] = useState<Address[]>([]);

	useEffect(() => {
		async function fetchAddresses() {
			const userAddresses = await getAddresses();
			setAddresses(userAddresses);
		}
		fetchAddresses();
	}, []);

	return (
		<div className="px-4 py-8 container">
			<h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
				Manage Addresses
			</h1>
			<div className="gap-12 grid lg:grid-cols-2">
				<div>
					<h2 className="mb-4 font-semibold text-xl">Add New Address</h2>
					<form action={formAction} className="space-y-4">
						<div>
							<Label htmlFor="type">Address Type</Label>
							<Select name="type">
								<SelectTrigger>
									<SelectValue placeholder="Select address type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="shipping">Shipping</SelectItem>
									<SelectItem value="billing">Billing</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="gap-4 grid grid-cols-2">
							<div>
								<Label htmlFor="fullName">First Name</Label>
								<Input id={useId()} name="fullName" />
							</div>
						</div>
						<div>
							<Label htmlFor="address">Address</Label>
							<Input id={useId()} name="address" />
						</div>
						<div className="gap-4 grid grid-cols-3">
							<div>
								<Label htmlFor="city">City</Label>
								<Input id={useId()} name="city" />
							</div>
							<div>
								<Label htmlFor="postalCode">Postal Code</Label>
								<Input id={useId()} name="postalCode" />
							</div>
							<div>
								<Label htmlFor="country">Country</Label>
								<Input id={useId()} name="country" />
							</div>
						</div>
						<Button type="submit">Add Address</Button>
						{state?.message && (
							<p className="text-muted-foreground text-sm">{state.message}</p>
						)}
					</form>
				</div>
				<div>
					<h2 className="mb-6 font-semibold text-xl">Your Addresses</h2>
					<div className="space-y-4">
						{addresses.length > 0 ? (
							addresses.map((addr) => (
								<Card
									key={addr.id}
									className="group hover:shadow-md border-l-4 border-l-primary/20 transition-shadow duration-200"
								>
									<CardHeader className="pb-3">
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-2">
												<MapPin className="w-4 h-4 text-primary" />
												<CardTitle className="text-lg capitalize">
													{addr.type} Address
												</CardTitle>
											</div>
											<Badge
												variant={
													addr.type === "shipping" ? "default" : "secondary"
												}
												className="text-xs"
											>
												{addr.type}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="space-y-3">
											<div className="flex items-start gap-3">
												<div className="flex flex-shrink-0 justify-center items-center bg-primary/10 mt-0.5 rounded-full w-8 h-8">
													<MapPin className="w-4 h-4 text-primary" />
												</div>
												<div className="flex-1 space-y-1">
													<p className="font-medium text-foreground">
														{addr.fullName || `${addr.firstName || ''} ${addr.lastName || ''}`.trim()}
													</p>
													<p className="text-muted-foreground leading-relaxed">
														{addr.address1}
													</p>
													<p className="text-muted-foreground">
														{addr.city}, {addr.zip}
													</p>
													<p className="font-medium text-muted-foreground">
														{addr.country}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-2 pt-2 border-t">
												<Button
													variant="ghost"
													size="sm"
													className="opacity-0 group-hover:opacity-100 px-2 h-8 text-xs transition-opacity"
												>
													<Edit className="mr-1 w-3 h-3" />
													Edit
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="opacity-0 group-hover:opacity-100 px-2 h-8 text-destructive hover:text-destructive text-xs transition-opacity"
												>
													<Trash2 className="mr-1 w-3 h-3" />
													Delete
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							))
						) : (
							<Card className="border-dashed">
								<CardContent className="flex flex-col justify-center items-center py-12 text-center">
									<MapPin className="mb-4 w-12 h-12 text-muted-foreground/50" />
									<h3 className="mb-2 font-medium text-muted-foreground text-lg">
										No addresses saved
									</h3>
									<p className="max-w-sm text-muted-foreground text-sm">
										Add your first address to make checkout faster and easier.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
