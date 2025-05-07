// storage.js
// Utilitário para salvar e ler configurações

export async function getBlockedSites() {
  return (await chrome.storage.local.get("blockedSites")).blockedSites || [];
}

export async function setBlockedSites(blockedSites) {
  return chrome.storage.local.set({blockedSites});
}

export async function getSchedule() {
  return (await chrome.storage.local.get("schedule")).schedule || {};
}

export async function setSchedule(schedule) {
  return chrome.storage.local.set({schedule});
}
