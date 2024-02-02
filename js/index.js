const database = require('./js/database');

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

    // Save the person in the database
    database.addPerson(firstname.value, lastname.value, year.value , fileInput.value);

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

// // Populates the persons table
// function populateTable() {

//   // Retrieve the persons
//   database.getPersons(function(persons) {

//     // Generate the table body
//     var tableBody = '';
//     for (i = 0; i < persons.length; i++) {
//       tableBody += '<tr>';
//       tableBody += '  <td>' + persons[i].firstname + '</td>';
//       tableBody += '  <td>' + persons[i].lastname + '</td>';
//       tableBody += '  <td>' + persons[i].year + + '</td>';
//       tableBody += '  <td>' + persons[i].fileInput + + '</td>';
//       tableBody += '  <td><input type="button" value="Delete" onclick="deletePerson(\'' + persons[i]._id + '\')"></td>';
//       tableBody += '  <td><input type="button" value="Update" onclick="updatePerson(\'' + persons[i]._id + '\')"></td>'
//       tableBody += '</tr>';
//     }

//     // Fill the table content
//     document.getElementById('tablebody').innerHTML = tableBody;
//   });
// }

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
          <td><input type="button" value="Update" onclick="updatePerson('${person._id}')"></td>
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
