# TODO

- [ ] More contact details - email, phone, etc?
- [x] Weird state behaviour with scan button
  - cause: the 4-second timer that clears a result was only cancelled when a
    scan finished, never when a new one started. Press Scan within 4s of a
    result and the old timer fired mid-scan, reverting the panel and re-enabling
    the button while a scan was genuinely running - after which the next press
    was swallowed by the "already scanning" guard. Fixed in `startScan`.
  - also fixed: the timer outliving the screen, and a typed-in ID not going
    through the same path as a scanned one.
- [ ] more ways to interact with the scanner
  - constant scanning mode
    - scans on schedule - needs testing re: highest allowable scan rate to preserve battery life/performance
  - duplicate scan detection
- [ ] more ways to interact with memeber list
  - search by name, student number, etc. (the browse screen does this; the
    scan screen still only takes a number)
  - scan for committee members?
  - add birthday column to sheet and show it in the app if scanned student has a birthday today/recently
- check with SunIT about hooking into Academia management - can we query for membership status via official systems?
- Error page should have a way to navigate to the info page
- troubleshooting should have an entry covering the dev build marker (orange border) and how to get rid of it (likely an issue re hosting)
