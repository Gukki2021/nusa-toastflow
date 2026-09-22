# ToastFlow: Platform Overview & ExCo Operations Guide
**NUS Alumni Toastmasters Club (2026/2027)**  
*Live Platform URL*: **[https://nusa-toastflow.vercel.app](https://nusa-toastflow.vercel.app)**  
*Document for ExCo Google Drive Archive & Reference*

---

## 1. Executive Summary & Why We Upgraded

ToastFlow is NUS Alumni Toastmasters Club’s purpose-built meeting planning, role reservation, and program generation platform. 

To support the club’s long-term operations, enhance professionalism, and enable joint ExCo co-management, the platform has undergone a major infrastructure and experience upgrade:
* **Migration to Vercel & Official NUSA Domain**: Moved from a personal GitHub developer URL (`gukki2021.github.io`) to Vercel under our official NUSA domain setup. This delivers global edge performance (with a dedicated Singapore CDN node), instantaneous continuous deployments, and a recognized club web address.
* **ExCo Co-Management**: Shared administrative access and GitHub/Vercel integration so the Club President and ExCo members can collaborate, update, and manage the platform together.
* **100% Word Replica Program Sheet**: The monthly agenda generator now precisely replicates the official Toastmasters Word document layout (2-page print layout, awards ballot on page 2, fixed Menti QR codes, and flexible 3 or 4 speech slots).
* **Mobile-First Experience**: Fully responsive design tailored for smartphones, ensuring members can check dates, reserve roles, and read Pathways materials easily on their mobile screens.

---

## 2. Core Features for Club Members

1. **No-Login Instant Booking**:
   * Members do not need accounts or passwords.
   * Selecting a meeting month and clicking **Reserve a Speech** or **Take role** instantly locks the slot as *Tentative*, preventing double-bookings while VP Education confirms it.
2. **Automatic Roster & Pathways Matching**:
   * Typing a member's name matches against the official club roster, automatically fetching their educational credentials (e.g. `PM1`, `PI4`, `DTM`).
   * Selecting a speech project automatically displays the minimum/maximum speaking duration and project objectives.
3. **Pathways & Member Guide (`reference.html`)**:
   * **Four-Step Member Journey**: Clearly mapped from **Level 1 Ice Breaker Speech** as Step 1, progressing to **Evaluation & Feedback**, **Table Topics & Meeting Functionaries**, and **Level 1 Completion**.
   * **5 Levels & Roles Reference**: Full breakdown of meeting roles and educational series requirements (Successful Club, Better Speaker, and Leadership Excellence series).
   * **Official Resource Links**: One-click links to Base Camp, official project evaluation forms, and downloadable 11-path catalogs.

---

## 3. ExCo Admin Guide (How to Manage Meetings)

### Accessing the Admin Dashboard
1. Visit the platform homepage and click the **Admin** button in the top navigation bar.
2. Enter the ExCo shared passcode: `Toastmasters` *(case-insensitive)*.
3. Select the target meeting month (e.g. *11 Sep 2026*, *9 Oct 2026*, *13 Nov 2026*, *11 Dec 2026*).

### Key Admin Powers
* **Review & Confirm Bookings**: Switch reservations from *Tentative* to *Confirmed* once verified.
* **Direct Role Assignment**: Override, reassign, or assign meeting roles (Toastmaster of the Evening, Table Topics Master, General Evaluator, Timer, Ah-Counter, Grammarian, Evaluators).
* **Speech Slots Control (3 vs. 4 Speeches)**: Toggle between 3 or 4 prepared speech slots depending on special meeting themes or time constraints. The agenda times and objectives table adapt automatically.
* **Meeting Theme & Venue Customization**: Update the meeting title (e.g., *Chapter Meeting*, *Club Officer Installation*) and room location (e.g., *SMU Classroom 2.2*) in one place; updates propagate immediately to the site and the printed sheet.
* **Sergeant at Arms (SAA)**: Designate the 7:30 meeting opener with a single click.

---

## 4. Managing Visiting Toastmasters (Evaluators & Role Holders)

### How to Add & Assign a Visiting Toastmaster:
When inviting external Toastmasters to serve as Speech Evaluators, General Evaluators, or role holders:

1. **Open the Directory**: In the Admin dashboard, click **"👥 Visiting Toastmasters Pool"**.
2. **Add New Profile** (if not already listed):
   * Click **"+ Add Visiting TM"**.
   * Enter their **Full Name**, **Home Club** (e.g., *Toa Payoh Central CC*, *Lion Toastmasters*, *Mizuho TM*), and **Educational Credentials** (e.g., *LP1*, *DTM*).
   * Click **Save to Pool**.
3. **Assign to the Meeting**:
   * Back on the Admin role assignment table, locate the desired role (e.g. *Speech Evaluator 1* or *General Evaluator*).
   * Enter or select the visiting Toastmaster's name.
   * Click **Save**.
4. **Automatic Program Sheet Integration**:
   * The platform recognizes the visiting Toastmaster, tags their home club and credentials, and automatically formats them under the **Visiting Toastmasters** section in the left sidebar of the official Program Sheet.

---

## 5. Generating the Official Program Sheet

Clicking **"📄 Generate Program Sheet"** produces a print-ready document formatted to strict Toastmasters International branding guidelines:
* **Page 1**: Left sidebar with 2026/2027 ExCo roster, Visiting Toastmasters list, PayNow fee QR, Eventbrite guest QR; right table with 7:15–9:55 timed meeting agenda.
* **Page 2**: Awards Ballot (Best Prepared Speech, Best Table Topics, Best Evaluator) with ample voting space, three permanent Mentimeter voting QR codes, Project Objectives table with criteria and timings, and SMU venue map with directions.
* **Export Options**:
  * **🖨 Print / Save as PDF**: Formatted for exact A4 borderless 2-page print.
  * **⬇ Word Export**: Exports as a native `.doc` table document.
  * **✏️ Live Edit**: In-browser inline text tweaking before printing.

---

## 6. Cloud Collaboration & Maintenance Workflow

| Layer | Responsibility | Platform / Tool |
| :--- | :--- | :--- |
| **Meeting Operations** | Role assignment, confirmations, theme & venue updates | ToastFlow Admin Dashboard (Passcode: `Toastmasters`) |
| **Official Records** | Permanent tracking sheet & monthly appointment holders | Google Sheets (`Meeting Appointment Holders`) |
| **Web Hosting & Edge CDN** | Instant deployments, SSL certificate, official NUSA domain | Vercel (`nusa-toastflow`) |
| **Source Code** | Version control, issue tracking, collaborative updates | GitHub (`Gukki2021/nusa-toastflow`) |
| **ExCo Shared Drive** | Guides, meeting minutes, program sheets archive | Club Google Drive (`nusatm@gmail.com`) |

---

*Last Updated: September 2026 · NUS Alumni Toastmasters Club ExCo Team*
