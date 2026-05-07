FIN368 — Live-Data Modules
==========================

WHAT THIS IS
------------
A small folder of self-contained HTML pages that pull live finance data
(spot FX, Big Mac Index, inflation, real rates) from free public APIs.
The point: stop screenshotting market data into your slides every
semester. Open the matching page next to your slide deck during class
and the numbers are always current.

HOW TO USE
----------
1. Double-click the .html file you want (e.g., ch7-8.html).
   It opens in your default browser. No install, no server, no login.
2. Wait ~2 seconds for the data to load. Each chart shows an
   "as of [date]" line so the class can see it's genuinely live.
3. Click the tabs along the top to switch widgets.
4. To refresh: just reload the page (Ctrl+R / F5).

If a widget shows a red error box: usually means no internet, a firewall
is blocking the API, or the upstream source is down. Reload first; if it
persists, the affected widget will degrade but the rest of the page
continues to work.

PREREQUISITES
-------------
- Internet connection while teaching.
- A modern browser (Chrome, Edge, Firefox, Safari — anything from the
  last 5 years).
- Nothing else. No API keys, no Python, no npm.

CHAPTER MODULES
---------------

ch7-8.html
    Topics: Purchasing Power Parity (PPP), Big Mac Index, Interest Rate
    Parity (IRP), forward premium/discount.
    Replaces these stale items in FIN368_CH7&8.pptx:
      - "Big Mac costs Yuan 21 in China and $5.74 in US" example
      - "Selected Rates from the Big Mac Index" table
      - PPP test for four major countries
      - Any covered-IRP forward-rate example
    Three live widgets:
      1. Big Mac Index — latest snapshot from The Economist (updated
         every January & July). Spotlight any country, sortable
         table, full-bar chart of over/under-valuation.
      2. Interest Rate Parity calculator — pulls live spot from the
         ECB; you type the two interest rates; it computes the
         no-arbitrage forward and explains the direction.
      3. Inflation & real rates for major economies — IMF + World Bank.

WHEN YOU UPDATE THE INTEREST RATES
----------------------------------
The IRP calculator (ch7-8.html, tab 2) ships with default interest
rates that you can edit on screen during class. To make the defaults
match the current cycle each semester, open ch7-8.html in a text editor
and change the two `value="..."` attributes on lines tagged
`id="irp-ib"` (base rate) and `id="irp-iq"` (quote rate). Takes 30
seconds.

DATA SOURCES (all free, all CORS-enabled, all GET-only)
-------------------------------------------------------
- The Economist — Big Mac Index
  https://github.com/TheEconomist/big-mac-data
  CSV updated semi-annually.
- Frankfurter
  https://frankfurter.dev
  Re-publishes ECB reference exchange rates. Daily.
- IMF DataMapper
  https://data.imf.org
  Inflation rates (PCPIPCH) for ~190 countries, including current-year
  forecasts.
- World Bank Open Data
  https://api.worldbank.org/v2
  Real interest rate (FR.INR.RINR), annual, last available reading
  per country.

PRIVACY
-------
The page only makes outbound GET requests to the four sources above.
Nothing about you, your computer, or your students is uploaded.

WHAT'S NEXT
-----------
Once you've used ch7-8.html in class once or twice, we'll decide
whether to build the same kind of module for the other chapters in
your stale-data audit:
  Ch 3, 4, 6, 9, 10, 11, 16, 17, 18, 20, plus the Russia-Ukraine deck.

DUPLICATE CLEANUP
-----------------
The Ch20 download duplicate (FIN368_Ch20 (1).pptx) has been removed.
One file still warrants a manual look:
  - FIN368 Ch 4 with answers.pptx  (90 KB — likely a corrupt partial
    download next to the full 1.3 MB FIN368_Ch4 with answers.pptx).
    Open it once and confirm before deleting.

PARKED FOR LATER
----------------
You also asked about a better way to deliver practice problems with
hidden answers (currently two Word docs per chapter on Canvas). That's
its own design conversation — we'll come back to it.
