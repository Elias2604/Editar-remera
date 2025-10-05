const canvas = new fabric.Canvas("tshirtCanvas", {
  backgroundColor: "#000000",
  preserveObjectStacking: true,
  selection: true,
});

let tshirtFront = [
  "img/remera_blanca_1.jpeg",
  "img/remera_rojo_1.png",
  "img/remera_bordo_1.png",
  "img/remera_azul_1.png",
];
let tshirtBack = [
  "img/remera_blanca_2.jpeg",
  "img/remera_rojo_2.png",
  "img/remera_bordo_2.png",
  "img/remera_azul_2.png",
];

let currentColorIndex = 0;
let isFront = true;
let tshirtBase = null;

function loadTshirt() {
  const path = isFront ? tshirtFront[currentColorIndex] : tshirtBack[currentColorIndex];
  fabric.Image.fromURL(path, (img) => {
    if (tshirtBase) canvas.remove(tshirtBase);
    img.scaleToWidth(canvas.width * 0.9);
    img.set({ selectable: false, evented: false });
    tshirtBase = img;
    canvas.add(img);
    canvas.sendToBack(img);
    canvas.renderAll();
  });
}

loadTshirt();

// Girar (animación lateral)
document.getElementById("btnPrev").addEventListener("click", () => flipShirt());
document.getElementById("btnNext").addEventListener("click", () => flipShirt());

function flipShirt() {
  const canvasEl = document.getElementById("tshirtCanvas");
  canvasEl.classList.add("flip-out");
  setTimeout(() => {
    isFront = !isFront;
    loadTshirt();
    canvasEl.classList.remove("flip-out");
    canvasEl.classList.add("flip-in");
    setTimeout(() => canvasEl.classList.remove("flip-in"), 400);
  }, 400);
}

// Fade al cambiar color
const colorCircles = document.querySelectorAll(".color-circle");
colorCircles.forEach((circle, i) => {
  circle.addEventListener("click", () => {
    currentColorIndex = i % tshirtFront.length;
    const canvasEl = document.getElementById("tshirtCanvas");
    canvasEl.classList.add("fade-out");
    setTimeout(() => {
      loadTshirt();
      canvasEl.classList.remove("fade-out");
      canvasEl.classList.add("fade-in");
      setTimeout(() => canvasEl.classList.remove("fade-in"), 300);
    }, 300);
  });
});

// Subir imagen
document.getElementById("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (f) => {
    fabric.Image.fromURL(f.target.result, (img) => {
      img.scale(0.4);
      img.set({ left: canvas.width / 2 - 50, top: canvas.height / 2 - 50 });
      canvas.add(img);
      canvas.setActiveObject(img);
    });
  };
  reader.readAsDataURL(file);
  e.target.value = "";
});

// Limpiar imagen seleccionada
document.getElementById("clearImage").addEventListener("click", () => {
  const obj = canvas.getActiveObject();
  if (obj && obj !== tshirtBase) {
    canvas.remove(obj);
  }
});

// ==================== EXPORTAR PNG ====================
document.getElementById("exportBtn").addEventListener("click", () => {
  const dataURL = canvas.toDataURL({
    format: "png",
    quality: 1.0,
  });

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "mi_diseño.png";
  link.click();
});

// ==================== MODAL ENVIAR DISEÑO ====================
const sendBtn = document.getElementById("sendBtn");
const sendModal = document.getElementById("sendModal");
const closeModal = document.getElementById("closeModal");

sendBtn.addEventListener("click", () => sendModal.style.display = "flex");
closeModal.addEventListener("click", () => sendModal.style.display = "none");

document.getElementById("sendWhatsapp").addEventListener("click", () => {
  const mensaje = encodeURIComponent(document.getElementById("mensajeExtra").value);
  const url = `https://wa.me/+5491166415906?text=Hola! Quiero enviar mi diseño personalizado.%0A${mensaje}`;
  window.open(url, "_blank");
});

document.getElementById("sendEmail").addEventListener("click", () => {
  const mensaje = encodeURIComponent(document.getElementById("mensajeExtra").value);
  const mailto = `mailto:contacto@kael.com?subject=Nuevo diseño personalizado&body=${mensaje}`;
  window.location.href = mailto;
});
