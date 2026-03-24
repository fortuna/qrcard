import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { createIcons, Download, Upload, Code, PlusCircle, UploadCloud, ArrowLeft } from 'lucide';

// Initialize Lucide icons
createIcons({
  icons: {
    Download,
    Upload,
    Code,
    PlusCircle,
    UploadCloud,
    ArrowLeft
  }
});

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

// Form Inputs
const inputs = ['firstName', 'lastName', 'organization', 'title', 'phone', 'email', 'website', 'notes'];

// Current vCard Data state
let currentVCardString = "";
let currentRevString = "";

// Generate vCard String based on form inputs
function generateVCard() {
  const data = {};
  inputs.forEach(id => {
    data[id] = document.getElementById(id).value.trim();
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
  if (data.phone) vcard += `TEL;TYPE=cell,voice:${data.phone}\n`;
  if (data.email) vcard += `EMAIL;TYPE=internet,pref:${data.email}\n`;
  if (data.website) vcard += `URL:${data.website}\n`;
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

// Event Listeners for Input real-time generation
inputs.forEach(id => {
  document.getElementById(id).addEventListener('input', generateVCard);
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
  
  const rev = currentRevString || 'unknown';
  a.download = `viniCard-${rev}.png`;
  
  a.click();
});

// Routing logic
function showAppView() {
  startView.classList.add('hidden');
  appView.classList.remove('hidden');
  mainHeader.classList.remove('hidden');
  // Trigger generation setup if form already has data
  generateVCard();
}

function showStartView() {
  startView.classList.remove('hidden');
  appView.classList.add('hidden');
  mainHeader.classList.add('hidden');
}

btnStartCreate.addEventListener('click', showAppView);
btnStartUpload.addEventListener('click', () => {
  uploadInput.click();
});
btnBackHome.addEventListener('click', showStartView);



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
function parseVCardAndPopulate(vcardText) {
  const lines = vcardText.split(/\r?\n/);
  const data = {
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    notes: ""
  };

  lines.forEach(line => {
    if (line.startsWith('N:')) {
      // N:LastName;FirstName;;;
      const parts = line.substring(2).split(';');
      data.lastName = parts[0] || "";
      data.firstName = parts[1] || "";
    } else if (line.startsWith('ORG:')) {
      data.organization = line.substring(4);
    } else if (line.startsWith('TITLE:')) {
      data.title = line.substring(6);
    } else if (line.startsWith('TEL')) {
      // TEL;TYPE=cell,voice:+123...
      const idx = line.indexOf(':');
      if (idx !== -1) data.phone = line.substring(idx + 1);
    } else if (line.startsWith('EMAIL')) {
      const idx = line.indexOf(':');
      if (idx !== -1) data.email = line.substring(idx + 1);
    } else if (line.startsWith('URL')) {
      const idx = line.indexOf(':');
      if (idx !== -1) data.website = line.substring(idx + 1);
    } else if (line.startsWith('NOTE:')) {
      let decodedNotes = line.substring(5).replace(/\\n/g, '\n');
      data.notes = decodedNotes;
    }
  });

  // Populate UI
  inputs.forEach(id => {
    if(document.getElementById(id)) {
      document.getElementById(id).value = data[id];
    }
  });

  showAppView();
}
