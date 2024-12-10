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
- [ ] Plan migration of the Web3 system to use **App Kit** and **Ethers.js**.

### Development Tasks

- [ ] Integrate real data into `PairsView` and `CreateStrategyModal`.
- [ ] Enhance error handling and logging across components.
- [ ] Implement manage and analytics functionality in `AccountsView`.
- [ ] Replace mock data in `PairsView` with actual data from the backend.
- [ ] Ensure all modals handle transactions and errors gracefully.
- [ ] Review and optimize state management using React Context or Zustand.
- [ ] Conduct a thorough code review to ensure adherence to the design brief and coding standards.
- [ ] Document any additional changes in `/docs/change-log.md`.


