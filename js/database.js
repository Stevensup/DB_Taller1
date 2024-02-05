// Autor: Steven Useche
// Fecha: 2024-02-04
// Descripción: Este módulo proporciona funciones para interactuar con una base de datos NeDB, 
//              permitiendo agregar, obtener, eliminar y actualizar información de personas, 
//              así como copiar archivos a una carpeta de imágenes.

const fs = require('fs');
const path = require('path');
const { app } = require('electron').remote;
var Datastore = require('nedb');
db = new Datastore({ filename: 'db/persons.txt', autoload: true });

/**
 * Agrega una persona a la base de datos y copia su archivo a la carpeta de imágenes.
 * @param {string} firstname - Nombre de la persona.
 * @param {string} lastname - Apellido de la persona.
 * @param {number} year - Año de nacimiento de la persona.
 * @param {string} fileInput - Ruta del archivo asociado a la persona.
 */
exports.addPerson = async function(firstname, lastname, year, fileInput) {
  try {
    var person = {
      "firstname": firstname,
      "lastname": lastname,
      "year": year,
      "fileInput": fileInput
    };

    const targetFolder = path.join(app.getAppPath(), 'images');

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder);
    }

    db.insert(person, async function(err, newDoc) {
      if (err) {
        console.error('Error al guardar la persona en la base de datos:', err);
        return;
      }

      console.log('Persona guardada exitosamente en la base de datos');

      try {
        const sourcePath = fileInput;
        const targetPath = path.join(targetFolder, path.basename(fileInput));

        await fs.promises.copyFile(sourcePath, targetPath);
        console.log('Archivo copiado exitosamente a la carpeta de imágenes');
      } catch (copyError) {
        console.error('Error al copiar el archivo a la carpeta de imágenes:', copyError);
      }
    });
  } catch (error) {
    console.error('Error al agregar la persona:', error);
  }
};

/**
 * Obtiene todas las personas almacenadas en la base de datos.
 * @param {function} fnc - Función de retorno que recibe la lista de personas.
 */
exports.getPersons = function(fnc) {
  db.find({}, function(err, docs) {
    fnc(docs);
  });
};

/**
 * Elimina una persona de la base de datos.
 * @param {string} id - Identificador único de la persona a eliminar.
 */
exports.deletePerson = function(id) {
  db.remove({ _id: id, }, {}, function(err, numRemoved) {
    // No se realiza ninguna acción específica al eliminar la persona.
  });
};

/**
 * Actualiza la información de una persona en la base de datos.
 * @param {string} id - Identificador único de la persona a actualizar.
 * @param {string} updatedFirstname - Nuevo nombre de la persona.
 * @param {string} updatedLastname - Nuevo apellido de la persona.
 * @param {number} updatedYear - Nuevo año de nacimiento de la persona.
 */
exports.updatePerson = function(id, updatedFirstname, updatedLastname, updatedYear) {
  var updateData = {
    $set: {
      "firstname": updatedFirstname,
      "lastname": updatedLastname,
      "year": updatedYear,
    }
  };

  db.update({ _id: id }, updateData, {}, function(err, numUpdated) {
    // No se realiza ninguna acción específica al actualizar la persona.
  });
};
