// Plantilla. Para Supabase usa la Project URL y la publishable key/anon key.
// No pegues secret key ni service_role key aquí: este archivo es público.
window.HDP_CONFIG = {
  SUPABASE_URL: "PEGA_AQUI_TU_PROJECT_URL_DE_SUPABASE",
  SUPABASE_KEY: "PEGA_AQUI_TU_PUBLISHABLE_O_ANON_KEY",

  // Fallback temporal de Apps Script. Se puede borrar cuando Supabase quede listo.
  API_URL: "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT/exec",
  TOKEN: "pega-aqui-tu-token"
};
