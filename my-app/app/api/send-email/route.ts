import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Set your SendGrid API key from the environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text } = await req.json(); // Extract email data from the request body

    if (!to || !subject || !text) {
      return NextResponse.json({ error: 'Missing email data' }, { status: 400 });
    }

    // SendGrid email message format
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL || '', // Ensure this email is verified in SendGrid
      subject,
      text,
    };

    // Send email using SendGrid
    await sgMail.send(msg);

    // Return a success response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
