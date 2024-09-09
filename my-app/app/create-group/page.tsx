"use client";

import { useState } from "react";
import { createGroup } from "@/lib/firestoreUtils"; // Firestore utility for creating groups
import { auth } from "@/lib/firebaseConfig";
import { sendGroupInvitation } from "@/lib/emailUtil"; // Email service for sending invitations

// Define the component
export default function CreateGroup() {
  const [groupName, setGroupName] = useState<string>(""); // Track group name
  const [memberEmails, setMemberEmails] = useState<string[]>([]); // Track list of member emails
  const [newMemberEmail, setNewMemberEmail] = useState<string>(""); // Track new email input

  // Function to add a new member email to the list
  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      setMemberEmails((prevEmails) => [...prevEmails, newMemberEmail.trim()]); // Add email to the list
      setNewMemberEmail(""); // Clear input after adding
    }
  };

  // Function to handle group creation
  const handleSubmit = async () => {
    const user = auth.currentUser;
    
    if (user && groupName.trim()) {
      const adminId: string = user.uid;

      // Add the admin's UID to the members list and remove duplicates
      const memberUids: string[] = [adminId]; // The group creator is always a member
      try {
        // Create group with admin as a member and get the groupId
        const groupId = await createGroup(groupName, adminId, memberUids);

        if (!groupId) {
          throw new Error("Failed to create group. Group ID is missing.");
        }

        // Send invitation emails to all added members
        await Promise.all(
          memberEmails.map(async (email) => {
            await sendGroupInvitation(email, groupId); // Call the email service to send invitations
          })
        );
      } catch (error) {
        console.error("Error creating group:", error);
        alert("An error occurred while creating the group. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl mb-6">Create a New Group</h1>

      {/* Input for group name */}
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="p-2 bg-gray-800 text-white rounded mb-4"
      />

      {/* Add new member input */}
      <div className="flex mb-4">
        <input
          type="email"
          placeholder="Member Email"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
          className="p-2 bg-gray-800 text-white rounded-l"
        />
        <button onClick={handleAddMember} className="bg-blue-500 p-2 rounded-r">
          Add Member
        </button>
      </div>

      {/* List of added members */}
      <ul className="mb-4">
        {memberEmails.map((email, idx) => (
          <li key={idx} className="text-white">
            {email}
          </li>
        ))}
      </ul>

      {/* Submit button to create the group */}
      <button onClick={handleSubmit} className="bg-green-500 p-2 rounded mt-4">
        Create Group and Invite Members
      </button>
    </div>
  );
}
