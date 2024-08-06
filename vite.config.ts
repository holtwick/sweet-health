import { resolve } from 'node:path'
import process from 'node:process'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { valueToBoolean } from 'zeed'
import pkg from './package.json'

const env = process.env
const now = new Date()
const dateString = now.toISOString().slice(0, 19).replace(/\D/g, '')

env.APP_DATETIME = now.toLocaleString()
env.APP_DATE = dateString
env.APP_TIMESTAMP = now.getTime().toFixed(0)
env.APP_NAME ??= env.npm_package_name
env.APP_VERSION ??= env.npm_package_version
env.APP_RELEASE ??= `${env.npm_package_name}@${env.npm_package_version}`
env.APP_AUTHOR_NAME ??= env.npm_package_author_name
env.APP_AUTHOR_EMAIL ??= env.npm_package_author_email

const define = {
  DEBUG: valueToBoolean(process.env.DEBUG, false),
}

const alias: Record<string, string> = {
  '@/': `${resolve(process.cwd(), 'src')}/`,
}

const icons = {
  icons: [
    {
      src: 'pwa-64x64.png',
      sizes: '64x64',
      type: 'image/png',
    },
    {
      src: 'pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: 'pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: 'maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
}

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: [
    'APP_',
    'VITE_',
  ],
  plugins: [
    Vue(),
  ],
  define,
  resolve: {
    alias,
    dedupe: Object.keys(pkg.dependencies),
  },
  build: {
    outDir: 'www',
    sourcemap: true,
    minify: true,
    // target: 'es6',
  },
})
