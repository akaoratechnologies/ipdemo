# Admission Email Note

The Apply for Admission form now prepares an email to:

`principal@ipcollegebsr.org`

Because this website is static, the browser can open an email draft with all application details, but the user must press **Send** in their email app.

For fully automatic background email sending, configure one of these:
- Firebase Cloud Functions + SMTP
- EmailJS public/private service setup
- Custom backend API with Nodemailer/SMTP

Do not place SMTP passwords directly inside frontend JavaScript.
