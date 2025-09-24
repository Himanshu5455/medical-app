function buildUrl(path) {
  const base = import.meta.env.VITE_API_BASE_URL || '';
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
  try { data = await response.json(); } catch (e) { }

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

// Login user
export async function loginUser(payload, useForm = true) {
  let options = {
    method: "POST",
    headers: {},
    body: null,
  };
  if (useForm) {
    // Backend expects form-data style (FastAPI / OAuth2PasswordRequestForm)
    const formBody = new URLSearchParams();
    formBody.append("username", payload.username);
    formBody.append("password", payload.password);

    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = formBody.toString();
  } else {
    // Backend expects JSON body
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }
  const response = await fetch(buildUrl("/auth/login"), options);
  let data = null;
  try {
    data = await response.json();
  } catch (e) {}

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

// Get current authenticated user
export async function getMe() {
  const token = localStorage.getItem('token');
  const headers = {"ngrok-skip-browser-warning": "true",};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(buildUrl('/auth/me'), { headers });
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

// Update first and last name for the current user
export async function updateName({ firstName, lastName }) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = JSON.stringify({
    first_name: firstName,
    last_name: lastName,
  });

  const response = await fetch(buildUrl('/auth/update-name'), {
    method: 'PATCH',
    headers,
    body,
  });
  let data = null;
  try {
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await response.json();
    }
  } catch (e) {}

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


//Change password
export const changePassword = async (newPassword) => {
  try {
    const response = await fetch(buildUrl('/auth/change-password'), {
      method: "PATCH", // or PUT if backend expects that
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    
      },
      body: JSON.stringify({
        new_password: newPassword, // backend expects exactly this
      }),
    });

    const data = await response.json();
    console.log("Change Password Response:", data);
    console.log("Response Status:", response.status);

    if (!response.ok) {
      throw new Error(data?.detail || data?.message || "Failed to change password");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// /auth/my-created-users
// Get AllUsers data
export const getUsers = async () => {
  try {
    const response = await fetch(buildUrl('/auth/my-created-users'), { // update backend URL
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.detail || errData?.message || "Failed to fetch users");
    }

    const data = await response.json();

    // map backend user fields to frontend model
    return data.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.username, // using username as placeholder
      role: user.role,
      status: "Active",      // default value for now
    }));
  } catch (error) {
    throw error;
  }
};


