# SCHOLAR's-LINK
### BENBRIDGE INT. — Professional School Management PWA

This project is a working browser/PWA prototype implementing:

- Unique school identity IDs
- Role-based portals
- Administrator identity/user management
- Teacher-to-class assignment
- Accountant fees and transaction portal
- Parent-to-ward linking
- Student-only personal attendance, scores and fee records
- Attendance
- Continuous assessment + examination scores
- Reports
- Announcements
- PWA manifest and service worker
- Responsive desktop/mobile UI
- Local demo persistence
- Role controls: administrators manage users, classes and subjects; teachers post assignments; students submit assignments; accountants record payments and download receipts

## Demo accounts

| Role | Identity | Password |
|---|---|---|
| Administrator | ADM-0001 | Admin@123 |
| Teacher | TCH-1001 | Teacher@123 |
| Accountant | ACC-1001 | Account@123 |
| Parent | PAR-1001 | Parent@123 |
| Student | STU-2001 | Student@123 |

## Run

For the PWA/service worker to work, serve the folder over HTTP/HTTPS rather than opening `index.html` directly.

Examples:

```bash
python -m http.server 5500
```

Then open:

`http://localhost:5500`

You can also deploy the folder to GitHub Pages, Netlify, Vercel, etc.

## Supabase database setup

The production database schema is in [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql).

1. Create a Supabase project.
2. Open **SQL Editor** and run the migration file.
3. Enable Email authentication under **Authentication > Providers**.
4. Create each user in **Authentication > Users**.
5. Insert a matching row into `public.profiles` for each Auth user, using the user's UUID, school identity, full name, role, and email.
6. Add classes, teacher assignments, parent wards, and the initial fee/academic records through the tables.

The browser demo still uses local storage until a Supabase project URL and anon key are configured. Never put a Supabase service-role key in this frontend. Passwords are managed by Supabase Auth and are not stored in the database schema.

## Important production security

This version is intentionally a self-contained front-end prototype so it can run immediately without external credentials.

It is **not appropriate for real student records** because browser localStorage/sessionStorage cannot provide true server-side security. A production BENBRIDGE INT. deployment should use:

1. Supabase Auth or another server-side identity provider.
2. PostgreSQL database.
3. Row Level Security (RLS).
4. Server-side role/permission checks.
5. Secure password hashing handled by the identity provider.
6. Audit logs for sensitive actions.
7. HTTPS.
8. Database backups and recovery.
9. Server-side validation of every request.
10. Separate privileged administration functions.

The intended production database entities are:

- users/profiles
- roles
- permissions
- students
- parents
- parent_wards
- teachers
- classes
- class_teachers
- subjects
- attendance
- assessments
- scores
- fees
- payments
- announcements
- assignments
- submissions
- report_cards
- audit_logs

The frontend already separates the role portals; the next production step is connecting these screens to a secure backend and enforcing the same permissions at database/API level.
