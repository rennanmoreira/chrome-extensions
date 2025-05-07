// background.js
// Atualiza regras de bloqueio dinamicamente usando declarativeNetRequest

function getCurrentDayAndTime() {
  const now = new Date();
  return {
    day: now.getDay(), // 0 = domingo
    hour: now.getHours(),
    minute: now.getMinutes()
  };
}

async function updateBlockingRules() {
  const config = await chrome.storage.local.get(["blockedSites", "schedule"]);
  const blockedSites = config.blockedSites || [];
  const schedule = config.schedule || {};
  const { day, hour, minute } = getCurrentDayAndTime();
  const nowMinutes = hour * 60 + minute;
  const daySchedule = schedule[day] || [];
  const isBlockedNow = (site) => daySchedule.some(({start, end}) => nowMinutes >= start && nowMinutes < end);

  // Remove regras antigas
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map(r => r.id);
  if (removeRuleIds.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds});
  }

  // Adiciona novas regras se necessário
  let rules = [];
  let ruleId = 1;
  blockedSites.forEach(site => {
    if (isBlockedNow(site)) {
      rules.push({
        id: ruleId++,
        priority: 1,
        action: { type: "redirect", redirect: { url: chrome.runtime.getURL("blocked.html") } },
        condition: { urlFilter: site, resourceTypes: ["main_frame"] }
      });
    }
  });
  if (rules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({addRules: rules});
  }
}

// Atualiza regras ao iniciar e sempre que mudar configuração
chrome.runtime.onStartup.addListener(updateBlockingRules);
chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.storage.onChanged.addListener(updateBlockingRules);
// Atualiza regras a cada minuto para pegar mudança de horário
setInterval(updateBlockingRules, 60000);
