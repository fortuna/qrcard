import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { createIcons, Download, Upload, Code, PlusCircle, UploadCloud, ArrowLeft, Lock, EyeOff, Infinity, Plus, X } from 'lucide';

// Initialize Lucide icons
function initIcons() {
  createIcons({
    icons: {
      Download,
      Upload,
      Code,
      PlusCircle,
      UploadCloud,
      ArrowLeft,
      Lock,
      EyeOff,
      Infinity,
      Plus,
      X
    }
  });
}
initIcons();

// DOM Elements
const startView = document.getElementById('start-view');
const appView = document.getElementById('app-view');
const mainHeader = document.getElementById('main-header');
const btnStartCreate = document.getElementById('btn-start-create');
const btnStartUpload = document.getElementById('btn-start-upload');
const btnBackHome = document.getElementById('btn-back-home');

const form = document.getElementById('vcard-form');
const canvas = document.getElementById('qr-canvas');
const placeholder = document.getElementById('qr-placeholder');
const btnDownload = document.getElementById('btn-download');
const uploadInput = document.getElementById('qr-upload');
const btnToggleRaw = document.getElementById('btn-toggle-raw');
const rawDataContainer = document.getElementById('raw-data-container');
const rawDataText = document.getElementById('raw-data-text');

// Form Inputs configurations
const staticInputs = ['firstName', 'lastName', 'organization', 'title', 'notes'];
const dynamicTypes = ['phone', 'email', 'website'];

// Current vCard Data state
let currentVCardString = "";
let currentRevString = "";

// Generate vCard String based on form inputs
function generateVCard() {
  const data = {};
  
  // Static fields
  staticInputs.forEach(id => {
    data[id] = document.getElementById(id).value.trim();
  });

  // Dynamic fields
  dynamicTypes.forEach(type => {
    const selector = `input[name="${type}"]`;
    data[type] = Array.from(document.querySelectorAll(selector))
      .map(input => input.value.trim())
      .filter(val => val !== "");
  });

  // Only generate if at least first name is present
  if (!data.firstName && !data.lastName) {
    canvas.style.display = 'none';
    placeholder.style.display = 'block';
    btnDownload.disabled = true;
    currentVCardString = "";
    currentRevString = "";
    rawDataText.textContent = "";
    return;
  }

  // Build vCard v3.0 format
  let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
  vcard += `N:${data.lastName};${data.firstName};;;\n`;
  vcard += `FN:${data.firstName} ${data.lastName}\n`;
  
  if (data.organization) vcard += `ORG:${data.organization}\n`;
  if (data.title) vcard += `TITLE:${data.title}\n`;
  
  // Multiple Phones
  data.phone.forEach((phone, index) => {
    const type = index === 0 ? 'cell,voice,pref' : 'cell,voice';
    vcard += `TEL;TYPE=${type}:${phone}\n`;
  });

  // Multiple Emails
  data.email.forEach((email, index) => {
    const type = index === 0 ? 'internet,pref' : 'internet';
    vcard += `EMAIL;TYPE=${type}:${email}\n`;
  });

  // Multiple Websites
  data.website.forEach(url => {
    vcard += `URL:${url}\n`;
  });

  if (data.notes) {
    // Escape newlines for vcard note
    let escapedNotes = data.notes.replace(/\n/g, '\\n');
    vcard += `NOTE:${escapedNotes}\n`;
  }
  
  // Add Revision Timestamp
  const now = new Date();
  currentRevString = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  vcard += `REV:${currentRevString}\n`;
  
  vcard += `END:VCARD`;
  currentVCardString = vcard;
  rawDataText.textContent = vcard;

  // Draw QR
  renderQRCode(vcard);
}

function renderQRCode(text) {
  // Use a nice dark style or light with dark modules to ensure scannability.
  // Generally, QR codes need high contrast. Let's make it white background and dark modules.
  QRCode.toCanvas(canvas, text, {
    width: 250,
    margin: 2,
    color: {
      dark:"#000000ff",
      light:"#ffffffff"
    }
  }, function (error) {
    if (error) {
      console.error(error);
      return;
    }
    canvas.style.display = 'block';
    placeholder.style.display = 'none';
    btnDownload.disabled = false;
  });
}

// Dynamic Field Management
function addDynamicField(type, value = '') {
  const container = document.getElementById(`${type}-container`);
  const row = document.createElement('div');
  row.className = 'dynamic-input-row';
  
  const placeholders = {
    phone: '+1 234 567 8900',
    email: 'john.doe@example.com',
    website: 'https://example.com'
  };

  const inputType = type === 'phone' ? 'tel' : (type === 'email' ? 'email' : 'url');

  row.innerHTML = `
    <input type="${inputType}" name="${type}" value="${value}" placeholder="${placeholders[type]}" class="dynamic-input">
    <button type="button" class="remove-field-btn" title="Remove">
      <i data-lucide="x"></i>
    </button>
  `;

  container.appendChild(row);
  
  // Add listener to new input
  row.querySelector('input').addEventListener('input', generateVCard);
  
  // Add listener to remove button
  row.querySelector('.remove-field-btn').addEventListener('click', () => {
    row.remove();
    generateVCard();
  });

  initIcons();
}

