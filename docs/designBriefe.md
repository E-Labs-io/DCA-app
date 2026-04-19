<!-- @format -->

# ATION

# Distrubuted Cost Average


:::tip
START WITH ‘START-HERE.MD’

:::

## Project Overview

Develop a **Decentralized Cost Average (DCA) Platform** website that interacts seamlessly with the existing smart contracts. The website should align with the crypto and Web3 aesthetic, providing users with intuitive interfaces to create and manage DCA accounts, strategies, and reinvestments. Utilize **Next.js** (with App Router), **TypeScript**, **NextUI** (with Tailwind CSS), and **Alchemy** for Web3 API integration.


:::info
The smart contract have been deployed and can be interacted with now. For all contract data structures and types check out the @contracts folder in /types/contracts

:::


:::info
There is already alot of code in the repository, please feel free to remove what is not needed. But stick to the style we have created.

:::

## Technology Stack

* **Frontend Framework:** Next.js (App Router)
* **Language:** TypeScript
* **UI Library:** NextUI with Tailwind CSS
* **Web3 Integration:** Ethers.js with Alchemy API
* **Wallet Integration:** Web3Modal or WalletConnect ecosystem
* **Backend Services:** Next.js API Routes
* **State Management:** React Context or Zustand
* **Analytics & Tracking:** Google Analytics or similar

## Project Structure

```bash
project-root/
├── components/ # Reusable UI components
├── app/
│ ├── api/ # API Routes for backend interactions
│ ├── layout.tsx # Main layout component
│ ├──  page.tsx # Single entry point for the SPA
│ └── index.tsx # Home Page
├── components/ # Set of constants to hjelp the app run
│ ├── views/ # API Routes for backend interactions
│ │ ├── AccountAnalytics.tsx # Main layout component
│ │ ├── AccountsView.tsx # Main layout component
│ │ ├── PairsView.tsx # Main layout component
│ │ └── StrategyList.tsx # Main layout component
│ └──ui/ # Individual reusable ocmponents
├── constants/ # Set of constants to hjelp the app run
├── configs/ # Configs for the app and website
├── docs/ # Documents for the APP
├── hooks/ # Hooks for the APP
├── public/ # Static assets
├── types/ # TypeScript type definitions
│ └── Contracts/ # All types, data structures and interfaces for contracts
├── styles/ # Global and component-specific styles
├── utils/ # Utility functions and helpers
├── .env # Enviromental/Config Vars
├── next.config.js # Next.js configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json # TypeScript configuration
└── package.json # Project dependencies and scripts
```

## Pages to Build

### 1. App Page

**Path**: `/`

**Features**:

* **Single-Page Application (SPA):**
  * Consolidate all functionalities into one page for a seamless user experience.
* **Account Management:**
  * Create a DCA Account
  * Manage existing accounts
  * Update account reinvest library address
  * Change Executor
* **Strategy Management:**
  * Create & Fund Strategy
  * Subscribe to Executor
  * Monitor Analytics of Strategies
  * Manage Reinvestments
* **UI Enhancements:**
  * Option to view strategies by Account or by Trading Pairs (switchable)
  * Real-time feedback and transaction status updates

## User Interaction Flows

### Creating a DCA Account


1. **User Action:** Click on the "Create DCA Account" button.
2. **Connect Wallet:** Prompt the user to connect their Web3 wallet using Web3Modal or WalletConnect.
3. **Submit Transaction:** Call the `createDCAAccount` function from the DCAFactory contract.
4. **Transaction Feedback:** Display transaction status (pending, confirmed, failed).
5. **Confirmation:** Show the new DCA Account address and update the UI to reflect the new account.

### Managing Strategies


1. **User Action:** Select an existing DCA Account from the dashboard.
2. **View Strategies:** Display a list of active and inactive strategies associated with the account.
3. **Create Strategy:** Click on "Create Strategy" to initiate a new strategy.
4. **Fill Strategy Details:** Provide parameters like base token, target token, investment amount, interval, etc.
5. **Submit Transaction:** Call the `createStrategy` function.
6. **Transaction Feedback:** Show status updates.
7. **Confirmation:** Update the strategies list with the new strategy.

## On-Chain Analytics

* **Account Discovery:** Use event filtering to identify accounts created by the user's wallet.
* **Strategy Discovery:** Filter events to list strategies associated with a DCA account.
* **Execution Data:** Track strategy execution events to gather data on performance, last execution, and amounts executed.

## UI/UX Design Guidelines

* Theme:
  * Utilise NextUI Theam and Component library
  * Color Palette: Utilize dark shades with vibrant accent colors (e.g., neon blues and greens) to reflect the crypto aesthetic.
  * Typography: Use modern, sans-serif fonts with clear readability. Highlight important elements with bold fonts.
  * Spacing: Maintain consistent padding and margins for a clean layout.
