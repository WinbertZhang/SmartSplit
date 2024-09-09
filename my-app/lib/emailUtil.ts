import { logInvitation } from './firestoreUtils';

// Example function to send email using a service like SendGrid
export const sendGroupInvitation = async (email: string, groupId: string): Promise<void> => {
  try {
    // Call your email service API (e.g., SendGrid, Nodemailer)
    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "You've been invited to join a group!",
        text: `You've been invited to join a group. Click the link to join: http://localhost:3000//join-group?groupId=${groupId}`,
      }),
    });

    // Log the invitation in Firestore
    await logInvitation(email, groupId);

    console.log(`Invitation sent to: ${email}`);
  } catch (error) {
    console.error('Error sending invitation email:', error);
  }
};
