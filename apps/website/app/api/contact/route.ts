import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

interface ContactFormData {
	inquiryType: "support" | "sales" | "other";
	name: string;
	email: string;
	company: string;
	message: string;
}

export async function POST(request: NextRequest) {
	try {
		const body: ContactFormData = await request.json();

		// Validate required fields
		if (
			!body.inquiryType ||
			!body.name ||
			!body.email ||
			!body.company ||
			!body.message
		) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 },
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(body.email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 },
			);
		}

		// Determine recipient email based on inquiry type

		// Format email content
		const emailSubject = `[${body.inquiryType.toUpperCase()}] New contact form submission from ${body.name}`;
		const emailBody = `
New contact form submission:

Type: ${body.inquiryType}
Name: ${body.name}
Email: ${body.email}
Company: ${body.company}

Message:
${body.message}

---
Sent from Dokploy website contact form
		`.trim();

		// Send email to Dokploy team
		await resend.emails.send({
			from: "Dokploy Contact Form <noreply@emails.dokploy.com>",
			to:
				body.inquiryType === "sales"
					? ["sales@dokploy.com", "contact@dokploy.com"]
					: ["contact@dokploy.com"],
			subject: emailSubject,
			text: emailBody,
			replyTo: body.email,
		});

		// Send confirmation email to the user
		const confirmationSubject =
			"Thank you for contacting Dokploy - We received your message";
		const confirmationBody = `
Hello ${body.name},

Thank you for reaching out to us! We have successfully received your message and our team will get back to you as soon as possible.

Here's a summary of what you sent us:

Subject: ${body.inquiryType.charAt(0).toUpperCase() + body.inquiryType.slice(1)} inquiry
Company: ${body.company}
Message: ${body.message}

We typically respond within 24-48 hours during business days. If your inquiry is urgent, please don't hesitate to reach out to us directly.

Best regards,
The Dokploy Team

---
This is an automated confirmation email. Please do not reply to this email.
If you need immediate assistance, contact us at contact@dokploy.com
		`.trim();

		await resend.emails.send({
			from: "Dokploy Team <noreply@emails.dokploy.com>",
			to: [body.email],
			subject: confirmationSubject,
			text: confirmationBody,
		});

		return NextResponse.json(
			{ message: "Contact form submitted successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error processing contact form:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
