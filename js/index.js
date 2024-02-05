// Autor: Steven Useche
// Fecha: 2024-02-04
// Descripción: Este script proporciona funcionalidades para interactuar con una base de datos 
//              de personas, permitiendo agregar, obtener, eliminar y actualizar información. 
//              También incluye la manipulación de archivos y la visualización en una interfaz de usuario.

const database = require('./js/database');
const { app } = require('electron').remote;
const path = require('path');

/**
 * Evento que se ejecuta al cargar la ventana.
 */
window.onload = function() {
  // Poblar la tabla con los datos existentes.
  populateTable();

  // Agregar evento al botón "Agregar".
  document.getElementById('add').addEventListener('click', () => {
    var firstname = document.getElementById('firstname');
    var lastname = document.getElementById('lastname');
    var year = document.getElementById('year');
    var fileInput = document.getElementById('fileInput');
    const filePath = fileInput.files[0].path;

    // Agregar persona a la base de datos y copiar el archivo a la carpeta de imágenes.
    database.addPerson(firstname.value, lastname.value, year.value, filePath);

    // Limpiar los campos del formulario.
    firstname.value = '';
    lastname.value = '';
    year.value = '';
    fileInput.value = '';

    // Actualizar la tabla y mostrar un mensaje de éxito.
    populateTable();
    alert('Usuario creado exitosamente.');
  });
}

/**
 * Función para poblar la tabla con datos de la base de datos.
 * @param {string} filter - Filtro para buscar personas en la tabla.
 */
function populateTable(filter = '') {
  database.getPersons(function(persons) {
    var tableBodyElement = document.getElementById('tablebody');

    tableBodyElement.innerHTML = '';

    if (persons.length === 0) {
      tableBodyElement.innerHTML = '<tr><td colspan="7">No hay datos disponibles</td></tr>';
      return;
    }

    for (let i = 0; i < persons.length; i++) {
      const person = persons[i];

      const fullName = person.firstname.toLowerCase() + ' ' + person.lastname.toLowerCase();
      if (fullName.includes(filter.toLowerCase()) || filter === '') {
        const row = document.createElement('tr');

        row.innerHTML = `
          <td>${person.firstname}</td>
          <td>${person.lastname}</td>
          <td>${person.year}</td>
          <td>${person.fileInput}</td>
          <td><input type="button" value="Delete" onclick="deletePerson('${person._id}')"></td>
          <td><input type="button" value="Update" onclick="showUpdateForm('${person._id}', '${person.firstname}', '${person.lastname}', '${person.year}', '${person.fileInput}')"></td>
          <td><button onclick="downloadFile('${person.fileInput}')">Descargar Archivo</button></td>
        `;

        tableBodyElement.appendChild(row);
      }
    }

    if (tableBodyElement.children.length === 0) {
      tableBodyElement.innerHTML = '<tr><td colspan="7">No hay coincidencias con el filtro</td></tr>';
    }
  });
}

/**
 * Función para realizar una búsqueda y actualizar la tabla.
 */
function searchAndUpdateTable() {
  var searchInputValue = document.getElementById('searchInput').value;
  populateTable(searchInputValue);
}

/**
 * Elimina una persona de la base de datos y actualiza la tabla.
 * @param {string} id - Identificador único de la persona a eliminar.
 */
function deletePerson(id) {
  database.deletePerson(id);
  populateTable();
  alert('Usuario eliminado exitosamente.');
}

/**
 * Cierra el modal de actualización de datos.
 */
function closeUpdateModal() {
  document.getElementById('updateModal').style.display = 'none';
}

/**
 * Muestra el formulario de actualización de datos.
 * @param {string} id - Identificador único de la persona a actualizar.
 * @param {string} firstname - Nombre actual de la persona.
 * @param {string} lastname - Apellido actual de la persona.
 * @param {number} year - Año de nacimiento actual de la persona.
 * @param {string} fileInput - Ruta del archivo actual de la persona.
 */
function showUpdateForm(id, firstname, lastname, year, fileInput) {
  document.getElementById('updatedFirstname').value = firstname;
  document.getElementById('updatedLastname').value = lastname;
  document.getElementById('updatedYear').value = year;
  document.getElementById('updateModal').style.display = 'block';
  document.getElementById('update').dataset.idToUpdate = id; // Almacena el ID para su uso posterior
}

/**
 * Actualiza la información de una persona en la base de datos y actualiza la tabla.
 */
function updatePerson() {
  var updatedFirstname = document.getElementById('updatedFirstname').value;
  var updatedLastname = document.getElementById('updatedLastname').value;
  var updatedYear = document.getElementById('updatedYear').value;
  var updatedFileInput = document.getElementById('updatedFileInput').value;

  var idToUpdate = document.getElementById('update').dataset.idToUpdate;

  database.updatePerson(idToUpdate, updatedFirstname, updatedLastname, updatedYear, updatedFileInput);

  // Cierra el modal de actualización y actualiza la tabla.
  closeUpdateModal();
  populateTable();
}

/**
 * Abre un diálogo para guardar el archivo en una ubicación específica.
 * @param {string} filePath - Ruta del archivo a descargar.
 */
function downloadFile(filePath) {
  const { dialog } = require('electron').remote;

  dialog.showSaveDialog({
    defaultPath: filePath, 
    buttonLabel: 'Guardar', 
    title: 'Guardar Archivo', 
    filters: [
      { name: 'Archivos de Texto', extensions: ['txt'] },
    ],
  }).then(result => {
    if (!result.canceled && result.filePath) {
      const fs = require('fs').promises;
      fs.copyFile(filePath, result.filePath)
        .then(() => {
          console.log('Archivo guardado exitosamente en la ubicación seleccionada:', result.filePath);
        })
        .catch(error => {
          console.error('Error al guardar el archivo:', error);
        });
    }
  });
}
