// background.js
// Gerencia as regras de bloqueio de sites com base nos horários configurados

// Contador global para IDs únicos
let ruleIdCounter = 1;

// Obtém o dia e hora atual
function getCurrentDayAndTime() {
  const now = new Date();
  return {
    day: now.getDay(), // 0 = domingo, 1 = segunda, etc.
    hour: now.getHours(),
    minute: now.getMinutes()
  };
}

// Converte horário para minutos desde meia-noite
function timeToMinutes(hour, minute) {
  return hour * 60 + minute;
}

// Gera um ID único para as regras
function getNextRuleId() {
  return ruleIdCounter++;
}

// Atualiza as regras de bloqueio com base na configuração atual
async function updateBlockingRules() {
  console.log("Atualizando regras de bloqueio...");
  
  try {
    // Busca configurações salvas
    const config = await chrome.storage.local.get(["blockedSites", "schedule"]);
    const blockedSites = config.blockedSites || [];
    const schedule = config.schedule || {};
    
    // Obtém horário atual
    const { day, hour, minute } = getCurrentDayAndTime();
    const nowMinutes = timeToMinutes(hour, minute);
    
    // Verifica se o horário atual está dentro de algum período de bloqueio para o dia atual
    const daySchedule = schedule[day] || [];
    const isBlockedTime = daySchedule.some(({start, end}) => 
      nowMinutes >= start && nowMinutes < end
    );
    
    // Remove todas as regras existentes
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = existingRules.map(rule => rule.id);
    
    if (removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: removeRuleIds
      });
    }
    
    // Se não estamos em horário de bloqueio, não adiciona novas regras
    if (!isBlockedTime || blockedSites.length === 0) {
      console.log("Nenhum site bloqueado neste momento.");
      return;
    }
    
    // Cria novas regras para cada site bloqueado
    const newRules = [];
    
    // Usa um prefixo baseado no timestamp para garantir unicidade
    const timestampPrefix = Date.now() % 10000; // Usa os últimos 4 dígitos do timestamp
    
    blockedSites.forEach((site, index) => {
      // Cria um ID único combinando o prefixo e o índice
      const uniqueId = timestampPrefix * 1000 + index;
      
      newRules.push({
        id: uniqueId,
        priority: 1,
        action: {
          type: "redirect",
          redirect: {
            url: chrome.runtime.getURL("blocked.html")
          }
        },
        condition: {
          urlFilter: `*${site}*`,
          resourceTypes: ["main_frame"]
        }
      });
    });
    
    // Adiciona as novas regras
    if (newRules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: newRules
      });
      console.log(`${newRules.length} regras de bloqueio ativadas.`);
    }
  } catch (error) {
    console.error("Erro ao atualizar regras de bloqueio:", error);
  }
}

// Configura alarme para atualizar as regras a cada minuto
chrome.alarms.create("updateRules", { periodInMinutes: 1 });

// Listeners para eventos
chrome.runtime.onInstalled.addListener(updateBlockingRules);
chrome.runtime.onStartup.addListener(updateBlockingRules);
chrome.storage.onChanged.addListener(updateBlockingRules);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateRules") {
    updateBlockingRules();
  }
});

// Executa imediatamente na inicialização
updateBlockingRules();
