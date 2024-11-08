import Products from '../models/productModel.js';
import mongoose from 'mongoose';

// Function to delete test data
export const deleteTestData = async (req, res) => {
  try {
    const result = await Products.deleteMany({
      $or: [{ name: 'JMETER VOLUME TEST' }, { name: 'Maplestory Kino' }]
    });
    console.log(`Deleted ${result.deletedCount} test product(s)`);
    res.status(200).send({
      success: true,
      message: "JMeter products deleted",
    });
  } catch (error) {
    console.error('Error deleting test data:', error);
  } 
};
  