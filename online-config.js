// FLECAP · configuración online
window.PECOM_ONLINE = {
  supabaseUrl: "https://vbdfspjibkyjyailhraa.supabase.co",
  supabaseAnonKey: "sb_publishable_6uBEk-7IhpJ1g2Vt_GKSeg_HmawNkP3",
};

// Alias de compatibilidad. El core actual usa PECOM_ONLINE.
window.SUPABASE_CONFIG = {
  supabaseUrl: window.PECOM_ONLINE.supabaseUrl,
  supabaseKey: window.PECOM_ONLINE.supabaseAnonKey
};
