import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation"; // For redirection
import { toast } from "react-toastify"; // For displaying errors

// Helper function to get the authenticated user
export const getAuthenticatedUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    const router = useRouter();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user); // If user is authenticated, return the user object
      } else {
        toast.error("You need to be logged in to view this page.");
        router.push("/login"); // Redirect to login if user is not logged in
        reject(new Error("User not authenticated")); // Reject if no user is logged in
      }
    });

    // Unsubscribe from the auth state listener when no longer needed
    return () => unsubscribe();
  });
};
