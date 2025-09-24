"use client";

import Link from "next/link";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signin } from "./actions";

export default function LoginPage() {
	const emailId = useId();
	const passwordId = useId();

	return (
		<div className="flex justify-center items-center px-4 py-8 container">
			<div className="w-full max-w-md">
				<h1 className="mb-8 font-bold text-3xl lg:text-4xl text-center tracking-tight">
					Login
				</h1>
				<form action={signin} className="space-y-4">
					<div>
						<Label htmlFor={emailId}>Email</Label>
						<Input id={emailId} name="email" type="email" />
					</div>
					<div>
						<Label htmlFor={passwordId}>Password</Label>
						<Input id={passwordId} name="password" type="password" />
					</div>
					<Button type="submit" className="w-full">
						Login
					</Button>
				</form>
				<p className="mt-4 text-muted-foreground text-sm text-center">
					Don&apos;t have an account?{" "}
					<Link href="/account/register" className="underline">
						Register
					</Link>
				</p>
			</div>
		</div>
	);
}
