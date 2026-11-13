import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Los temas se cargan bajo demanda: margen para máquinas cargadas.
configure({ asyncUtilTimeout: 3000 })

afterEach(() => cleanup())
