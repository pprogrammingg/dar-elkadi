(() => {
  const $ = (id) => document.getElementById(id);
  const DRAFT_KEY = "dar-elkadi-campaign-draft";
  const STALE_DAYS = 30;

  const STATUS_OPTIONS = [
    "NA",
    "Not contacted",
    "Reached out",
    "Follow up",
    "Confirmed",
    "Declined",
  ];

  let state = { objective: "", contacts: [] };

  const todayStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const daysSince = (value) => {
    if (value == null || value === "" || value === "NA") return Infinity;
    const parsed = Date.parse(String(value));
    if (Number.isNaN(parsed)) return Infinity;
    const then = new Date(parsed);
    then.setHours(0, 0, 0, 0);
    return Math.floor((todayStart() - then) / 86400000);
  };

  const isStale = (days) => !Number.isFinite(days) || days > STALE_DAYS;

  const nameKey = (name) => String(name || "").toLocaleLowerCase();

  /* Overdue / never first (highest days), then name A–Z */
  const sortContacts = (contacts) =>
    [...contacts].sort((a, b) => {
      const da = daysSince(a.last_contacted);
      const db = daysSince(b.last_contacted);
      const oa = isStale(da) ? 0 : 1;
      const ob = isStale(db) ? 0 : 1;
      if (oa !== ob) return oa - ob;

      const na = Number.isFinite(da) ? da : Number.POSITIVE_INFINITY;
      const nb = Number.isFinite(db) ? db : Number.POSITIVE_INFINITY;
      if (nb !== na) return nb - na;

      return nameKey(a.name).localeCompare(nameKey(b.name), undefined, {
        sensitivity: "base",
      });
    });

  const normalizeContact = (raw) => ({
    name: raw?.name || "",
    status: raw?.status && raw.status !== "" ? raw.status : "NA",
    last_contacted: raw?.last_contacted || null,
    feedback:
      raw?.feedback != null && raw.feedback !== "" ? raw.feedback : "NA",
  });

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(collect()));
    } catch {
      /* private mode */
    }
  };

  const mergeDraft = (vault) => {
    const draft = loadDraft();
    if (!draft?.contacts?.length) return vault;
    const byName = new Map(
      draft.contacts.map((c) => [nameKey(c.name), normalizeContact(c)])
    );
    return {
      objective: draft.objective || vault.objective || "",
      contacts: (vault.contacts || []).map((c) => {
        const hit = byName.get(nameKey(c.name));
        return hit
          ? { ...normalizeContact(c), ...hit, name: c.name }
          : normalizeContact(c);
      }),
    };
  };

  const daysLabel = (days) => {
    if (!Number.isFinite(days)) return "Never contacted";
    if (days <= 0) return "Contacted today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  /* 0 days → light green; 30+ / never → yellow */
  const rowTint = (days) => {
    const t = Number.isFinite(days)
      ? Math.min(Math.max(days, 0), 45) / 45
      : 1;
    const r = Math.round(186 + (236 - 186) * t);
    const g = Math.round(214 + (204 - 214) * t);
    const b = Math.round(150 + (96 - 150) * t);
    const a = 0.28 + 0.14 * t;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const el = (tag, className) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  };

  const statusSelect = (value) => {
    const select = el("select", "campaign-field campaign-field--status");
    select.name = "status";
    const opts = STATUS_OPTIONS.includes(value)
      ? STATUS_OPTIONS
      : [value, ...STATUS_OPTIONS];
    opts.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      if (opt === value) option.selected = true;
      select.append(option);
    });
    return select;
  };

  const applyRowTone = (tr, days) => {
    tr.style.setProperty("--row-tint", rowTint(days));
    tr.classList.toggle("is-stale", isStale(days));
    tr.classList.toggle("is-fresh", !isStale(days));
    const note = tr.querySelector(".campaign-last-note");
    if (note) note.textContent = daysLabel(days);
  };

  const renderRow = (contact) => {
    const days = daysSince(contact.last_contacted);
    const tr = el("tr", isStale(days) ? "is-stale" : "is-fresh");
    tr.dataset.name = contact.name;
    tr.style.setProperty("--row-tint", rowTint(days));

    const nameTd = el("td", "campaign-name");
    const nameInput = el("input", "campaign-field campaign-field--name");
    nameInput.type = "text";
    nameInput.name = "name";
    nameInput.value = contact.name;
    nameInput.required = true;
    nameInput.setAttribute("aria-label", "Contact name");
    nameTd.append(nameInput);

    const statusTd = el("td", "campaign-status");
    statusTd.append(statusSelect(contact.status));

    const lastTd = el("td", "campaign-last");
    const lastWrap = el("div", "campaign-last-wrap");
    const lastInput = el("input", "campaign-field campaign-field--date");
    lastInput.type = "date";
    lastInput.name = "last_contacted";
    lastInput.value =
      contact.last_contacted && contact.last_contacted !== "NA"
        ? String(contact.last_contacted).slice(0, 10)
        : "";
    lastInput.setAttribute("aria-label", `Last contacted ${contact.name}`);
    const note = el("span", "campaign-last-note");
    note.textContent = daysLabel(days);
    lastWrap.append(lastInput, note);
    lastTd.append(lastWrap);

    const feedbackTd = el("td", "campaign-feedback");
    const feedbackInput = el(
      "textarea",
      "campaign-field campaign-field--feedback"
    );
    feedbackInput.name = "feedback";
    feedbackInput.rows = 2;
    feedbackInput.value = contact.feedback ?? "NA";
    feedbackInput.setAttribute("aria-label", `Feedback ${contact.name}`);
    feedbackTd.append(feedbackInput);

    tr.append(nameTd, statusTd, lastTd, feedbackTd);
    return tr;
  };

  const refreshMeta = () => {
    const contacts = collect().contacts;
    const count = $("campaign-count");
    const stale = $("campaign-stale");
    if (count) count.textContent = String(contacts.length);
    if (stale) {
      stale.textContent = String(
        contacts.filter((c) => isStale(daysSince(c.last_contacted))).length
      );
    }
  };

  const refreshRowTones = () => {
    const body = $("campaign-body");
    if (!body) return;
    body.querySelectorAll("tr").forEach((tr) => {
      const dateInput = tr.querySelector('input[name="last_contacted"]');
      applyRowTone(tr, daysSince(dateInput?.value));
    });
    refreshMeta();
  };

  const collect = () => {
    const body = $("campaign-body");
    const rows = body ? [...body.querySelectorAll("tr")] : [];
    return {
      objective: state.objective || "",
      contacts: rows.map((tr) => {
        const name = tr.querySelector('input[name="name"]')?.value?.trim() || "";
        const status =
          tr.querySelector('select[name="status"]')?.value?.trim() || "NA";
        const last =
          tr.querySelector('input[name="last_contacted"]')?.value?.trim() ||
          null;
        let feedback =
          tr.querySelector('textarea[name="feedback"]')?.value?.trim() || "NA";
        if (feedback === "") feedback = "NA";
        return {
          name,
          status: status || "NA",
          last_contacted: last || null,
          feedback,
        };
      }),
    };
  };

  const paint = (data) => {
    state = {
      objective: data.objective || "",
      contacts: sortContacts((data.contacts || []).map(normalizeContact)),
    };

    const panel = $("campaign-panel");
    if (panel) panel.hidden = false;

    const objective = $("campaign-objective");
    if (objective) objective.textContent = state.objective;

    const body = $("campaign-body");
    if (!body) return;
    body.replaceChildren(...state.contacts.map((contact) => renderRow(contact)));
    refreshMeta();
  };

  const downloadJson = () => {
    const payload = collect();
    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campaign.json";
    a.click();
    URL.revokeObjectURL(url);
    const hint = $("campaign-hint");
    if (hint) {
      hint.textContent =
        "Downloaded. Replace data/campaign.json, then run: python3 dev/encrypt_admin.py";
    }
  };

  const bindForm = () => {
    const form = $("campaign-form");
    form?.addEventListener("input", () => {
      saveDraft();
      refreshRowTones();
    });
    form?.addEventListener("change", () => {
      saveDraft();
      refreshRowTones();
    });
    $("campaign-download")?.addEventListener("click", downloadJson);
    $("campaign-resort")?.addEventListener("click", () => {
      paint(collect());
      saveDraft();
    });
  };

  const boot = () => {
    const gateEl = $("admin-gate");
    if (!gateEl || !window.DarGate) return;
    bindForm();

    window.DarGate.unlockAdmin({
      id: "campaign",
      encUrl: "data/campaign.enc.json",
      gateEl,
      onUnlock: (vault) => {
        paint(mergeDraft(vault));
        saveDraft();
      },
    });
  };

  boot();
})();
