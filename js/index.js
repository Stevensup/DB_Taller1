const database = require('./js/database');
const { app } = require('electron').remote;
const path = require('path');  // Agrega esta línea

window.onload = function() {

  populateTable();

  document.getElementById('add').addEventListener('click', () => {

    var firstname = document.getElementById('firstname');
    var lastname = document.getElementById('lastname');
    var year = document.getElementById('year');
    var fileInput = document.getElementById('fileInput');
    const filePath = fileInput.files[0].path;

    database.addPerson(firstname.value, lastname.value, year.value, filePath);

    firstname.value = '';
    lastname.value = '';
    year.value = '';
    fileInput.value = ''; 

    populateTable();
    alert('Usuario creado exitosamente.');

  });
}



function populateTable(filter = '') {
  database.getPersons(function(persons) {
    var tableBodyElement = document.getElementById('tablebody');

    tableBodyElement.innerHTML = '';

    if (persons.length === 0) {
      tableBodyElement.innerHTML = '<tr><td colspan="6">No hay datos disponibles</td></tr>';
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
      tableBodyElement.innerHTML = '<tr><td colspan="6">No hay coincidencias con el filtro</td></tr>';
    }
  });
}

function searchAndUpdateTable() {
  var searchInputValue = document.getElementById('searchInput').value;

  populateTable(searchInputValue);
}


function deletePerson(id) {

  database.deletePerson(id);

  populateTable();
  alert('Usuario eliminado exitosamente.');
}

function closeUpdateModal() {
  document.getElementById('updateModal').style.display = 'none';
}
function showUpdateForm(id, firstname, lastname, year, fileInput) {
  document.getElementById('updatedFirstname').value = firstname;
  document.getElementById('updatedLastname').value = lastname;
  document.getElementById('updatedYear').value = year;
  document.getElementById('updateModal').style.display = 'block';
  document.getElementById('update').dataset.idToUpdate = id; // Almacena el ID para su uso posterior
}

function updatePerson() {
  var updatedFirstname = document.getElementById('updatedFirstname').value;
  var updatedLastname = document.getElementById('updatedLastname').value;
  var updatedYear = document.getElementById('updatedYear').value;
  var updatedFileInput = document.getElementById('updatedFileInput').value;

  var idToUpdate = document.getElementById('update').dataset.idToUpdate;

  database.updatePerson(idToUpdate, updatedFirstname, updatedLastname, updatedYear, updatedFileInput);

  closeUpdateModal();

  populateTable();
}

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

