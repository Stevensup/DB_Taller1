const fs = require('fs');
const path = require('path');
const { app } = require('electron').remote;

// Initialize the database
var Datastore = require('nedb');
db = new Datastore({ filename: 'db/persons.txt', autoload: true });

// Adds a person
exports.addPerson = async function(firstname, lastname, year, fileInput) {
  try {
    // Create the person object
    var person = {
      "firstname": firstname,
      "lastname": lastname,
      "year": year,
      "fileInput": fileInput
    };

      // Create the target folder if it doesn't exist
      const targetFolder = path.join(app.getAppPath(), 'images');

      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
      }

      
    // Save the person to the database
    db.insert(person, async function(err, newDoc) {
      if (err) {
        console.error('Error al guardar la persona en la base de datos:', err);
        return;
      }

      console.log('Persona guardada exitosamente en la base de datos');

      // Copy the file to the images folder
      try {
        const sourcePath = fileInput;
      const targetFolder = path.join(app.getAppPath(), 'images');
      const targetPath = path.join(targetFolder, path.basename(fileInput));


        await fs.copyFile(sourcePath, targetPath);
        console.log('Archivo copiado exitosamente a la carpeta de imágenes');
      } catch (copyError) {
        console.error('Error al copiar el archivo a la carpeta de imágenes:', copyError);
      }
    });
  } catch (error) {
    console.error('Error al agregar la persona:', error);
  }
};

// Returns all persons
exports.getPersons = function(fnc) {
  // Get all persons from the database
  db.find({}, function(err, docs) {
    // Execute the parameter function
    fnc(docs);
  });
};

// Deletes a person
exports.deletePerson = function(id) {
  db.remove({ _id: id }, {}, function(err, numRemoved) {
    // Do nothing
  });
};

// Update a person
exports.updatePerson = function(id, updatedFirstname, updatedLastname, updatedYear) {
  var updateData = {
    $set: {
      "firstname": updatedFirstname,
      "lastname": updatedLastname,
      "year": updatedYear,
    }
  };

  db.update({ _id: id }, updateData, {}, function(err, numUpdated) {
    // Do nothing
  });
};
