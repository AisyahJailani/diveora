# DIVEORA - Car Rental Management System

IMS566 Advanced Web Design Development and Content Management (Individual Assignment).

DIVEORA is a front-end car rental management prototype. It shows fleet status, bookings, analytics and a booking calendar with charts and tables. Two colours are used: burgundy `#5a1a2e` and gold `#c9973f`.

## Project Links
- Live website (GitHub Pages): https://USERNAME.github.io/diveora/
- GitHub repository: https://github.com/USERNAME/diveora

## Features
- **Login page** ("Welcome Back, Admin") with hardcoded credentials and error feedback (no register page). A light / dark button sits in the top-left corner of the sign-in box. Logged-out users are sent back to the login page.
- **Navigation**: side panel (slides in on mobile, Logout is in the side panel), top bar with notifications, theme switch and user name (click it to see the account e-mail), and a skip-to-content link.
- **Dashboard**: date, greeting by time of day, 4 KPI cards, 6 Chart.js charts and a recent bookings table.
- **Cars page**: car photos (WebP), search, type/status filters, Add Car button (popup form, saved in the browser) and Delete car (for cars added with Add Car), details popup, vehicle maintenance flow (Set Maintenance > Update Details > Complete Maintenance > Set Available), maintenance history, maintenance log (Open and Delete; only finished records can be deleted) and 2 charts.
- **Customers page**: table or card view, search, status filter, sort, pagination, View / Edit / Delete, CSV export, 3 charts and a booking calendar. **Add booking** button (book a car for a new or existing customer, with overlap check, automatic total and payment method), **Receive payment** for pending bookings and a **printable payment receipt** inside View.
- **Analytics page**: period filter (30 days / 90 days / this year), 8 KPIs, auto insights, 14 charts, model and customer ranking tables and CSV export.
- **Articles page**: search, category filter and Read more popup.
- **Settings page**: display name, light / dark mode, notification badge on/off, reset saved data and system information.
- **Notifications**: dropdown with unread badge, click to read in a popup, mark all as read and clear all.
- **Light / dark mode**: remembered between visits, and charts recolour automatically.
- **Footer**: quick links, system details, contact, Privacy Policy / Terms popups and back to top.
- **Content management**: metadata (description, keywords, Open Graph, theme colour) and one `<h1>` on every page. Car photos are WebP; the logo and illustration are SVG.
- **Responsive design** for desktop, tablet and mobile, tested in Google Chrome.

## How to Test Login
| Username | Password |
|---|---|
| `aisyah` | `Ims@566` |

Steps:
1. Open the live website link above in Google Chrome.
2. The username and password are already filled in on the login page. Click **Sign in**.
3. To test the error message, change the username or password to a wrong value and click **Sign in**. The message "Invalid username or password" will appear.
4. Use **Logout** in the side panel to sign out. Opening any other page while logged out sends you back to the login page.

The password is case-sensitive.

## Important Notes
- **Simulated login only.** Authentication is a front-end simulation (hardcoded credentials and `sessionStorage`). There is no server or database, so it is not meant for real security.
- **Saved data.** Settings, theme, notifications, added cars, maintenance records and customer edits are stored in the browser (`localStorage`). They stay on your own device only. To go back to the original sample data, open **Settings > Reset saved data**.
- **Internet connection required.** Bootstrap, Bootstrap Icons, Chart.js and Google Fonts are loaded from CDN, so the site needs internet to display correctly.
- **Sample data.** All names, phone numbers, bookings and prices are sample data generated for demonstration. Booking dates are generated relative to today's date, so figures on the dashboard can change from day to day.

## Frameworks / Libraries
- Bootstrap 5.3
- Bootstrap Icons
- Chart.js 4
- IBM Plex Sans (Google Fonts)
- Vanilla JavaScript (no other framework)

## Project Structure
```
index.html        Login page
dashboard.html    Dashboard
cars.html         Cars / fleet and maintenance
customers.html    Customers, bookings and calendar
analytics.html    Analytics
articles.html     Articles
settings.html     Settings
css/style.css     All custom styles
js/data.js        Sample data, maintenance records, customer changes
js/app.js         Login, theme, side panel, top bar, footer, notifications
js/pages.js       Dashboard and Analytics
js/cars.js        Cars page
js/customers.js   Customers page
js/articles.js    Articles page
js/settings.js    Settings page
images/           Car photos (.webp), logo.svg and hero.svg
```

## Deployment
Hosted with GitHub Pages (branch `main`, root folder).