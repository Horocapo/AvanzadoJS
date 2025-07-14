const formulario = document.getElementById("formularioProducto");
const listaProductos = document.getElementById("listaProductos");
const totalProductos = document.getElementById("totalProductos");
const totalCantidad = document.getElementById("totalCantidad");
const valorTotal = document.getElementById("valorTotal");

let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

function renderInventario() {
  listaProductos.innerHTML = "";

  if (inventario.length === 0) {
    listaProductos.innerHTML = `<div class="sin-productos"><p>No hay productos agregados</p></div>`;
    actualizarStats();
    return;
  }

  inventario.forEach((prod, index) => {
    const item = document.createElement("div");
    item.className = "producto-item";
    item.innerHTML = `
      <div class="producto-header">
        <div>
          <div class="producto-nombre">${prod.nombre}</div>
          <div class="producto-precio">$${prod.precio.toFixed(2)}</div>
          <div class="producto-categoria">${prod.categoria}</div>
        </div>
        <div class="producto-controles">
          <div class="cantidad-controles">
            <button class="btn-cantidad" data-accion="restar" data-index="${index}">-</button>
            <div class="cantidad-display">${prod.cantidad}</div>
            <button class="btn-cantidad" data-accion="sumar" data-index="${index}">+</button>
          </div>
          <button class="btn-eliminar" data-index="${index}">Eliminar</button>
        </div>
      </div>
    `;
    listaProductos.appendChild(item);
  });

  actualizarStats();
}

function actualizarStats() {
  const total = inventario.length;
  const cantidadTotal = inventario.reduce((sum, p) => sum + p.cantidad, 0);
  const valor = inventario.reduce((sum, p) => sum + p.cantidad * p.precio, 0);

  totalProductos.textContent = total;
  totalCantidad.textContent = cantidadTotal;
  valorTotal.textContent = `$${valor.toFixed(2)}`;
}

function guardarInventario() {
  localStorage.setItem("inventario", JSON.stringify(inventario));
}

formulario.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombreProducto").value.trim();
  const precio = parseFloat(document.getElementById("precioProducto").value);
  const categoria = document.getElementById("categoriaProducto").value;
  const cantidad = parseInt(document.getElementById("cantidadProducto").value);

  if (!nombre || isNaN(precio) || !categoria || isNaN(cantidad)) return;

  const nuevoProducto = { nombre, precio, categoria, cantidad };
  inventario.push(nuevoProducto);
  guardarInventario();
  renderInventario();
  formulario.reset();
});

listaProductos.addEventListener("click", function (e) {
  const index = e.target.dataset.index;
  if (e.target.classList.contains("btn-eliminar")) {
    inventario.splice(index, 1);
  } else if (e.target.dataset.accion === "sumar") {
    inventario[index].cantidad++;
  } else if (e.target.dataset.accion === "restar") {
    if (inventario[index].cantidad > 1) inventario[index].cantidad--;
  }
  guardarInventario();
  renderInventario();
});

// Inicial
renderInventario();