// Initial listeners for static fields
staticInputs.forEach(id => {
  document.getElementById(id).addEventListener('input', generateVCard);
});

// Primary dynamic input listeners
document.querySelectorAll('.dynamic-input').forEach(input => {
  input.addEventListener('input', generateVCard);
});

// Add buttons listeners
document.querySelectorAll('.add-field-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.getAttribute('data-type');
    addDynamicField(type);
  });
});

// Toggle Raw Data
btnToggleRaw.addEventListener('click', () => {
  rawDataContainer.classList.toggle('hidden');
});

// Download QR Code
btnDownload.addEventListener('click', () => {
  if (btnDownload.disabled) return;
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement('a');
  a.href = dataUrl;
  
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const namePart = (firstName || lastName) ? `${firstName}${lastName ? '-' + lastName : ''}-` : '';
  const rev = currentRevString || 'unknown';
  
  a.download = `viniCard-${namePart}${rev}.png`;
  
  a.click();
});

// Routing logic
function showAppView(pushState = true) {
  startView.classList.add('hidden');
  appView.classList.remove('hidden');
  mainHeader.classList.remove('hidden');
  
  if (pushState) {
    history.pushState({ view: 'app' }, '', '#edit');
  }
  
  // Trigger generation setup if form already has data
  generateVCard();
}

function showStartView(pushState = true) {
  startView.classList.remove('hidden');
  appView.classList.add('hidden');
  mainHeader.classList.add('hidden');
  
  if (pushState) {
    history.pushState({ view: 'start' }, '', '#');
  }
}

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
  if (event.state && event.state.view === 'app') {
    showAppView(false);
  } else {
    showStartView(false);
  }
});

// Set initial state on load
window.addEventListener('load', () => {
  // Initialize dynamic fields if empty
  dynamicTypes.forEach(type => {
    const container = document.getElementById(`${type}-container`);
    if (container.children.length === 0) {
      addDynamicField(type);
      // Remove the "Remove" button for the first mandatory field?
      // For now let's keep it to allow full flexibility.
    }
  });

  if (window.location.hash === '#edit') {
    showAppView(false);
  } else {
    history.replaceState({ view: 'start' }, '', '#');
  }
});

btnStartCreate.addEventListener('click', () => showAppView(true));
btnStartUpload.addEventListener('click', () => {
  uploadInput.click();
});
btnBackHome.addEventListener('click', () => {
  if (window.location.hash === '#edit') {
    history.back();
  } else {
    showStartView(true);
  }
});



// Handle QR Upload and Parsing
uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      // Decode with jsQR
      const uploadCanvas = document.createElement('canvas');
      const ctx = uploadCanvas.getContext('2d');
      uploadCanvas.width = img.width;
      uploadCanvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        parseVCardAndPopulate(code.data);
      } else {
        alert("Could not find or decode a QR code in the image.");
      }
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Helper: Parse vCard text back to form fields
/**
 * Pure function to parse vCard text into a data object.
 * Handles parameters like N;CHARSET=UTF-8: and multiple entries.
 */
function parseVCard(vcardText) {
  const lines = vcardText.split(/\r?\n/);
  const data = {
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phones: [],
    emails: [],
    websites: [],
    notes: ""
  };

  lines.forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;

    const tagPart = line.substring(0, colonIdx).split(';')[0].toUpperCase();
    const value = line.substring(colonIdx + 1).trim();

    switch (tagPart) {
      case 'N':
        const parts = value.split(';');
        data.lastName = parts[0] || "";
        data.firstName = parts[1] || "";
        break;
      case 'ORG':
        data.organization = value;
        break;
      case 'TITLE':
        data.title = value;
        break;
      case 'TEL':
        if (value) data.phones.push(value);
        break;
      case 'EMAIL':
        if (value) data.emails.push(value);
        break;
      case 'URL':
        if (value) data.websites.push(value);
        break;
      case 'NOTE':
        data.notes = value.replace(/\\n/g, '\n');
        break;
    }
  });

  return data;
}

// Helper: Parse vCard text back to form fields
function parseVCardAndPopulate(vcardText) {
  const data = parseVCard(vcardText);

  // Populate Static UI
  staticInputs.forEach(id => {
    if(document.getElementById(id)) {
      document.getElementById(id).value = data[id];
    }
  });

  // Handle Dynamic Fields
  dynamicTypes.forEach(type => {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = ''; // Clear all
    
    const values = type === 'phone' ? data.phones : (type === 'email' ? data.emails : data.websites);
    
    if (values.length === 0) {
      addDynamicField(type);
      const firstRemove = container.querySelector('.remove-field-btn');
      if (firstRemove) firstRemove.remove();
    } else {
      values.forEach(val => {
        addDynamicField(type, val);
      });
    }
  });

  showAppView(true);
}
