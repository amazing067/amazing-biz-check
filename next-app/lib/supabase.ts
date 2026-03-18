import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

let _envCache: { url: string; key: string } | null | undefined = undefined;

/** process.env에 없으면 cwd 기준 .env.local 직접 읽기 (Turbopack/다른 cwd에서 실행 시 대응) */
function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return { url, key }

  if (_envCache !== undefined) return _envCache
  _envCache = null

  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, '.env.local'),
    path.join(cwd, 'next-app', '.env.local'),
  ]
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) continue
      const text = fs.readFileSync(file, 'utf8')
      let u = ''
      let k = ''
      for (const line of text.split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith('#')) continue
        const eq = t.indexOf('=')
        if (eq <= 0) continue
        const key = t.slice(0, eq).trim()
        let val = t.slice(eq + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1)
        if (key === 'SUPABASE_URL') u = val
        if (key === 'SUPABASE_SERVICE_ROLE_KEY') k = val
      }
      if (u && k) {
        _envCache = { url: u, key: k }
        return _envCache
      }
    } catch (_) {}
  }
  return null
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const env = getSupabaseEnv()
  if (!env) return null
  return createClient(env.url, env.key, {
    auth: { persistSession: false },
  })
}

let _client: SupabaseClient | null | undefined = undefined

export function supabaseAdmin(): SupabaseClient | null {
  if (_client !== undefined) return _client
  const env = getSupabaseEnv()
  if (!env) {
    _client = null
    return null
  }
  _client = createClient(env.url, env.key, {
    auth: { persistSession: false },
  })
  return _client
}
