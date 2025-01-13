// In utils/incrementField.js
const incrementField = async (model, documentId, fieldName) => {
    try {
      // Find the document by ID
      const document = await model.findById(documentId);
      if (!document) {
        throw new Error(`${model.modelName} not found`);
      }
  
      // Increment the specified field
      if (typeof document[fieldName] !== "number") {
        throw new Error(`${fieldName} is not a numeric field in ${model.modelName}`);
      }
  
      document[fieldName] += 1;
      await document.save();
  
      return document[fieldName];
    } catch (error) {
      console.log(`Error in incrementField for ${model.modelName}:`, error.message);
      throw new Error(`Failed to increment ${fieldName}`);
    }
  };
  
  module.exports = { incrementField };
  