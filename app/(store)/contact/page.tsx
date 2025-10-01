import { Clock, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineChat } from "@/components/chat/inline-chat";
import { APP_CONTACTS } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";
import { SafeHtml } from "@/components/common/safe-html";

export const metadata: Metadata = generateSEO({
	title: "Contact Us",
	description:
		"Get in touch with our team. We're here to help with any questions or concerns.",
	path: "/contact",
});

export default function ContactPage() {
	const fullNameId = useId();
	const emailId = useId();
	const subjectId = useId();
	const messageId = useId();

	return (
		<div className="px-4 py-8 container">
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
					Contact Us
				</h1>

				<div className="gap-12 grid lg:grid-cols-2">
					{/* Contact Form */}
					<div>
						<h2 className="mb-4 font-semibold text-2xl">Send us a message</h2>
						<form className="space-y-6">
							<div className="gap-4 grid md:grid-cols-2">
								<div>
									<label
										htmlFor={fullNameId}
										className="block mb-2 font-medium text-sm"
									>
										Full Name
									</label>
									<Input id={fullNameId} type="text" required />
								</div>
							</div>

							<div>
								<label
									htmlFor={emailId}
									className="block mb-2 font-medium text-sm"
								>
									Email
								</label>
								<Input id={emailId} type="email" required />
							</div>

							<div>
								<label
									htmlFor={subjectId}
									className="block mb-2 font-medium text-sm"
								>
									Subject
								</label>
								<Input id={subjectId} type="text" required />
							</div>

							<div>
								<label
									htmlFor={messageId}
									className="block mb-2 font-medium text-sm"
								>
									Message
								</label>
								<textarea
									id={messageId}
									rows={6}
									className="flex bg-background disabled:opacity-50 px-3 py-2 border border-input rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-background focus-visible:ring-offset-2 w-full placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed"
									required
								/>
							</div>

							<Button
								type="submit"
								size="lg"
								className="w-full"
								variant={"secondary"}
							>
								Send Message
							</Button>
						</form>
					</div>

					{/* Contact Information */}
					<div>
						<h2 className="mb-4 font-semibold text-2xl">Get in touch</h2>
						<p className="mb-8 text-muted-foreground">
							We&apos;d love to hear from you. Send us a message and we&apos;ll
							respond as soon as possible.
						</p>

						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<div className="flex justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
									<Mail className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="font-medium">Email</p>
									<p className="text-muted-foreground">
										{APP_CONTACTS.email.getInTouch}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
									<Phone className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="font-medium">Phone</p>
									<p className="text-muted-foreground">
										{APP_CONTACTS.phone.main}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
									<MapPin className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="font-medium">Address</p>
									<div className="text-muted-foreground">
										<SafeHtml html={APP_CONTACTS.address.office} />
									</div>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex justify-center items-center bg-primary/10 rounded-lg w-10 h-10">
									<Clock className="w-5 h-5 text-primary" />
								</div>
								<div>
									<p className="font-medium">Business Hours</p>
									<p className="text-muted-foreground">
										Mon - Fri: 9:00 AM - 6:00 PM
										<br />
										Sat - Sun: 10:00 AM - 4:00 PM
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Live Chat Section */}
				<div className="mt-12">
					<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
						<div className="text-center mb-8">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
								<MessageCircle className="w-8 h-8 text-blue-600" />
							</div>
							<h2 className="text-3xl font-bold text-gray-900 mb-2">
								Need Immediate Help?
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								Chat with our support team right now! Get instant answers to your questions.
							</p>
						</div>

						<div className="max-w-4xl mx-auto">
							<InlineChat 
								height={500}
								title="Live Support Chat"
								showHeader={true}
								showRefresh={true}
								className="border-2 border-blue-200 shadow-lg"
							/>
						</div>

						{/* Chat Benefits */}
						<div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="text-center p-4 bg-white/50 rounded-lg">
								<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
									<Clock className="w-5 h-5 text-green-600" />
								</div>
								<h3 className="font-semibold text-gray-900 mb-1">Instant Response</h3>
								<p className="text-sm text-gray-600">Get immediate answers to your questions</p>
							</div>
							
							<div className="text-center p-4 bg-white/50 rounded-lg">
								<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
									<Phone className="w-5 h-5 text-blue-600" />
								</div>
								<h3 className="font-semibold text-gray-900 mb-1">Expert Help</h3>
								<p className="text-sm text-gray-600">Connect with knowledgeable support agents</p>
							</div>
							
							<div className="text-center p-4 bg-white/50 rounded-lg">
								<div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
									<Mail className="w-5 h-5 text-purple-600" />
								</div>
								<h3 className="font-semibold text-gray-900 mb-1">Follow-up</h3>
								<p className="text-sm text-gray-600">Receive email transcripts for your records</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
