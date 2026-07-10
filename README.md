# I.P. (P.G.) College Campus-2 Website — Organized Structure

This package is reorganized for clean development and hosting.

## Folder structure

```text
index.html                  # Main homepage, kept outside the html folder
html/                       # All inner HTML pages
css/styles.css              # Website stylesheet
js/script.js                # Website interactions, live time/weather and portal UI
js/firebase-config.js       # Firebase project config and enable flag
assets/                     # Images, SVG visuals and official logo/campus assets
firebase/firestore.rules    # Firestore security rules starter file
docs/                       # Firebase and localhost setup guides
start-local-server.bat      # Windows local server launcher
start-local-server.command  # macOS local server launcher
```

## How to run

Do not open the site directly with `file://` because Firebase Auth does not work on direct file open.

### Windows
Double-click:

```text
start-local-server.bat
```

Then open:

```text
http://localhost:5500/
```

### macOS
Run:

```bash
./start-local-server.command
```

Then open:

```text
http://localhost:5500/
```

## Firebase

Firebase config is already placed in:

```text
js/firebase-config.js
```

Enable these services in Firebase Console:

- Google Authentication
- Email/Password Authentication
- Firestore Database
- Analytics

Also add these authorized domains in Firebase Authentication settings:

- localhost
- 127.0.0.1
- your final live domain

## Notes

- All inner page links have been updated to use the `html/` folder.
- Assets, CSS, JavaScript and Firebase files are connected correctly from both homepage and inner pages.
- The homepage remains `index.html` in the root folder.


## Mobile top strip behavior
On desktop, the contact/time/weather strip remains at the top. On mobile/tablet, it is hidden from the page top and appears inside the hamburger menu for a cleaner first screen.


## Copyright Footer
All pages include: © 2026 I.P. (P.G.) College Campus-2, Bulandshahr. All Rights Reserved.


## Image Update
- Department, courses, gallery, library, sports and placement visuals now use PNG image files instead of SVG illustrations.
- WebP references were replaced with PNG image paths for easier editing in normal design tools.
- SVG is still used only for small interface icons inside the navigation/buttons, not for department images.

## Department Image Update
The latest version uses the provided PNG image files for the relevant department visuals:
- Computer Science / BCA
- Business Administration / BBA
- Commerce
- Bio-Technology
- Science & Mathematics
- Teacher Education

These PNG files are used across the homepage department cards, departments page, courses page, placement/library/gallery references where relevant.


## Admission Application Feature
- Added `html/apply-admission.html` for student admission applications.
- Students can fill name, Gmail, phone number, WhatsApp number, course and basic details.
- The form saves to Firestore collection `admissionApplications` when Firebase is running on localhost/live hosting.
- If Firebase is unavailable, the form stores demo submissions in browser localStorage for testing.
- Homepage includes the founders/heritage image and establishment/affiliation details.
- Top accreditation strip updated to show only: NAAC Accredited "B" Grade and ISO 9001:2015 / ISO 14001:2015 certification.


Update: NAAC clickable gallery added with 9 uploaded photos in `assets/naac-gallery/`, visible on NAAC page and Gallery page.

Update: NAAC gallery has been moved above the recognition/affiliation information cards on the NAAC page.

Update: Contact page updated with official Campus-2 address, email, website, social media and telephone directory.

Update: Student Dashboard now includes editable student profile update form with local storage and Firebase-ready saving.

Update: Student profile form now opens only after clicking Update Profile. Navbar now auto-detects student/teacher login and shows the user's name with only Log out option.

Update: Phone number and WhatsApp fields now accept digits only and require exactly 10 digits.

Update: Dropdown menus now open on click, close on outside click/Escape, and work on mobile and desktop.

Update: Clean URL folder conversion reverted. Website restored to original `/html/page.html` structure with clickable dropdown and validation updates preserved.

Update: Apply for Admission page is manual-only now. Google fill button removed and 10th/12th percentage fields added.

Update: Apply Now button prepares an email to principal@ipcollegebsr.org with all admission details. Static frontend opens an email draft; fully automatic sending needs backend/EmailJS/SMTP setup.
