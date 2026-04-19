<!-- @format -->

# ATION DCA App - Start Here

## Introduction

Welcome to the ATION DCA App project. This Web3 platform will enable seamless user interaction with ATION DCA contracts and accounts, focusing on on-chain functionality (90%) with a high-performance, user-friendly interface.

### Your Role

* **Understand**: Familiarize yourself with the current project state, codebase, and design brief.
* **Develop**: Create features adhering to the defined rules and processes.
* **Document**: Log changes and progress clearly for future reference.

## Rules


1. **Codebase Assessment**
   * Read all existing code in the directory.
   * Assess the state of the codebase to identify incomplete, redundant, or conflicting scripts.
   * Follow the design and coding styles already present.
2. **Avoid Duplication**
   * Do not create repetitive scripts or redundant components.
3. **Document All Changes**
   * Log each change in `/docs/change-log.md`.
   * Use the format:

     ```
     [YYYY-MM-DD HH:mm] : [Action Taken] - [Files Changed]
     ```
4. **Maintain To-Do List**
   * Update the `ToDo` section in this document with completed or new tasks.
5. **UI Standards**
   * Only use **NextUI components**.
   * Adhere to the design brief for styling and functionality.

## To-Do

### Initial Tasks

- [ ] Assess the full project codebase.
- [ ] Understand the contract types in `/types/contracts`.
- [x] Plan migration of the Web3 system to use **App Kit** and **Ethers.js**.

### Development Tasks

- [x] THE ACCOUNT VIEW ISNT WORKINGF NOT LOADING ACCOUNTS
- [x] Remove fund button from strategy in account view, save for strategy view
- [ ] add fud & unfund account button to account card drop down (in account info area? maybe rename to somthing liek actions?)
- [ ] add chip to strategy row of Reinvest if reinvest is active
- [x] ermove manage and anylitic buttons on accounts card
- [ ] if strategy is not active do not show the seconds remianng chip
- [ ] Fix balance info for account
- [ ] remove balance from strategy row
- [ ] add interval chip to strategy row


