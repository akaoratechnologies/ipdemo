# I.P. (P.G.) College Campus-2 Website — Organized Structure

This package is reorganized for clean development and hosting.

## Folder structure

```text
index.html                  # Main homepage, kept outside the html folder
html/                       # All inner HTML pages
css/styles.css              # Website stylesheet
js/script.js                # Website interactions, live time/weather and portal UI
js/js/firebase-config.js       # Firebase project config and enable flag
assets/                     # Images, SVG visuals and official logo/campus assets
firebase/firebase/firestore.rules    # Firestore security rules starter file
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
js/js/firebase-config.js
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
