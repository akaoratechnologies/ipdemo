# Firebase Auth Localhost Fix

Firebase Google Login cannot run when the site is opened directly as a local file, for example:

`file:///C:/.../index.html`

It must run on one of these protocols:

- `http://`
- `https://`
- `chrome-extension://`

## Quick Windows fix

1. Extract the ZIP.
2. Double-click `start-local-server.bat`.
3. Open this URL in Chrome/Edge:

`http://localhost:5500/`

Then open `student-login.html` or `teacher-login.html` and try Google login.

## VS Code fix

Install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

## Firebase Console checklist

In Firebase Console:

1. Go to Authentication → Sign-in method.
2. Enable Google Provider.
3. Enable Email/Password Provider.
4. Go to Authentication → Settings → Authorized domains.
5. Add:
   - `localhost`
   - `127.0.0.1`
   - your final website domain
6. Enable Firestore Database.
7. Publish the Firestore rules from `firebase/firestore.rules`.

## Browser storage

Do not block cookies/local storage for this site. Firebase Auth needs web storage enabled.
