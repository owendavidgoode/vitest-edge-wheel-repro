import { afterEach, expect, test } from 'vitest'
import { page, server, userEvent } from 'vitest/browser'

afterEach(() => document.body.replaceChildren())

test.for(['locator', 'userEvent'])('%s observes listener state at wheel resolution', async (entryPoint) => {
  expect(server.config.browser.name).toBe('edge')
  expect(navigator.userAgent).toMatch(/Edg\//)
  const button = document.createElement('button')
  button.textContent = 'Wheel target'
  document.body.append(button)
  let received = 0
  button.addEventListener('wheel', () => received++, { passive: true })
  const late = []
  for (let attempt = 1; attempt <= 30; attempt++) {
    const locator = page.getByRole('button', { name: 'Wheel target' })
    if (entryPoint === 'locator') await locator.wheel({ direction: 'down' })
    else await userEvent.wheel(locator, { direction: 'down' })
    if (received !== attempt) late.push(attempt)
    await expect.poll(() => received).toBe(attempt)
  }
  expect(late).toEqual([])
})

test.for(['locator', 'userEvent'])('%s observes five wheel events at resolution', async (entryPoint) => {
  expect(server.config.browser.name).toBe('edge')
  expect(navigator.userAgent).toMatch(/Edg\//)
  const button = document.createElement('button')
  button.textContent = 'Multiple wheel target'
  document.body.append(button)
  let received = 0
  button.addEventListener('wheel', () => received++, { passive: true })
  const locator = page.getByRole('button', { name: 'Multiple wheel target' })
  const options = { direction: 'down', times: 5 }
  if (entryPoint === 'locator') await locator.wheel(options)
  else await userEvent.wheel(locator, options)
  const receivedAtResolution = received
  await expect.poll(() => received).toBe(5)
  expect(receivedAtResolution).toBe(5)
})