* Component States:
  * Buttons:
  * Default: Solid color with clear labeling.
  * Hover: Slight brightness increase or underline.
  * Loading: Display a spinner within the button.
  * Disabled: Gray out with no hover effects.
* Forms:
  * Input Fields: Clear labels, validation messages, and error highlighting.
  * Submission: Real-time validation feedback before allowing submission.
* Notifications:
  * Success: Green banners or toasts.
  * Error: Red banners or toasts.
  * Info: Blue banners or toasts.

## Backend Services

### 1. API Routes

Utilize Next.js API routes to handle interactions with smart contracts securely. Remember that on-chain actions (getters and setters) will be handled through a Web3 provider.

 \n **Examples**:

* POST /api/create-account
* POST /api/create-strategy
* POST /api/subscribe-executor
* GET /api/strategy-analytics
* POST /api/manage-reinvest

### 2. Smart Contract Interaction

* Use **Ethers.js** to interact with the smart contracts.
* Integrate **Alchemy** as the Web3 provider for reliable and scalable blockchain interactions.
* Handle read and write operations securely, ensuring proper error handling and user feedback.

### 3. Authentication & Authorization

* Implement wallet-based authentication using a Web3 provider library such as **Web3Modal** or the **WalletConnect** ecosystem.
* Support multiple network connections and ensure the app detects the active network to load the correct provider and accounts.
* Protect API routes to ensure only authorized users can perform certain actions.

## State Management

Use **React Context** or **Zustand** for managing global state such as user authentication status, connected wallet information, and active DCA accounts.

## Smart Contract Interactions

To interect with the DCA smartcontract system the app will need to know the contract functions ABI’s allowing it to understand the parimiters passed to functions, the type of function and what/if it should expect a responce.

### Contracts


1. **DCAFactory**: Responsible for creating new DCA accounts.
2. **DCAAccount**: Manages individual DCA accounts and strategies.

### Function Details

#### DCAFactory

* **createDCAAccount**:
  * **Description:** Creates a new DCA Account.
  * **Parameters:** User's wallet address, initial configuration parameters.
  * **Returns:** Address of the newly created DCA Account.

#### DCAAccount

* **createStrategy**:
  * **Description:** Creates a new investment strategy.
  * **Parameters:** Strategy details including tokens, amounts, intervals.
  * **Returns:** Strategy ID.
* **setStrategyReinvest**:
  * **Description:** Sets reinvestment parameters for a strategy.
  * **Parameters:** Strategy ID, reinvestment details.
  * **Returns:** None.

# Analytics & Tracking

Integrate **Google Analytics** or a similar service to track user interactions and engagement on website BUT re requier a custom onChain data tracking systemt to allow for Account, Strategy and Wallet statistics

Monitor key metrics such as:

* Number of DCA accounts created
* Active strategies
* Transaction volumes
* User retention rates

## Deployment

* Deployment the Next.js application wil be on **Vercel**.
* Ensure environment variables are securely managed in the deployment platform.
* Set up continuous integration and deployment pipelines for seamless updates.

## Additional Features

* **User Profiles:** Allow users to view and edit their profile information.
* **Notifications:** Implement in-app notifications for important events (e.g., transaction confirmations).
* **Help & Support:** Provide a help section or FAQ to assist users.
* **Dark Mode Toggle:** Allow users to switch between light and dark themes.

## Best Practices

* **Responsive Design:** Ensure all components are mobile-friendly.
* **Performance Optimization:** Optimize images and assets for faster load times.
* **Accessibility:** Follow accessibility standards to make the website usable for everyone.
* **Code Quality:** Maintain clean and well-documented code for easy maintenance.

## Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [Ethers.js Documentation](https://docs.ethers.io/)
* [NextUI Documentation](https://nextui.org/docs)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [Alchemy Documentation](https://docs.alchemy.com/)
* [Google Analytics](https://analytics.google.com/)
* [AppKit with Ethers for web3 provider and componetns](https://docs.reown.com/appkit/overview)
* [NextUI](https://nextui.org/docs/)

# NOTES:

* There should NOT be sub pages for the App. The App should be a 1-page app with everything that you need to do within it. It should be a beautiful UI that easily allows users to view, manage, and create DCA Accounts and Strategies. These should be shown by Account or by trading pairs (switchable).
* We should use a Web3 provider library to integrate a wallet connection/management system. This could be the Web3Modal or the WalletConnect ecosystem. It needs to allow the user to connect to multiple networks and the App needs to know which one they are on to load the correct provider/accounts.
* The Next.js project should be set up in an App Router format.
* \


