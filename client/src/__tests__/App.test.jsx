import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

import App from '../App.tsx'

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('Get started')).toBeInTheDocument()
  })
})
