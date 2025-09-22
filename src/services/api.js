function buildUrl(path) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
  console.log("base", base)
  if (!base) return path; 
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function registerCustomer(payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // Special handling for file uploads
    if (k === 'files' && Array.isArray(v)) {
      v.forEach((item) => {
        if (item instanceof File || item instanceof Blob) {
          const fileName = item.name || 'upload.dat';
          form.append('files', item, fileName);
        }
      });
      return;
    }
    if (Array.isArray(v)) {
      form.append(k, JSON.stringify(v));
      return;
    }
    if (typeof v === 'object') {
      form.append(k, JSON.stringify(v));
      return;
    }
    form.append(k, String(v));
  });

  const response = await fetch(buildUrl('/mfc/register-customer'), {
    method: 'POST',
    body: form
  });
  let data = null;
  try { data = await response.json(); } catch (e) {}

  if (!response.ok) {
    const detail = data && (data.message || data.error || JSON.stringify(data));
    const message = (detail && String(detail)) || `Request failed with status ${response.status} ${response.statusText || ''}`.trim();
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function serializeCustomerPayload(answers) {
  const payload = { ...answers };

  
  if (typeof payload.dob === 'string') {
    const m = payload.dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      payload.dob = `${yyyy}-${mm}-${dd}`;
    }
  }

 
  if (typeof payload.pain_scale === 'string' && payload.pain_scale !== '') {
    const n = Number(payload.pain_scale);
    if (!Number.isNaN(n)) payload.pain_scale = n;
  }
  if (typeof payload.rate_experience === 'string' && payload.rate_experience !== '') {
    const n = Number(payload.rate_experience);
    if (!Number.isNaN(n)) payload.rate_experience = n;
  }

  // Remove empty files array; keep actual File objects as-is
  if (Array.isArray(payload.files) && payload.files.length === 0) {
    delete payload.files;
  }

  // Remove empty optional strings to satisfy strict validators
  Object.keys(payload).forEach((key) => {
    if (payload[key] === '') delete payload[key];
  });

  return payload;
}

export async function loginUser(payload) {

  
  const response = await fetch(buildUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // ✅ Sending JSON
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // Endpoint might not return JSON
  }


  if (!response.ok) {
    const detail = data && (data.message || data.error || JSON.stringify(data));
    const message =
      detail ||
      `Request failed with status ${response.status} ${response.statusText || ""}`.trim();
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}


  