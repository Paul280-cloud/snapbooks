# PRD v1.1 changes to apply to docs/PRD.md
 
The implementation plan is built from PRD v1.1 **with these changes applied**. Each one answers a row in Section 18 of the plan. Apply them, then set the plan's Status (Section 0) to "Ready to build". Items marked **new wording** are text the plan proposes; change them if you prefer other words, and then change the plan to match.
 
## 1. Change log row (add under v1.0)
 
| Version | Date | Section(s) changed | What changed | Regenerated? |
|---|---|---|---|---|
| v1.1 | 2 Nov 2026 | 2.4, 4.4, 5, 6, 8, 10, 11, 12, 13, 14 | Added BR8 (receipt reader), set-new-password mode on S4, resolved contradictions (S10 name, verify-email banner, export header), defined newest-first, photo path, routes, test tools, Node 24, seed password handling; MASTER.md renamed IMPLEMENTATION_PLAN.md | IMPLEMENTATION_PLAN.md v1.0 |
 
Also change the last line of the file to `*End of SnapBooks PRD v1.1*`.
 
## 2. Edits by section
 
| Section | Change | Plan row |
|---|---|---|
| 2.4 Owner, "Can do" | Replace "edit profile" with "view profile (name and email)" | #4 |
| 8.1 S10 "Purpose" | Replace "Edit name; log out; delete account; Privacy Notice link" with "View name and email (read-only in v1); log out; delete account; Privacy Notice link" | #4 |
| 8.2 S10 | Add: "The display name is shown only if one exists. New users have none and see only their email." | #4 |
| T-US1-1 | Replace the banner text "Check your email to verify your account." with "Check your email and click the link to verify your account." | #5 |
| 5 "Failed log-in attempts" | Replace with: "After too many wrong passwords in a short time (Supabase Auth's sign-in limit): "Too many attempts. Try again in 15 minutes."" | #7 |
| 5 "Stay logged in" | Add: "The app signs the user out on start-up when the last sign-in was more than 30 days ago." | #8 |
| 8.2 S4 | Add a second mode, opened from the reset email link: header "Set new password" (**new wording**), one password field "New password" (**new wording**) with the eye icon and the rule "At least 8 characters, including a number.", primary button "Save password" (**new wording**). After saving, the user is logged in and goes to S5. | #6 |
| 6.1 US2 | Add **T-US2-4:** Given I opened the reset link, when I enter a valid new password and tap "Save password", then I am logged in and see S5. If the password is invalid, the field shows "At least 8 characters, including a number." | #6 |
| 8.2 S3 | After tapping "Resend email", show "Verification email sent." (**new wording**) | #6 |
| 12.2 Error messages | Add a row: Situation "Verification email resent" (success); Exact message "Verification email sent."; What happens next "Message shown on S3" | #6 |
| 6.1 US4-1 and 8.2 S5 | Add: "Newest first means newest receipt date first; receipts with the same date appear with the most recently added first." Change the header count to "{n} receipts", and "1 receipt" for one | #9 |
| 8.2 S8 | Same singular rule for the summary line: "1 receipt found in this range." | #9 |
| 6.1 T-US7-1 and 8.2 S8 note | Replace the column list "Date, Vendor, Category, Amount" with "Date, Vendor, Category, Amount (ZAR)" (matches BR5) | #10 |
| 4.4 BR5 | Add: "Dates are real date cells shown as 12 Mar 2026. Amounts are numbers shown with 2 decimals." | #10 |
| 4.4 | Add **BR8 (new):** "When a photo is chosen, the app reads it in the browser and pre-fills what it can: the vendor is the first line with letters; the amount is the number after the word TOTAL, TOTAL DUE or AMOUNT DUE; the date is the first valid date that is not in the future; the category is pre-filled as Fuel only when the vendor is BP, Engen, Shell, Sasol, Caltex or Total, otherwise it is left blank. Anything it cannot read stays blank. Used by: F2, S6, M1." | #1, #2 |
| 8.2 S6 | Add: "The Uploading state is also shown while the photo is being read. The Upload button on S5 opens the file picker; the chosen file is passed to S6." | #22 |
| 8.2 S7 | Replace "Same as S6, plus Saving and Success" with "Normal, Error, Saving, Success, Offline, Not available ("This receipt is no longer available.")" | #19 |
| 9.1 Look and brand | Add the dot colours for Food, Stock, Rent and Other, taken from the exported S5 design | #18 |
| 10.1 Receipt.photo_url | Replace "URL to file in Supabase Storage" with "Path to the file in the private Supabase Storage bucket (`{owner_id}/{receipt_id}.{ext}`). Photos are shown with signed links valid for 1 hour." | #11 |
| 10.4 Reference and seed data | Replace "a seed script in supabase/seed/" with "seed rows in supabase/seed.sql and a script supabase/seed/seed.js that sets passwords and uploads photos". Replace "Kept in seed script README only" with "Set in the SEED_TEST_PASSWORD environment variable". | #21 |
| 11.1 Stack | Add rows: Routing = React Router; Photo reading = tesseract.js (runs in the browser, files hosted in `public/tesseract/`); Data fetching = @tanstack/react-query; Server functions = Supabase Edge Functions (delete-account); Testing = Jest, React Testing Library, pgTAP, Playwright, secretlint. Change "Node.js 20 LTS" to "Node.js 24 LTS". Change the Version control row to "Save PRD as docs/PRD.md and IMPLEMENTATION_PLAN.md in root". | #1, #3, #12, #13, #17 |
| 11.2 Third-party services | Add a note: "Tesseract.js runs in the browser. No photo or text is sent to any service." | #1 |
| 11.4 Permissions | Add rows: Storage "receipts" / Delete / Owner only / Path must start with their user id. Change User / Delete extra rule to "Done through the delete-account Edge Function, own account only". | #3, #11 |
| 11.5 Environment variables | Add: SEED_TEST_PASSWORD, "Password for the seed test accounts", "You choose it", "Secret: seed script and tests only" | #21 |
| 11.6 Folder structure | Replace with the tree in Section 5 of IMPLEMENTATION_PLAN.md | #12 |
| 11.7 Testing plan | Replace with: "Unit and component tests with Jest and React Testing Library; database and permission tests with pgTAP (`supabase test db`); integration tests with Jest and supabase-js against local Supabase; end-to-end tests with Playwright; manual checks for design, speed and browsers. Every T- criterion has an automated test unless the plan marks it manual." | #13 |
| 12.1 Offline | Replace "Receipt list visible (cached)" with "Receipt list stays visible from memory during the current session" | #14 |
| 8.1 / 12.4 Privacy Notice | Add a note: "The Privacy Notice is a static page at /privacy, not a numbered screen." | #16 |
| 13.4 Milestones M3 | Rename "M3: MASTER.md ready" to "M3: IMPLEMENTATION_PLAN.md ready", file "IMPLEMENTATION_PLAN.md"; also M5 "Test checklist in IMPLEMENTATION_PLAN.md" | n/a |
| 14 and 16 Glossary | Replace MASTER.md with IMPLEMENTATION_PLAN.md | n/a |
| 15 Submission checklist | Peer review row: leave as is | n/a |
 
## 3. Repo README.md
 
Change: Node.js 20 LTS to 24 LTS; "Jest unit tests cover business rules BR1, BR4, BR5 and BR7. All other acceptance criteria are tested manually using the checklist in `MASTER.md`" to a description of the test levels in Section 12.2 of the plan; the `MASTER.md` row in the Documentation table to `IMPLEMENTATION_PLAN.md`; the seed step to `npx supabase db reset` then `npm run seed`.
 