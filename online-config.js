// FLECAP · configuración online
window.PECOM_ONLINE = {
  supabaseUrl: "https://fujtkmsmoeewfelhpckh.supabase.co",
  supabaseAnonKey: "sb_publishable_okl7QJvuSMDWa_aw2yUABw_XFjc39IT",
  adminEmail: "pablo.perez@pecomenergia.com.ar"
};
// Alias de compatibilidad. El core actual usa PECOM_ONLINE.
window.SUPABASE_CONFIG = {
  supabaseUrl: window.PECOM_ONLINE.supabaseUrl,
  supabaseKey: window.PECOM_ONLINE.supabaseAnonKey
};
