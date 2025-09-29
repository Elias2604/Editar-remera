// ==================== CONFIGURACIÓN DEL CANVAS ====================
const canvas = new fabric.Canvas("tshirtCanvas", {
  backgroundColor: "#e5e5e5",
  preserveObjectStacking: true,
  selection: true,
});

// Ajustar tamaño del canvas
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
  "img/blanco.png",
  "img/remera_rojo_1.png",
  "img/remera_verde_1.png",
  // agrega aquí otros frentes si tienes más
];
let tshirtBackImages = [
  "img/blanco_2.png",
  "img/remera_rojo_2.png",
  "img/remera_verde_2.png",
  // agrega aquí otros dorsos si tienes más
];
let currentTshirtIndex = 0;
let isFront = true;
let tshirtBase = null;

// Guardamos diseños independientes
let designs = {
  0: [], // frente
  1: []  // dorso
};

// ==================== CARGAR REMERA ====================
function loadTshirt() {
  const imagePath = isFront
    ? tshirtImages[currentTshirtIndex]
    : tshirtBackImages[currentTshirtIndex];

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

// ==================== GUARDAR Y RESTAURAR ====================
function saveCurrentDesign() {
  const key = currentTshirtIndex + (isFront ? "" : "_back");
  designs[key] = canvas
    .getObjects()
    .filter((obj) => obj !== tshirtBase)
    .map((obj) => obj.toObject());
}

function restoreDesign(key) {
  canvas.getObjects().forEach((obj) => {
    if (obj !== tshirtBase) canvas.remove(obj);
  });

  const saved = designs[key];
  if (saved && saved.length > 0) {
    fabric.util.enlivenObjects(saved, (objs) => {
      objs.forEach((obj) => canvas.add(obj));
      canvas.renderAll();
    });
  }
}

// ==================== CARGA INICIAL ====================
loadTshirt();

// ==================== CAMBIO DE VISTA CON TRANSICIÓN ====================
function transitionTshirt(newIndex) {
  // Aplica animación de salida
  const canvasEl = document.getElementById("tshirtCanvas");
  canvasEl.classList.add("flip-out");

  setTimeout(() => {
    saveCurrentDesign();
    currentTshirtIndex = newIndex;
    loadTshirt();
    restoreDesign(currentTshirtIndex + (isFront ? "" : "_back"));

    // Quita animación de salida y aplica animación de entrada
    canvasEl.classList.remove("flip-out");
    canvasEl.classList.add("flip-in");

    setTimeout(() => {
      canvasEl.classList.remove("flip-in");
    }, 400);
  }, 400);
}

// Flechas
document.getElementById("btnPrev").addEventListener("click", () => {
  const newIndex = (currentTshirtIndex - 1 + tshirtImages.length) % tshirtImages.length;
  transitionTshirt(newIndex);
});

document.getElementById("btnNext").addEventListener("click", () => {
  const newIndex = (currentTshirtIndex + 1) % tshirtImages.length;
  transitionTshirt(newIndex);
});

// Botón para girar entre frente y dorso con animación flip vertical
document.getElementById("btnFlip").addEventListener("click", () => {
  const canvasEl = document.getElementById("tshirtCanvas");
  canvasEl.classList.add("flip-vertical-out");

  setTimeout(() => {
    saveCurrentDesign();
    isFront = !isFront;
    loadTshirt();
    restoreDesign(currentTshirtIndex + (isFront ? "" : "_back"));

    canvasEl.classList.remove("flip-vertical-out");
    canvasEl.classList.add("flip-vertical-in");

    setTimeout(() => {
      canvasEl.classList.remove("flip-vertical-in");
    }, 400);
  }, 400);
});

// ==================== EDICIÓN ====================
document.getElementById("upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

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
      saveCurrentDesign();
    });
  };
  reader.readAsDataURL(file);

  // 🔧 Vaciar el input para permitir volver a elegir la misma imagen
  e.target.value = "";
});


document.getElementById("btnTexto").addEventListener("click", () => {
  const text = new fabric.IText("Texto personalizado", {
    left: canvas.width / 2 - 60,
    top: canvas.height / 2 - 30,
    fill: "#000",
    fontFamily: "Arial",
    fontSize: 24,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  saveCurrentDesign(); // 🔹 guarda el texto solo en el lado actual
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const active = canvas.getActiveObject();
  if (active && active !== tshirtBase) {
    canvas.remove(active);
    saveCurrentDesign(); // 🔹 actualiza diseño tras eliminar
  }
});

// ==================== TEXTO ====================
document.getElementById("textColor").addEventListener("input", (e) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "i-text") {
    active.set("fill", e.target.value);
    canvas.renderAll();
    saveCurrentDesign();
  }
});

document.getElementById("textFont").addEventListener("change", (e) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "i-text") {
    active.set("fontFamily", e.target.value);
    canvas.renderAll();
    saveCurrentDesign();
  }
});

document.getElementById("textSize").addEventListener("input", (e) => {
  const active = canvas.getActiveObject();
  if (active && active.type === "i-text") {
    active.set("fontSize", parseInt(e.target.value));
    canvas.renderAll();
    saveCurrentDesign();
  }
});

// ==================== CAMBIO DE COLOR (TINTADO) ====================
const colorCircles = document.querySelectorAll(".color-circle");

colorCircles.forEach((circle) => {
  circle.addEventListener("click", () => {
    if (!tshirtBase) return;
    const color = circle.style.backgroundColor;

    tshirtBase.filters = [];
    tshirtBase.filters.push(
      new fabric.Image.filters.BlendColor({
        color: color,
        mode: "tint",
        alpha: 0.8,
      })
    );
    tshirtBase.applyFilters();
    canvas.renderAll();
  });
});

// ==================== BOTONES MÓVILES ====================
document.getElementById("btnTextoMobile").addEventListener("click", () => {
  const text = new fabric.IText("Texto personalizado", {
    left: canvas.width / 2 - 60,
    top: canvas.height / 2 - 30,
    fill: "#000",
    fontFamily: "Arial",
    fontSize: 24,
  });
  canvas.add(text);
  canvas.setActiveObject(text);
  saveCurrentDesign();
});

document.getElementById("deleteBtnMobile").addEventListener("click", () => {
  const active = canvas.getActiveObject();
  if (active && active !== tshirtBase) {
    canvas.remove(active);
    saveCurrentDesign();
  }
});

// Al tocar "Color" en móvil: abrir un selector rápido de color
document.getElementById("colorBtnMobile").addEventListener("click", () => {
  const color = prompt("Ingrese un color (nombre o código HEX):", "#ff0000");
  if (!color || !tshirtBase) return;
  tshirtBase.filters = [
    new fabric.Image.filters.BlendColor({
      color: color,
      mode: "tint",
      alpha: 0.8,
    }),
  ];
  tshirtBase.applyFilters();
  canvas.renderAll();
});

