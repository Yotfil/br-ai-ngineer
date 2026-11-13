import { spawn } from 'node:child_process'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * En desarrollo, vuelve a ejecutar `npm run content` cuando cambia algo en `content/`.
 * Los archivos regenerados en `src/generated/` disparan la recarga de Vite.
 */
export function contentWatcher(): Plugin {
  let running = false
  let pending = false
  const run = (root: string, log: (msg: string) => void) => {
    if (running) {
      pending = true
      return
    }
    running = true
    const child = spawn('npx', ['tsx', 'scripts/build-content.ts'], { cwd: root, stdio: 'inherit' })
    child.on('exit', (code) => {
      running = false
      if (code !== 0) log('[content] la compilación de contenido falló; revisa el mensaje anterior')
      if (pending) {
        pending = false
        run(root, log)
      }
    })
  }
  return {
    name: 'content-watcher',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root
      const dir = path.join(root, 'content')
      server.watcher.add(dir)
      const onChange = (file: string) => {
        if (file.startsWith(dir)) run(root, (m) => server.config.logger.error(m))
      }
      server.watcher.on('change', onChange)
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)
    },
  }
}
