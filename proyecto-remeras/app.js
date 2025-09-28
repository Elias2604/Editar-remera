// ==================== CONFIGURACIÓN DEL CANVAS ====================
const canvas = new fabric.Canvas("tshirtCanvas", {
  backgroundColor: "#f5f5f5",
  preserveObjectStacking: true,
  selection: true,
});

// Ajustar tamaño del canvas al contenedor
function resizeCanvas() {
  const editor = document.querySelector(".editor");
  const rect = editor.getBoundingClientRect();
  canvas.setWidth(rect.width * 0.7);
  canvas.setHeight(rect.height * 0.8);
  canvas.renderAll();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ==================== REMERAS (FRENTE / DORSO) ====================
let tshirtImages = [
  "img/remera_azul_1.png", // frontal
  "img/remera_azul_2.png", // trasera
];
let currentTshirtIndex = 0;
let tshirtBase = null;

// Guardamos diseños separados para cada lado
let designs = {
  0: [], // frente
  1: [], // dorso
};

// Cargar una remera en el canvas
function loadTshirt(imagePath) {
  fabric.Image.fromURL(imagePath, (img) => {
    if (tshirtBase) canvas.remove(tshirtBase);

    // Escalar y centrar imagen base
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

// Guardar el diseño actual (sin la remera base)
function saveCurrentDesign() {
  designs[currentTshirtIndex] = canvas
    .getObjects()
    .filter((obj) => obj !== tshirtBase)
    .map((obj) => obj.toObject());
}

// Restaurar un diseño guardado
function restoreDesign(index) {
  // Eliminar todos los objetos menos la base
  canvas.getObjects().forEach((obj) => {
    if (obj !== tshirtBase) canvas.remove(obj);
  });

  const saved = designs[index];
  if (saved && saved.length > 0) {
    fabric.util.enlivenObjects(saved, (objs) => {
      objs.forEach((obj) => canvas.add(obj));
      canvas.renderAll();
    });
  }
}

// Cargar la remera inicial
loadTshirt(tshirtImages[currentTshirtIndex]);

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

// ==================== CAMBIO DE MODELO CON TRANSICIÓN ====================
function transitionTshirt(newIndex) {
  const canvasElement = document.getElementById("tshirtCanvas");

  // Guardar el diseño actual antes de cambiar
  saveCurrentDesign();

  // Animación de salida
  canvasElement.classList.add("flip-out");

  setTimeout(() => {
    currentTshirtIndex = newIndex;
    loadTshirt(tshirtImages[currentTshirtIndex]);

    // Restaurar el diseño correspondiente al nuevo lado
    restoreDesign(currentTshirtIndex);

    // Animación de entrada
    canvasElement.classList.remove("flip-out");
    canvasElement.classList.add("flip-in");

    // Quitar clase de entrada al terminar
    setTimeout(() => {
      canvasElement.classList.remove("flip-in");
    }, 400);
  }, 400);
}

// Botones de navegación
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

// ==================== FUNCIONES DE EDICIÓN ====================

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

// Cambiar color del fondo (simulación del color de la remera)
colorCircles.forEach((circle) => {
  circle.addEventListener("click", () => {
    canvas.setBackgroundColor(
      circle.dataset.color,
      canvas.renderAll.bind(canvas)
    );
  });
});
