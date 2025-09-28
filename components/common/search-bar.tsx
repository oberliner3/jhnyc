"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ className = "" }: { className?: string }) {
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?q=${searchQuery.trim()}`);
		}
	};

	return (
		<form onSubmit={handleSearch} className={`relative ${className}`}>
			<Input
				type="search"
				placeholder="Search products..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="pr-10"
			/>
			<Button
				type="submit"
				size="icon"
				variant="ghost"
				className="top-0 right-0 absolute px-3 h-full"
			>
				<Search className="w-4 h-4" />
				<span className="sr-only">Search</span>
			</Button>
		</form>
	);
}
