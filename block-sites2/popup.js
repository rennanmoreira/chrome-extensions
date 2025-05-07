// popup.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos da interface
  const siteInput = document.getElementById("site-input");
  const addSiteBtn = document.getElementById("add-site");
  const sitesList = document.getElementById("sites-list");
  const scheduleContainer = document.getElementById("schedule-container");
  const saveConfigBtn = document.getElementById("save-config");
  const statusDiv = document.getElementById("status");

  // Dados da configuração
  let blockedSites = [];
  let schedule = {};

  // Nomes dos dias da semana
  const weekDays = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  // Carrega configurações salvas
  function loadConfig() {
    chrome.storage.local.get(["blockedSites", "schedule"], function (result) {
      blockedSites = result.blockedSites || [];
      schedule = result.schedule || {};

      // Renderiza a lista de sites
      renderSitesList();

      // Renderiza o agendamento por dia
      renderSchedule();
    });
  }

  // Renderiza a lista de sites bloqueados
  function renderSitesList() {
    sitesList.innerHTML = "";

    blockedSites.forEach(function (site) {
      const li = document.createElement("li");

      const siteText = document.createElement("span");
      siteText.textContent = site;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remover";
      removeBtn.className = "remove";
      removeBtn.addEventListener("click", function () {
        blockedSites = blockedSites.filter((s) => s !== site);
        renderSitesList();
      });

      li.appendChild(siteText);
      li.appendChild(removeBtn);
      sitesList.appendChild(li);
    });
  }

  // Renderiza o agendamento por dia da semana
  function renderSchedule() {
    scheduleContainer.innerHTML = "";

    weekDays.forEach(function (dayName, dayIndex) {
      const daySchedule = document.createElement("div");
      daySchedule.className = "day-schedule";

      const dayHeader = document.createElement("div");
      dayHeader.className = "day-header";
      dayHeader.innerHTML = `<span>${dayName}</span>`;

      const addTimeBtn = document.createElement("button");
      addTimeBtn.textContent = "Adicionar horário";
      addTimeBtn.addEventListener("click", function () {
        addTimeSlot(dayIndex, dayTimeSlots);
      });

      dayHeader.appendChild(addTimeBtn);
      daySchedule.appendChild(dayHeader);

      const dayTimeSlots = document.createElement("div");
      dayTimeSlots.className = "time-slots";
      daySchedule.appendChild(dayTimeSlots);

      // Adiciona slots de tempo existentes
      if (schedule[dayIndex] && schedule[dayIndex].length > 0) {
        schedule[dayIndex].forEach(function (slot, slotIndex) {
          addTimeSlot(dayIndex, dayTimeSlots, slot);
        });
      }

      scheduleContainer.appendChild(daySchedule);
    });
  }

  // Adiciona um slot de tempo ao dia
  function addTimeSlot(dayIndex, container, slot = null) {
    const timeSlot = document.createElement("div");
    timeSlot.className = "time-slot";

    // Input para hora de início
    const startInput = document.createElement("input") || "08:00";
    startInput.type = "time";
    startInput.className = "time-input";
    if (slot) {
      startInput.value = minutesToTimeString(slot.start);
    }

    // Input para hora de fim
    const endInput = document.createElement("input") || "19:00";
    endInput.type = "time";
    endInput.className = "time-input";
    if (slot) {
      endInput.value = minutesToTimeString(slot.end);
    }

    // Botão para remover slot
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "remove";
    removeBtn.addEventListener("click", function () {
      timeSlot.remove();
    });

    // Adiciona os elementos ao slot
    timeSlot.appendChild(document.createTextNode("De "));
    timeSlot.appendChild(startInput);
    timeSlot.appendChild(document.createTextNode(" até "));
    timeSlot.appendChild(endInput);
    timeSlot.appendChild(removeBtn);

    // Adiciona o slot ao container
    container.appendChild(timeSlot);
  }

  // Converte minutos para string de tempo (HH:MM)
  function minutesToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  // Converte string de tempo (HH:MM) para minutos
  function timeStringToMinutes(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Adiciona um site à lista de bloqueados
  addSiteBtn.addEventListener("click", function () {
    const site = siteInput.value.trim();

    if (site && !blockedSites.includes(site)) {
      blockedSites.push(site);
      siteInput.value = "";
      renderSitesList();
    }
  });

  // Salva a configuração
  saveConfigBtn.addEventListener("click", function () {
    // Coleta os horários configurados
    const newSchedule = {};

    document
      .querySelectorAll(".day-schedule")
      .forEach(function (dayElem, dayIndex) {
        const timeSlots = [];

        dayElem.querySelectorAll(".time-slot").forEach(function (slotElem) {
          const inputs = slotElem.querySelectorAll('input[type="time"]');

          if (inputs[0].value && inputs[1].value) {
            const start = timeStringToMinutes(inputs[0].value);
            const end = timeStringToMinutes(inputs[1].value);

            if (end > start) {
              timeSlots.push({ start, end });
            }
          }
        });

        if (timeSlots.length > 0) {
          newSchedule[dayIndex] = timeSlots;
        }
      });

    // Salva a configuração
    chrome.storage.local.set(
      {
        blockedSites: blockedSites,
        schedule: newSchedule,
      },
      function () {
        // Mostra mensagem de sucesso
        statusDiv.textContent = "Configuração salva com sucesso!";
        statusDiv.className = "status success";

        // Esconde a mensagem após 3 segundos
        setTimeout(function () {
          statusDiv.style.display = "none";
        }, 3000);
      }
    );
  });

  // Inicializa a interface
  loadConfig();
});
