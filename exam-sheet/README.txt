FIN368 Exam Spreadsheet
=======================

WHAT THIS IS
------------
A self-hosted, single-page web spreadsheet for use during FIN368 exams
under Respondus LockDown Browser. It supports the financial functions
on your formula sheet (NPV, IRR, PMT, PV, FV, RATE, NPER, plus STDEV,
CORREL, VAR for the diversification formula), three sheets, copy/paste,
fill-down, and standard formatting. It exists so students don't have to
go to a third-party online spreadsheet that could change features or
add an "Ask AI" button overnight.

The page is fully self-contained — every script, stylesheet, font, and
image is in the vendor/ folder. After the page loads once, it makes
zero outbound network calls. Students cannot use it as a chat box.

WHAT'S IN THIS FOLDER
---------------------
  index.html       - the page itself (banner + spreadsheet)
  exam-sheet.css   - banner styling, print rules
  exam-sheet.js    - boots Luckysheet, wires CSV/Print buttons, self-test
  vendor/          - frozen copy of Luckysheet 2.1.13 (Apache-2.0)
  README.txt       - this file

DEPLOY ONCE: GITHUB PAGES
-------------------------
1. Create a free GitHub account if you don't have one.
2. Create a new public repo, e.g. `fin368-examsheet`.
3. Upload everything in this folder to the repo (including vendor/).
   The simplest way: zip the folder, drop it into github.com via the
   "Add file → Upload files" button.
4. In the repo, go to Settings → Pages.
   Under "Build and deployment", set Source = "Deploy from a branch",
   Branch = "main" / root.
   Save. After ~1 minute the page is live at:
       https://<your-username>.github.io/fin368-examsheet/
5. Open that URL in any browser to confirm it loads.

ADD IT TO A RESPONDUS-LOCKED EXAM IN CANVAS
-------------------------------------------
1. In your Canvas exam, paste the URL into the question text or the
   exam instructions, exactly the way you do today with the third-party
   spreadsheet. Tell students "click here to open the exam spreadsheet."
2. In the same exam, open the Respondus LockDown Browser dashboard
   (Canvas left nav → "LockDown Browser") and find this exam.
3. Click "Settings" or the pencil icon for the exam.
4. Under "Advanced Settings" (or similar; wording varies by Respondus
   version), enable the option to allow access to specific web domains.
5. Add this domain to the allowed list:
       <your-username>.github.io
   That's the GitHub Pages domain. It's enough — Respondus matches
   subdomains.
6. Save.

VERIFY IT WORKS BEFORE EXAM DAY
-------------------------------
The single most important step. Do this at least 24 hours before
your first real exam:

a. Open the page in a regular browser (Chrome). Confirm the spreadsheet
   loads and the toolbar appears.

b. Run the built-in self-test. Append `?selftest=1` to the URL:
       https://<your-username>.github.io/fin368-examsheet/?selftest=1
   A panel opens showing each function, its formula, expected value,
   computed value, and OK/FAIL. All should be OK. If anything FAILs,
   stop and email me before relying on it for an exam.

c. Test like a student. Type cash flows in A1:A5 and try:
       =NPV(0.1, A1:A5)
       =IRR(A1:A5)
       =PMT(0.05/12, 360, -200000)
   The numbers should match Excel. Drag fill-down. Copy a range.
   Switch to Sheet2 and paste. Click Download CSV — open the file
   in Excel.

d. Air-gap check. Open DevTools (Ctrl+Shift+I), go to the Network
   tab, reload the page, then type and compute for a couple minutes.
   After the initial asset load, no new network requests should
   appear. (If any do, stop.)

e. Lockdown dry run. From a separate practice quiz in Canvas with
   Respondus enabled, paste the URL into the quiz, add the domain
   to the allowlist as above, then take the quiz IN the LockDown
   Browser (not Chrome). Confirm the page loads, formulas work,
   and there is no "back to web" exit.

WHAT STUDENTS SEE
-----------------
A blue banner at the top with a "Local to this tab. Refresh or close
= lost. Use Print or Download CSV to keep your work." caveat, and
two buttons: Download CSV and Print. Below it, a familiar Excel-like
grid with three sheet tabs (Sheet1, Sheet2, Scratch).

The toolbar has only the buttons relevant to a finance exam: undo/redo,
formatting (currency, percent, decimals, font, color, borders, merge),
sort/filter, freeze panes, and the formula picker (function library +
formula bar). Image insertion, hyperlinks, charts, screenshots, and
collaboration features are deliberately disabled — those are paths a
clever student could exploit to smuggle in pre-prepared content.

LEGACY EXCEL FUNCTION NAMES
---------------------------
The underlying engine (Luckysheet) only ships the modern Excel names
STDEVA, STDEVP, VAR_S, VAR_P, COVARIANCE_P, COVARIANCE_S. To save
students the surprise of "#NAME?" mid-exam, exam-sheet.js installs
aliases at boot so the legacy names also work:
    STDEV       = STDEVA       (sample SD; identical for numeric data)
    STDEV.S     = STDEVA
    STDEV.P     = STDEVP
    VAR         = VAR_S        (sample variance)
    VAR.S       = VAR_S
    VAR.P       = VAR_P
    COVAR       = COVARIANCE_P (legacy COVAR is population)
    COVARIANCE.P = COVARIANCE_P
    COVARIANCE.S = COVARIANCE_S
The financial functions (NPV, IRR, PMT, PV, FV, RATE, NPER, XNPV,
XIRR) work under their normal names with no aliasing.

LIMITATIONS — TELL STUDENTS THIS
--------------------------------
- Refreshing the page erases all work. There is no autosave because
  any save mechanism is also an injection vector.
- To submit numerical answers, students still type into the Canvas
  question. The spreadsheet is a calculator, not a submission tool.
- If a student wants a record of their work, they click Print (saves
  to PDF inside the lockdown environment, if permitted) or Download
  CSV (saves a CSV file). This is optional unless your grading rubric
  asks for shown work.

WHEN TO REBUILD THE VENDOR FOLDER
---------------------------------
Almost never. Luckysheet 2.1.13 is the last release of the project
(it's archived). Frozen is fine — frozen means no surprise feature
update can introduce a new attack surface mid-semester. Only revisit
if a browser update breaks something, in which case Univer is the
modern successor (https://github.com/dream-num/univer) and would be
a full rebuild rather than a patch.

LICENSE
-------
Luckysheet is Apache-2.0. The vendored copy is unmodified except for
one CSS file: vendor/plugins/css/pluginsCss.css had two external
//at.alicdn.com font URLs rewritten to local paths so the page is
self-contained. The matching font files are vendored alongside the
CSS. This rewrite is the only change.
