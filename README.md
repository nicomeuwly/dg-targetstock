# Target stock automation project

This project is part of a Bachelor's thesis in Media Engineering at HEIG-VD, in collaboration with Digitec Galaxus AG. The aim of the project is to automate the target stock of Digitec shops. The target stock is a set of products available for purchase directly in the shops. This repository contains the main function, which is to retrieve a list of products from Galaxus using web scraping. This functionality is still under development and is not fully functional. The front-end can be viewed in this repository [github.com/nicomeuwly/dg-targetstock-frontend](https://github.com/nicomeuwly/dg-targetstock-frontend).

### Table of Contents

- [Getting Started](#getting-started)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Getting Started

These instructions will help you set up and run the project on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v20 or higher)
- npm (v10 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nicomeuwly/dg-targetstock.git
   cd dg-targetstock
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server:**

    ```sh
    npm run dev
    ```

    The application should now be running on [http://localhost:3000](http://localhost:3000).

### Project Structure

```
/target-stock-management
│
├── data                        # Scraping route results folder
│   ├── categories.json         # List of scraping categories
│   └── products.json           # List of scraping products
│
├── public                      # Static files
│   └── logo.png                # Logo of the project
│
├── src
│   ├── app                     # Next.js pages and api routes
│   └── lib                     # Library files, including Prisma client and scraping scripts
│       └── scraping
│           ├── categories.ts   # Functions to scrape categories
│           └── products.ts     # Functions to scrape products
│
├── package.json                # Project metadata and dependencies
└── README.md                   # Project documentation
```

### Technologies Used

- **Next.js**: A React framework for server-rendered applications.
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **TypeScript**: A statically typed superset of JavaScript.
- **Puppeteer**: A Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol.
- **cheerio**: A fast, flexible, and lean implementation of core jQuery designed specifically for the server.

### API Endpoints

- **GET /api/data/categories**: Scrapes and returns category data from the Galaxus website.
- **GET /api/data/products**: Scrapes and returns product data based on the categories.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
