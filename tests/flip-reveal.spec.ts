import { test, expect } from '@playwright/test'
import { BoardPage } from './pages/BoardPage'

// Reproduces the reported "jumps to bottom then back up" glitch: hide a task,
// then reveal it via "Show completed" and watch the row below it settle.
// tests/flip-spike.spec.ts proves the core FLIP math handles this direction
// cleanly in isolation (no React/dnd-kit) — this test checks whether the
// same holds in the real app.
test.use({ viewport: { width: 800, height: 400 } })

test('revealing a hidden task slides row below down monotonically', async ({ page }) => {
    const board = new BoardPage(page)
    await board.goto()
    await board.reset()
    await board.setShowDone(false)

    // hide the middle row
    await board.rows.nth(1).locator('button').first().click()
    await page.waitForTimeout(300) // let the hide FLIP settle

    // open the menu now (real click — no timing sensitivity here)
    await page.getByRole('button', { name: 'Menu' }).click()

    // Click the toggle AND sample every animation frame inside one
    // evaluate() call, so there's no Playwright IPC round-trip between the
    // click and the first sample — a round-trip per sample (~20ms+) can
    // skip straight over a single-frame (~16ms) visual glitch.
    const samples = await page.evaluate(
        () =>
            new Promise<number[]>((resolve) => {
                const toggle = Array.from(document.querySelectorAll('button')).find((b) =>
                    b.textContent?.includes('Show completed'),
                ) as HTMLElement
                const row = Array.from(document.querySelectorAll('li[data-flip-id]')).find((li) =>
                    li.textContent?.includes('Buy new keyboard'),
                ) as HTMLElement
                const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY
                const collected: number[] = []
                let frame = 0
                function tick() {
                    collected.push(docTop(row))
                    frame++
                    if (frame < 40) requestAnimationFrame(tick)
                    else resolve(collected)
                }
                requestAnimationFrame(tick)
                toggle.click()
            }),
    )

    // rowBelow starts higher and ends lower (pushed down). A clean slide is
    // monotonic: each frame's top is >= the previous one (within noise). A
    // "flash to final, snap back, re-animate" glitch would show a later
    // frame's top DROP below an earlier one — max-vs-final alone misses
    // this, since the flash frame never exceeds final.
    const TOLERANCE = 1 // px of sub-pixel/rounding noise
    const violations: string[] = []
    for (let i = 1; i < samples.length; i++) {
        if (samples[i] < samples[i - 1] - TOLERANCE) {
            violations.push(`frame ${i}: ${samples[i].toFixed(1)} < frame ${i - 1}: ${samples[i - 1].toFixed(1)}`)
        }
    }
    expect(violations, `non-monotonic frames:\n${violations.join('\n')}`).toEqual([])
})
