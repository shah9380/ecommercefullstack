// Import the required mongoose module for ObjectId validation
const mongoose = require('mongoose');

// Define a function to validate MongoDB ObjectId
const validateMongoDbId = (id) => {
    // Check if the provided id is a valid MongoDB ObjectId
    const isValid = mongoose.Types.ObjectId.isValid(id);

    // If the id is not valid, throw an error
    if (!isValid) {
        throw new Error("This Id is not valid");
    }
}

// Export the validateMongoDbId function for reuse in other modules
module.exports = validateMongoDbId;
