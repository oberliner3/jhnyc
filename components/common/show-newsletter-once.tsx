"use client";

import { useEffect, useState } from "react";
import { Newsletter } from "@/components/sections/newsletter";

export function ShowNewsletterOnce() {
	const [show, setShow] = useState(false);

	useEffect(() => {
		try {
			if (typeof window === "undefined") return;
			const visited = localStorage.getItem("visited");
			if (!visited) {
				setShow(true);
				localStorage.setItem("visited", "1");
			}
		} catch {
			// ignore
		}
	}, []);

	if (!show) return null;
	return <Newsletter />;
}
