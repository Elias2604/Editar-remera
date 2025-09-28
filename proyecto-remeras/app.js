// ==================== CONFIGURACIÓN DEL CANVAS ====================
const canvas = new fabric.Canvas("tshirtCanvas", {
  backgroundColor: "#f5f5f5",
  preserveObjectStacking: true,
  selection: true,
});

function resizeCanvas() {
  const editor = document.querySelector(".editor");
  const rect = editor.getBoundingClientRect();
  canvas.setWidth(rect.width * 0.7);
  canvas.setHeight(rect.height * 0.8);
  canvas.renderAll();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==================== DATOS DE REMERAS ====================
let tshirtSets = {
  blanco: ["img/remera_amarillo_1.png", "img/remera_amarrillo_2.png"],
  negro: ["img/remera_bordo_1.png", "img/remera_bordo_2.png"],
  rojo: ["img/remera_roja_1.png", "img/remera_roja_2.png"],
  azul: ["img/remera_azul_1.png", "img/remera_azul_2.png"],
  verde: ["img/remera_verde_1.png", "img/remera_verde_2.png"],
};

let currentColor = "azul";
let tshirtImages = tshirtSets[currentColor];
let currentTshirtIndex = 0;
let tshirtBase = null;

// Diseños guardados por color y lado
let designs = {
  blanco: { 0: [], 1: [] },
  negro: { 0: [], 1: [] },
  rojo: { 0: [], 1: [] },
  azul: { 0: [], 1: [] },
  verde: { 0: [], 1: [] },
};

// ==================== FUNCIONES DE CARGA Y GUARDADO ====================
function loadTshirt(imagePath) {
  fabric.Image.fromURL(imagePath, (img) => {
    if (tshirtBase) canvas.remove(tshirtBase);

    img.scaleToWidth(canvas.width * 0.8);
    img.set({
      selectable: false,
      evented: false,
      left: canvas.width / 2 - (img.width * img.scaleX) / 2,
      top: canvas.height / 2 - (img.height * img.scaleY) / 2,
    });

    tshirtBase = img;
    canvas.add(img);
    canvas.sendToBack(img);
    canvas.renderAll();
  });
}

function saveCurrentDesign() {
  designs[currentColor][currentTshirtIndex] = canvas
    .getObjects()
    .filter((obj) => obj !== tshirtBase)
    .map((obj) => obj.toObject());
}

function restoreDesign(color, index) {
  canvas.getObjects().forEach((obj) => {
    if (obj !== tshirtBase) canvas.remove(obj);
  });

  const saved = designs[color][index];
  if (saved && saved.length > 0) {
    fabric.util.enlivenObjects(saved, (objs) => {
      objs.forEach((obj) => canvas.add(obj));
      canvas.renderAll();
    });
  }
}

// Cargar remera inicial
loadTshirt(tshirtImages[currentTshirtIndex]);

// ==================== ANIMACIÓN DE TRANSICIÓN ====================
function transitionTshirt(newIndex) {
  const canvasElement = document.getElementById("tshirtCanvas");
  saveCurrentDesign();

  canvasElement.classList.add("flip-out");

  setTimeout(() => {
    currentTshirtIndex = newIndex;
    loadTshirt(tshirtImages[currentTshirtIndex]);
    restoreDesign(currentColor, currentTshirtIndex);

    canvasElement.classList.remove("flip-out");
    canvasElement.classList.add("flip-in");
    setTimeout(() => canvasElement.classList.remove("flip-in"), 400);
  }, 400);
}

// ==================== CONTROLES ====================
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const upload = document.getElementById("upload");
const addTextBtn = document.getElementById("btnTexto");
const deleteBtn = document.getElementById("deleteBtn");
const colorCircles = document.querySelectorAll(".color-circle");
const textColor = document.getElementById("textColor");
const textFont = document.getElementById("textFont");
const textSize = document.getElementById("textSize");

// Botones prev / next
btnPrev.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const newIndex =
    (currentTshirtIndex - 1 + tshirtImages.length) % tshirtImages.length;
  transitionTshirt(newIndex);
});

btnNext.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  const newIndex = (currentTshirtIndex + 1) % tshirtImages.length;
  transitionTshirt(newIndex);
});

// ==================== EVENTOS DE EDICIÓN ====================

// Subir imagen
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (f) => {
    fabric.Image.fromURL(f.target.result, (img) => {
      img.scale(0.3);
      img.set({
        left: canvas.width / 2 - 50,
        top: canvas.height / 2 - 50,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
    });
  };
  reader.readAsDataURL(file);
});

// Agregar texto
addTextBtn.addEventListener("click", () => {
  const text = new fabric.IText("Texto personalizado", {
    left: canvas.width / 2 - 60,
    top: canvas.height / 2 - 30,
    fill: "#000",
    fontFamily: "Arial",
    fontSize: 24,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
});

// Eliminar seleccionado
deleteBtn.addEventListener("click", () => {
  const active = canvas.getActiveObject();
  if (active && active !== tshirtBase) canvas.remove(active);
});

// Cambiar color de texto
textColor.addEventListener("input", (e) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "i-text") {
    active.set("fill", e.target.value);
    canvas.renderAll();
  }
});

// Cambiar tipografía
textFont.addEventListener("change", (e) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "i-text") {
    active.set("fontFamily", e.target.value);
    canvas.renderAll();
  }
});

// Cambiar tamaño del texto
textSize.addEventListener("input", (e) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "i-text") {
    active.set("fontSize", parseInt(e.target.value));
    canvas.renderAll();
  }
});

// ==================== CAMBIO DE MODELO POR COLOR ====================
colorCircles.forEach((circle) => {
  circle.addEventListener("click", () => {
    const newColor = circle.dataset.color;
    if (newColor === currentColor) return;

    saveCurrentDesign();

    currentColor = newColor;
    tshirtImages = tshirtSets[newColor];
    currentTshirtIndex = 0;

    transitionTshirt(currentTshirtIndex);
  });
});

git init
