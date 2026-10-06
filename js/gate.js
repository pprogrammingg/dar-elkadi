(() => {
  const SESSION_KEY = "dar-elkadi-admin";

  const b64ToBytes = (b64) => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  };

  const deriveKey = async (password, salt, iterations) => {
    const base = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations,
        hash: "SHA-256",
      },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  };

  const decryptPayload = async (blob, password) => {
    if (!blob || blob.v !== 1 || blob.alg !== "AES-GCM") {
      throw new Error("Unsupported vault format");
    }
    const salt = b64ToBytes(blob.salt);
    const iv = b64ToBytes(blob.iv);
    const ct = b64ToBytes(blob.ct);
    const key = await deriveKey(password, salt, blob.iter || 250000);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ct
    );
    return JSON.parse(new TextDecoder().decode(plain));
  };

  const sessionGet = (id) => {
    try {
      return sessionStorage.getItem(`${SESSION_KEY}:${id}`);
    } catch {
      return null;
    }
  };

  const sessionSet = (id, password) => {
    try {
      sessionStorage.setItem(`${SESSION_KEY}:${id}`, password);
    } catch {
      /* private mode */
    }
  };

  const sessionClear = (id) => {
    try {
      sessionStorage.removeItem(`${SESSION_KEY}:${id}`);
    } catch {
      /* ignore */
    }
  };

  const showGate = (root, { error } = {}) => {
    root.hidden = false;
    const err = root.querySelector("[data-gate-error]");
    if (err) {
      err.textContent = error || "";
      err.hidden = !error;
    }
    const input = root.querySelector("[data-gate-input]");
    input?.focus();
  };

  const hideGate = (root) => {
    root.hidden = true;
  };

  /**
   * Unlock an admin page.
   * @param {{ id: string, encUrl: string, gateEl: HTMLElement, onUnlock: (data: object) => void }} opts
   */
  const unlockAdmin = async ({ id, encUrl, gateEl, onUnlock }) => {
    if (!window.crypto?.subtle) {
      showGate(gateEl, {
        error: "This browser cannot unlock the page (Web Crypto required).",
      });
      return;
    }

    let blob;
    try {
      const res = await fetch(encUrl, { cache: "no-store" });
      if (!res.ok) throw new Error("Vault missing");
      blob = await res.json();
    } catch {
      showGate(gateEl, {
        error: "Encrypted data not found. Deploy data/*.enc.json.",
      });
      return;
    }

    const tryPassword = async (password, { remember }) => {
      const data = await decryptPayload(blob, password);
      if (remember) sessionSet(id, password);
      hideGate(gateEl);
      document.documentElement.classList.add("is-admin-unlocked");
      onUnlock(data);
    };

    const cached = sessionGet(id);
    if (cached) {
      try {
        await tryPassword(cached, { remember: true });
        return;
      } catch {
        sessionClear(id);
      }
    }

    showGate(gateEl);

    const form = gateEl.querySelector("[data-gate-form]");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = gateEl.querySelector("[data-gate-input]");
      const password = (input?.value || "").trim();
      if (!password) {
        showGate(gateEl, { error: "Enter the password." });
        return;
      }
      const submit = gateEl.querySelector("[data-gate-submit]");
      if (submit) submit.disabled = true;
      try {
        await tryPassword(password, { remember: true });
      } catch {
        sessionClear(id);
        showGate(gateEl, { error: "Incorrect password." });
        if (input) {
          input.value = "";
          input.focus();
        }
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  };

  window.DarGate = { unlockAdmin, decryptPayload, sessionClear };
})();
