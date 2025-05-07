// popup.js
import { getBlockedSites, setBlockedSites, getSchedule, setSchedule } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const siteInput = document.getElementById('siteInput');
  const addSiteBtn = document.getElementById('addSiteBtn');
  const sitesList = document.getElementById('sitesList');
  const scheduleDiv = document.getElementById('schedule');
  const saveBtn = document.getElementById('saveBtn');

  // Sites bloqueados
  let blockedSites = await getBlockedSites();
  renderSites();

  addSiteBtn.onclick = () => {
    const site = siteInput.value.trim();
    if (site && !blockedSites.includes(site)) {
      blockedSites.push(site);
      setBlockedSites(blockedSites);
      renderSites();
      siteInput.value = '';
    }
  };

  function renderSites() {
    sitesList.innerHTML = '';
    blockedSites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site + ' ';
      const rm = document.createElement('button');
      rm.textContent = 'Remover';
      rm.onclick = () => {
        blockedSites = blockedSites.filter(s => s !== site);
        setBlockedSites(blockedSites);
        renderSites();
      };
      li.appendChild(rm);
      sitesList.appendChild(li);
    });
  }

  // Horários por dia
  let schedule = await getSchedule();
  renderSchedule();

  function renderSchedule() {
    scheduleDiv.innerHTML = '';
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let d = 0; d < 7; d++) {
      const dayBlock = document.createElement('div');
      dayBlock.innerHTML = `<b>${days[d]}:</b> `;
      const intervals = schedule[d] || [];
      intervals.forEach((intv, idx) => {
        const span = document.createElement('span');
        span.textContent = `${formatTime(intv.start)} - ${formatTime(intv.end)}`;
        const rm = document.createElement('button');
        rm.textContent = 'x';
        rm.onclick = () => {
          intervals.splice(idx, 1);
          schedule[d] = intervals;
          renderSchedule();
        };
        dayBlock.appendChild(span);
        dayBlock.appendChild(rm);
      });
      // Inputs para novo intervalo
      const start = document.createElement('input');
      start.type = 'time';
      start.style.marginLeft = '8px';
      const end = document.createElement('input');
      end.type = 'time';
      const add = document.createElement('button');
      add.textContent = 'Adicionar';
      add.onclick = () => {
        if (start.value && end.value) {
          const startMin = toMinutes(start.value);
          const endMin = toMinutes(end.value);
          if (endMin > startMin) {
            if (!schedule[d]) schedule[d] = [];
            schedule[d].push({start: startMin, end: endMin});
            renderSchedule();
          }
        }
      };
      dayBlock.appendChild(start);
      dayBlock.appendChild(end);
      dayBlock.appendChild(add);
      scheduleDiv.appendChild(dayBlock);
    }
  }

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }
  function formatTime(mins) {
    const h = String(Math.floor(mins / 60)).padStart(2, '0');
    const m = String(mins % 60).padStart(2, '0');
    return `${h}:${m}`;
  }

  saveBtn.onclick = () => {
    setSchedule(schedule);
    alert('Configuração salva!');
  };
});
