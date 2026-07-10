# Firebase Setup — Connected Project

The website package is already wired with this Firebase project:

- Project ID: `ipcollege-6d9ae`
- Auth domain: `ipcollege-6d9ae.firebaseapp.com`
- Analytics ID: `G-RRQCH0E9Q2`

## Required Firebase Console steps

1. Open Firebase Console → Authentication → Sign-in method.
2. Enable **Google** provider.
3. Enable **Email/Password** provider.
4. Open Firestore Database and create a database.
5. Publish the rules from `firebase/firestore.rules`.
6. In Authentication → Settings → Authorized domains, add your live website domain.

After these steps, Google Login and account profile storage will work on the hosted website.


## Firebase Auth environment fix

Do not open the website directly by double-clicking `index.html` when using Firebase Auth. Google login will fail on `file://` URLs.

Use one of these:

- Double-click `start-local-server.bat` on Windows and open `http://localhost:5500/`
- Use VS Code Live Server
- Deploy to Firebase Hosting / Netlify / Vercel and open with `https://`

Also add `localhost`, `127.0.0.1`, and your final domain in Firebase Authentication → Settings → Authorized domains.


## Admission Applications
The admission form writes to the Firestore collection `admissionApplications`. Copy `firebase/firestore.rules` into Firebase Rules if you want this public enquiry form to submit live applications. For production, add stricter validation or admin-only reading.
