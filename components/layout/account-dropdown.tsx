"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

export function AccountDropdown() {
	const { user, signOut, loading } = useAuth();

	if (loading) {
		return null;
	}

	if (!user) {
		return (
			<Button variant="ghost" size="icon" asChild>
				<Link href="/account">
					<User className="w-5 h-5" />
					<span className="sr-only">Sign In</span>
				</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<User className="w-5 h-5" />
					<span className="sr-only">Account</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>{user.email}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/account">Account</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/account/profile">Profile</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/account/orders">Orders</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={() => signOut()}>
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
