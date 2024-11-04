# Smart Split

Smart Split is an innovative receipt expense tracking and splitting application that simplifies expense sharing among users. Built with Next.js, React, TypeScript, Firebase, and Generative AI, it converts receipt images into structured JSON data for automated bill splitting, significantly reducing the need for manual expense tracking.

## Features

- **Automated Receipt Processing**: Upload receipt images, and Smart Split automatically extracts items, prices, and classifications using Generative AI (Google Gemini 1.5 model).
- **Expense Splitting**: Automatically calculates and splits expenses based on item selection
- **User Authentication**: Secure sign-in with Firebase Authentication.
- **Real-Time Updates**: Expenses and updates are synchronized in real-time across users.
- **Customizable Entry Options**: Users can choose between automatic upload and manual entry for flexibility in adding expenses.

## Technology Stack

- **Frontend**: Next.js (with app router), React, TypeScript
- **Backend & Database**: Firebase Authentication, Firebase Realtime Database
- **AI Processing**: Google Generative AI (Gemini 1.5 model) for receipt item extraction
- **Hosting**: Vercel for deployment
- **UI Styling**: Tailwind CSS for responsive design

## Installation

To set up Smart Split locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/WinbertZhang/SmartSplit.git
   cd smart-split
   ```

2. Install Dependencies:

    ```
    npm install
    ```

3. Configure Firebase:

    Set up a Firebase project and add your Firebase configuration in an .env.local file.

4. Run the Application:

    ```
    npm run dev
    ```

The app should now be accessible at http://localhost:3000.

## Contributing

Contributions are welcome! If you’re interested in enhancing Smart Split, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
