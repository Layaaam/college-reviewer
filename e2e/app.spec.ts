import { test, expect } from '@playwright/test'

const studentEmail = process.env.E2E_STUDENT_EMAIL
const studentPassword = process.env.E2E_STUDENT_PASSWORD
const adminEmail = process.env.E2E_ADMIN_EMAIL
const adminPassword = process.env.E2E_ADMIN_PASSWORD

async function signIn(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

test('logged-out users are redirected to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login$/)
})

test('login form is available', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})

test('student can see subjects and is blocked from admin', async ({ page }) => {
  test.skip(!studentEmail || !studentPassword, 'Set E2E_STUDENT_EMAIL and E2E_STUDENT_PASSWORD to run live auth checks.')
  await signIn(page, studentEmail!, studentPassword!)
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/review')
  await expect(page.getByText('Mathematics')).toBeVisible()
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/dashboard$/)
})

test('admin can view the read-only student table', async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run live auth checks.')
  await signIn(page, adminEmail!, adminPassword!)
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByText('Protected view')).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
})
