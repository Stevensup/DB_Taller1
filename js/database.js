// Initialize the database
var Datastore = require('nedb');
db = new Datastore({ filename: 'db/persons.txt', autoload: true });

// Adds a person
exports.addPerson = function(firstname, lastname , year , fileInput) {

  // Create the person object
  var person = {
    "firstname": firstname,
    "lastname": lastname,
    "year" : year,
    "fileInput": fileInput
  };

  // Save the person to the database
  db.insert(person, function(err, newDoc) {
    // Do nothing
  });
};

// Returns all persons
exports.getPersons = function(fnc) {

  // Get all persons from the database
  db.find({}, function(err, docs) {

    // Execute the parameter function
    fnc(docs);
  });
}

// Deletes a person
exports.deletePerson = function(id) {

  db.remove({ _id: id }, {}, function(err, numRemoved) {
    // Do nothing
  });
}

// Update a person
exports.updatePerson = function(id, updatedFirstname, updatedLastname, updatedYear, updatedFileInput) {
  var updateData = {
    $set: {
      "firstname": updatedFirstname,
      "lastname": updatedLastname,
      "year": updatedYear,
      "fileInput": updatedFileInput
    }
  };

  db.update({ _id: id }, updateData, {}, function(err, numUpdated) {
    // Do nothing
  });
};