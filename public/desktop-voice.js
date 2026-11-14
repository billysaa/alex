(() => {
  const toggle = document.getElementById("wakeWordToggle");
  const status = document.getElementById("wakeStatus");
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!toggle || !status) return;
  let recognition = null, active = false, awaitingCommand = false, restartTimer = null;

  const setStatus = (text, color = "#91a0b8") => {
    status.textContent = text;
    status.style.color = color;
  };
  const normalize = value => value.toLocaleLowerCase("el-GR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const hasWake = text => {
    const t = normalize(text);
    return /(^|\\s)(ζαγκα|ζαγκά|ζαγκαα|zagka|zagkas)(\\s|$|[,!.])/i.test(t);
  };

  async function sendCommand(text) {
    const command = text.trim();
    if (!command) return;
    try {
      const r = await fetch("/api/desktop/command", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });
      const data = await r.json();
      if (data.handled) {
        setStatus(data.message || "Έγινε.", "#8fe3bc");
        if (window.speechSynthesis) {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(data.message || "Έγινε");
          u.lang = "el-GR"; speechSynthesis.speak(u);
        }
      } else {
        const box = document.getElementById("input");
        box.value = command;
        document.getElementById("form").requestSubmit();
        setStatus("Ο Ζάγκας επεξεργάζεται την εντολή…", "#8bd7ff");
      }
    } catch {
      setStatus("Δεν μπορώ να συνδεθώ με τον τοπικό βοηθό.", "#ff9b9b");
    }
  }

  function start() {
    if (!Recognition) {
      toggle.checked = false;
      setStatus("Η συνεχής αναγνώριση δεν υποστηρίζεται σε αυτό το περιβάλλον.", "#ff9b9b");
      return;
    }
    active = true;
    recognition = new Recognition();
    recognition.lang = "el-GR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = event => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        const spoken = event.results[i][0].transcript.trim();
        if (awaitingCommand) {
          awaitingCommand = false;
          setStatus("Εκτελώ: " + spoken, "#8bd7ff");
          void sendCommand(spoken);
        } else if (hasWake(spoken)) {
          const remainder = spoken.replace(/ζά?γ?κ?α?s?/i, "").trim();
          if (remainder.length > 2) {
            setStatus("Άκουσα την εντολή σου…", "#8bd7ff");
            void sendCommand(remainder);
          } else {
            awaitingCommand = true;
            setStatus("Σε ακούω — πες την εντολή σου.", "#8fe3bc");
            if (window.speechSynthesis) {
              const u = new SpeechSynthesisUtterance("Σε ακούω");
              u.lang = "el-GR"; speechSynthesis.speak(u);
            }
          }
        }
      }
    };
    recognition.onerror = event => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        active = false; toggle.checked = false;
        setStatus("Δεν δόθηκε άδεια μικροφώνου ή υπηρεσίας αναγνώρισης.", "#ff9b9b");
      }
    };
    recognition.onend = () => {
      if (active) restartTimer = setTimeout(() => {
        try { recognition.start(); } catch {}
      }, 700);
      else setStatus("Wake word ανενεργό.");
    };
    try { recognition.start(); setStatus("Ακούω για «Ζάγκα»…", "#8fe3bc"); }
    catch { setStatus("Δεν ξεκίνησε το μικρόφωνο. Δοκίμασε ξανά.", "#ff9b9b"); }
  }

  function stop() {
    active = false; awaitingCommand = false;
    clearTimeout(restartTimer);
    if (recognition) { recognition.onend = null; try { recognition.stop(); } catch {} }
    setStatus("Wake word ανενεργό.");
  }

  toggle.addEventListener("change", () => toggle.checked ? start() : stop());
  window.addEventListener("beforeunload", stop);
})();
