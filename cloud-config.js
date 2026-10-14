/* 距今小島的 Supabase 連線資料。
   url：Project Settings → API Keys 頁（或左上 Connect）的 Project URL。
   anonKey：publishable key（sb_publishable_…）或舊版 anon key。這兩個本來就是公開值，
   資料由資料表的 Row Level Security 保護（每個人只碰得到自己那一列），不要放 service_role 金鑰。 */
window.SUPABASE = {
  url: 'https://lfyemjtkklibrhfrpcqm.supabase.co',
  anonKey: 'sb_publishable_KgjDr7OS4Ur5cEk1lvUT2g_Fwn7nc1o'
};
