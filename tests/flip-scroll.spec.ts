import { test, expect } from '@playwright/test'
import { BoardPage } from './pages/BoardPage'

// Reproduces the scroll-contamination bug found while debugging the FLIP
// reflow: hiding a task while the page is scrolled must never move rows
// above the hidden one. Viewport-relative position measurement broke this
// (both from real user scroll and from Chrome's own scroll-anchoring, which
// fires automatically when content shrinks near the viewport) — fixed by
// measuring document-relative (rect.top + scrollY) in useFlip (src/hooks.ts).

// Small viewport so the seed tasks overflow and the page is actually
// scrollable — the default viewport is tall enough that nothing scrolls.
test.use({ viewport: { width: 800, height: 400 } })

test('hiding a task while scrolled does not move rows above it', async ({ page }) => {
    const board = new BoardPage(page)
    await board.goto()
    await board.reset()
    await board.setShowDone(false)

    const rowAboveTopBefore = await board.rowTop(0)
    const rowBelowTopBefore = await board.rowTop(2)

    // scroll the page — this is what triggered the contamination
    await page.evaluate(() => window.scrollBy(0, 300))
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0) // sanity: the page must have actually scrolled

    // hide the middle row
    await board.rows.nth(1).locator('button').first().click()
    await page.waitForTimeout(300) // let the FLIP transition settle

    const rowAboveTopAfter = await board.rowTop(0)
    const rowBelowTopAfter = await board.rowTop(1) // shifted down one index — row 1 is gone

    // rowAbove must not have moved at all
    expect(Math.abs(rowAboveTopAfter - rowAboveTopBefore)).toBeLessThan(2)

    // rowBelow should have shifted up since the row between them disappeared
    expect(rowBelowTopAfter).toBeLessThan(rowBelowTopBefore - 5)
})
