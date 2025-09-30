"use client";
import { useAuth } from "@/contexts/auth-context";
import React from "react";

export default function AuthStatus() {
	const { user, session, loading, error } = useAuth();

	if (loading) {
		return (
			<div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
				<div className="flex items-center">
					<div className="mr-2 border-b-2 border-blue-600 rounded-full w-4 h-4 animate-spin"></div>
					<span className="text-blue-800">Loading authentication...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 p-4 border border-red-200 rounded-lg">
				<div className="text-red-800">
					<strong>Auth Error:</strong> {error.message}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-green-50 p-4 border border-green-200 rounded-lg">
			<h3 className="mb-2 font-semibold text-green-800">
				🔐 Authentication Status
			</h3>
			<div className="space-y-1 text-sm">
				<div>
					<strong>User:</strong> {user ? user.email : "Not signed in"}
				</div>
				<div>
					<strong>Session:</strong> {session ? "Active" : "None"}
				</div>
				<div>
					<strong>Loading:</strong> {loading ? "Yes" : "No"}
				</div>
				{user && (
					<div>
						<strong>User ID:</strong> {user.id}
					</div>
				)}
			</div>
		</div>
	);
}
