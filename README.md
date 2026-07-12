# AssetFlow - Odoo Hackathon 2026 InnovateX

Hey everyone! This is my project for the Odoo Hackathon 2026 InnovateX. It's called AssetFlow and it helps you track and manage company assets. 

I started with a basic setup and ended up building a complex dashboard with a super UI! Everything works end-to-end, from the frontend all the way to the local database.

## What I Built (Step-by-Step)

* **Super UI / UX:** The design is based directly on the strict "Tag-and-Stamp" design spec. It's not just a basic HTML file! I used React (Vite) to make the dashboard fast and complex. I also added cool micro-animations—so when you hover over cards or change a status, it actually feels like a physical stamp hitting the screen.
* **Working Functionality:** The dashboard is fully functional. You can click "Register Asset" to add new items to the database instantly. You can also click on any asset to change its status (like allocating it to someone or sending it for maintenance). The UI updates in real-time.
* **Creative Features (Physical Bridge & Audit Trail):** 
  * **Dynamic QR Codes:** Every asset automatically generates a unique, scan-able QR Code in the dashboard. 
  * **Asset Journey Timeline:** A beautiful vertical timeline tracks the entire history of an asset (when it was registered, allocated, maintained, etc.) right inside the modal.
* **Local Database Setup:** Because we shouldn't rely on cloud tools or internet for this hackathon, I set up a local offline SQLite database using Prisma. 
* **Backend APIs:** I created a Node.js Express backend to connect the React UI to the local database.

## Tech Stack Used
* **Frontend:** React, Vite, CSS
* **Backend:** Node.js, Express
* **Database:** SQLite (local offline), Prisma ORM

## How to run the project

It is really easy to test this out. Just open your terminal and follow these steps:

1. Install the required packages:
```bash
npm install
cd client && npm install
cd ..
```

2. Run both the backend and frontend at the same time using this one command:
```bash
npm run dev
```

3. Open the link it gives you in the terminal (usually `http://localhost:5173` or `5174`) and the dashboard will load up!

*(Optional: If you want to connect to the database directly and see the tables, just run `npx prisma studio` in your terminal!)*
