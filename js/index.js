const database = require('./js/database');
const { app } = require('electron').remote;
const path = require('path');  // Agrega esta línea

window.onload = function() {

  // Populate the table
  populateTable();

  // Add the add button click event
  document.getElementById('add').addEventListener('click', () => {

    // Retrieve the input fields
    var firstname = document.getElementById('firstname');
    var lastname = document.getElementById('lastname');
    var year = document.getElementById('year');
    var fileInput = document.getElementById('fileInput');
    const filePath = fileInput.files[0].path;

    // Save the person in the database
    database.addPerson(firstname.value, lastname.value, year.value, filePath);

    // Reset the input fields
    firstname.value = '';
    lastname.value = '';
    year.value = '';
    fileInput.value = ''; 

    // Repopulate the table
    populateTable();
    alert('Usuario creado exitosamente.');

  });
}



// Populates the persons table with optional search filter
function populateTable(filter = '') {
  // Retrieve the persons
  database.getPersons(function(persons) {
    // Get the table body element
    var tableBodyElement = document.getElementById('tablebody');

    // Clear existing table content
    tableBodyElement.innerHTML = '';

    // Check if there are no persons
    if (persons.length === 0) {
      tableBodyElement.innerHTML = '<tr><td colspan="6">No hay datos disponibles</td></tr>';
      return;
    }

    // Generate the table body
    for (let i = 0; i < persons.length; i++) {
      const person = persons[i];

      // Check if the person matches the search filter
      const fullName = person.firstname.toLowerCase() + ' ' + person.lastname.toLowerCase();
      if (fullName.includes(filter.toLowerCase()) || filter === '') {
        // Create a table row
        const row = document.createElement('tr');

        // Populate the row with person data
        row.innerHTML = `
          <td>${person.firstname}</td>
          <td>${person.lastname}</td>
          <td>${person.year}</td>
          <td>${person.fileInput}</td>
          <td><input type="button" value="Delete" onclick="deletePerson('${person._id}')"></td>
          <td><input type="button" value="Update" onclick="showUpdateForm('${person._id}', '${person.firstname}', '${person.lastname}', '${person.year}', '${person.fileInput}')"></td>
          <td><button onclick="downloadFile('${person.fileInput}')">Descargar Archivo</button></td>
        `;

        // Append the row to the table body
        tableBodyElement.appendChild(row);
      }
    }

    // Check if no matching persons found
    if (tableBodyElement.children.length === 0) {
      tableBodyElement.innerHTML = '<tr><td colspan="6">No hay coincidencias con el filtro</td></tr>';
    }
  });
}

function searchAndUpdateTable() {
  // Obtén el valor del campo de búsqueda
  var searchInputValue = document.getElementById('searchInput').value;

  // Llama a la función populateTable con el filtro de búsqueda
  populateTable(searchInputValue);
}


// Deletes a person
function deletePerson(id) {

  // Delete the person from the database
  database.deletePerson(id);

  // Repopulate the table
  populateTable();
  alert('Usuario eliminado exitosamente.');
}

function closeUpdateModal() {
  document.getElementById('updateModal').style.display = 'none';
}
// Añade la función para mostrar el modal de actualización
function showUpdateForm(id, firstname, lastname, year, fileInput) {
  document.getElementById('updatedFirstname').value = firstname;
  document.getElementById('updatedLastname').value = lastname;
  document.getElementById('updatedYear').value = year;
  // Repite lo mismo para otros campos actualizados
  document.getElementById('updateModal').style.display = 'block';
  document.getElementById('update').dataset.idToUpdate = id; // Almacena el ID para su uso posterior
}

// Añade la función de actualización (ajusta según sea necesario)
function updatePerson() {
  // Obtiene los datos actualizados del modal
  var updatedFirstname = document.getElementById('updatedFirstname').value;
  var updatedLastname = document.getElementById('updatedLastname').value;
  var updatedYear = document.getElementById('updatedYear').value;
  var updatedFileInput = document.getElementById('updatedFileInput').value;
  // Repite lo mismo para otros campos actualizados

  // Obtiene el ID de la persona a actualizar
  var idToUpdate = document.getElementById('update').dataset.idToUpdate;

  // Actualiza la persona en la base de datos (ajusta según tu lógica)
  database.updatePerson(idToUpdate, updatedFirstname, updatedLastname, updatedYear, updatedFileInput);

  // Cierra el modal después de la actualización
  closeUpdateModal();

  // Vuelve a cargar la tabla actualizada
  populateTable();
}

// Añade esta función para descargar un archivo
function downloadFile(filePath) {
  // Abre el cuadro de diálogo para elegir la ubicación de descarga
  const { dialog } = require('electron').remote;

  dialog.showSaveDialog({
    defaultPath: filePath, // Establece la carpeta de descargas predeterminada como la ruta del archivo original
    buttonLabel: 'Guardar', // Cambia la etiqueta del botón de guardar
    title: 'Guardar Archivo', // Título del cuadro de diálogo
    filters: [
      { name: 'Archivos de Texto', extensions: ['txt'] },
      // Puedes agregar más tipos de archivos según sea necesario
    ],
  }).then(result => {
    if (!result.canceled && result.filePath) {
      // Puedes copiar el archivo a la ubicación seleccionada por el usuario si es necesario
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

