import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('renders home', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </MemoryRouter>
    )
    // Assert the main page heading instead of generic text to avoid duplicates
    expect(await screen.findByRole('heading', { level: 1, name: /Weather\+ Pro/i })).toBeInTheDocument()
  })
})
