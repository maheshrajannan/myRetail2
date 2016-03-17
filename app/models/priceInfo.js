var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var database = require('../../config/database'); 			// load the database config
var connection = mongoose.createConnection(database.url);

autoIncrement.initialize(connection);

// create a schema
//INFO: using defaults only for making it easy to create data. 
//Do not create defaults for product id and product id type in production.
var priceInfoSchema = new Schema({
	value : {type : Number, default: ''},
	currencyCode : {type : String, default: 'USD'},
  productId : {type : Number, default: '13860428'},
  productIdType : {type : String, default: 'TCIN'}
});

priceInfoSchema.plugin(autoIncrement.plugin, { model: 'PriceInfo', field: 'priceInfoId' });

// Create a model using schema
var PriceInfo = mongoose.model('PriceInfo', priceInfoSchema);

// make this available to our users in our Node applications
module.exports = PriceInfo;