import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'
beforeEach(() => {
  global.document = global.document || { body: {}, addEventListener: () => {}, removeEventListener: () => {} }
})
