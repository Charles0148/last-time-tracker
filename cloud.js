/* ===== 帳號與雲端同步（Supabase，只用瀏覽器內建 fetch）=====
   資料表 public.diaries：user_id uuid 主鍵（= 登入者 id）、data jsonb（整份紀錄）、updated_at。
   RLS 開啟，select/insert/update/delete 都限定 auth.uid() = user_id。
   本機開發：在 localhost／127.0.0.1 加上 ?supabase=<網址> 可以改連本機的測試伺服器。 */
(function () {
  'use strict';
  const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const override = LOCAL ? new URLSearchParams(location.search).get('supabase') : null;
  const CFG = override ? { url: override, anonKey: 'local-test-key' } : (window.SUPABASE || {});
  const SESSION_KEY = 'lastnote.cloud.session', SYNC_KEY = 'lastnote.cloud.sync';
  const configured = () => !!(CFG.url && CFG.anonKey);
  let session = read(SESSION_KEY), sync = read(SYNC_KEY) || {}, pushTimer = null, state = 'idle', listeners = [], lastData = null;

  function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null } }
  function write(key, value) { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)) } catch {} }
  function setState(next, detail = '') { state = next; listeners.forEach(fn => { try { fn(next, detail) } catch {} }) }

  const ERRORS = [
    [/failed to fetch|networkerror|load failed/i, '連不上雲端，請確認網路後再試'],
    [/invalid login credentials/i, 'Email 或密碼不對'],
    [/already registered|already been registered|user_already_exists/i, '這個 Email 已經註冊過了，直接登入就好'],
    [/email not confirmed/i, '還沒點驗證信，收信確認後再登入'],
    [/password should be at least|weak_password/i, '密碼至少要 6 個字元'],
    [/invalid email|email_address_invalid|unable to validate email/i, 'Email 格式不對'],
    [/rate limit|too many|over_email_send_rate_limit/i, '太頻繁了，請稍等一下再試'],
    [/same_password|should be different/i, '新密碼不能跟舊密碼一樣'],
    [/relation .*diaries.* does not exist/i, '雲端資料表還沒建立'],
    [/row-level security|permission denied/i, '雲端拒絕了這次操作，請重新登入']
  ];
  const zh = message => { const text = String(message || ''); for (const [re, out] of ERRORS) if (re.test(text)) return out; return text || '發生未知錯誤' };

  async function call(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
    const response = await fetch(CFG.url.replace(/\/+$/, '') + path, {
      method,
      headers: { apikey: CFG.anonKey, 'Content-Type': 'application/json', ...(auth && session ? { Authorization: `Bearer ${session.access_token}` } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    }).catch(error => { throw new Error(zh(error.message)) });
    const text = await response.text();
    let data = null; if (text) { try { data = JSON.parse(text) } catch { data = text } }
    if (!response.ok) { const error = new Error(zh(data?.msg || data?.message || data?.error_description || data?.error || data?.code || response.statusText)); error.status = response.status; throw error }
    return data;
  }

  function keep(result) {
    if (!result?.access_token) return null;
    session = { access_token: result.access_token, refresh_token: result.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (result.expires_in || 3600), user: { id: result.user?.id, email: result.user?.email } };
    write(SESSION_KEY, session); return session;
  }
  async function fresh() {
    if (!session) return null;
    if (session.expires_at - 60 > Date.now() / 1000) return session;
    try { return keep(await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } })) }
    catch (error) { if (error.status === 400 || error.status === 401) { session = null; write(SESSION_KEY, null) } throw error }
  }

  // ---- Data: union merge keeps every item/record id from both sides; settings follow the newer copy.
  function merge(local, cloud) {
    const byId = (a = [], b = []) => { const map = new Map(); for (const x of [...a, ...b]) if (x && x.id) map.set(x.id, { ...map.get(x.id), ...x }); return [...map.values()] };
    return { ...local, ...cloud, items: byId(local.items, cloud.items), records: byId(local.records, cloud.records), moments: byId(local.moments, cloud.moments), settings: { ...local.settings, ...cloud.settings } };
  }
  async function pull() {
    await fresh();
    const rows = await call(`/rest/v1/diaries?select=data,updated_at&user_id=eq.${session.user.id}`, { auth: true });
    return rows && rows[0] ? rows[0] : null;
  }
  async function push(data) {
    await fresh();
    const updated_at = new Date().toISOString();
    await call('/rest/v1/diaries?on_conflict=user_id', { method: 'POST', auth: true, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: { user_id: session.user.id, data, updated_at } });
    sync = { owner: session.user.id, syncedAt: updated_at, dirty: false }; write(SYNC_KEY, sync); setState('synced', updated_at);
  }

  /* Decide which copy wins when this device signs in:
     - local data from another account (or none) and cloud exists → back up local, take cloud;
     - local data never synced before (first sign-in on this device) → union merge, upload;
     - same account with unsynced local edits → union merge, upload; otherwise take cloud. */
  async function reconcile(local) {
    const row = await pull(), hasLocal = !!(local && (local.items?.length || local.records?.length)), owner = sync.owner;
    let result = local;
    if (owner && owner !== session.user.id && hasLocal) {
      try { localStorage.setItem(`lastnote.v1.backup-${owner}`, JSON.stringify(local)) } catch {}
      result = row ? row.data : { ...local, items: [], records: [], moments: [] };
    } else if (!row) result = local;
    else if (!owner && hasLocal) result = merge(local, row.data);
    else if (owner === session.user.id && sync.dirty) result = merge(local, row.data);
    else result = row.data;
    await push(result);
    return result;
  }

  window.diaryCloud = {
    configured, local: LOCAL,
    get user() { return session?.user || null },
    get state() { return state },
    onChange(fn) { listeners.push(fn) },
    async signIn(email, password) { return keep(await call('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } })) },
    async signUp(email, password) {
      const result = await call('/auth/v1/signup', { method: 'POST', body: { email, password } });
      return result?.access_token ? keep(result) : null; // null → email confirmation is required first
    },
    async resetPassword(email) { await call(`/auth/v1/recover?redirect_to=${encodeURIComponent(location.origin + location.pathname)}`, { method: 'POST', body: { email } }) },
    async updatePassword(password) { await fresh(); await call('/auth/v1/user', { method: 'PUT', auth: true, body: { password } }) },
    // Password-recovery links land with #access_token=…&type=recovery.
    takeRecovery() {
      const hash = new URLSearchParams(location.hash.slice(1));
      if (hash.get('type') !== 'recovery' || !hash.get('access_token')) return false;
      session = { access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token'), expires_at: Math.floor(Date.now() / 1000) + Number(hash.get('expires_in') || 3600), user: { id: null, email: '' } };
      history.replaceState(null, '', location.pathname + location.search);
      return true;
    },
    async loadUser() { await fresh(); const user = await call('/auth/v1/user', { auth: true }); session.user = { id: user.id, email: user.email }; write(SESSION_KEY, session); return session.user },
    async signOut() {
      clearTimeout(pushTimer);
      try { await call('/auth/v1/logout', { method: 'POST', auth: true }) } catch {}
      session = null; write(SESSION_KEY, null); setState('idle');
    },
    async start(local) { setState('syncing'); try { const data = await reconcile(local); return data } catch (error) { setState('error', error.message); throw error } },
    // Called after every local save; uploads shortly after the last change, and retries when back online.
    queue(data) {
      if (!session) return;
      lastData = data;
      sync = { ...sync, owner: session.user.id, dirty: true }; write(SYNC_KEY, sync);
      clearTimeout(pushTimer); setState('pending');
      pushTimer = setTimeout(() => push(data).catch(error => setState('error', error.message)), 1200);
    },
    async removeCloud() { await fresh(); await call(`/rest/v1/diaries?user_id=eq.${session.user.id}`, { method: 'DELETE', auth: true }); sync = { owner: session.user.id, dirty: false }; write(SYNC_KEY, sync) }
  };
  addEventListener('online', () => { if (session && sync.dirty && lastData) push(lastData).catch(error => setState('error', error.message)) });
})();
