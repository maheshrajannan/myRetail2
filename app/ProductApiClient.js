//DONE: move this to a file
//ProductApi Client interacts with the products api service to just get the product name

var util = require('util');

var getProduct = function (inProductId,inKey,callback) {
	var product;
	console.log('inProductId:' + inProductId);
	console.log('inKey:' + inKey);
	if(!util.isNullOrUndefined(inProductId) && !util.isNullOrUndefined(inKey)) {
		//INFO: use closures correctly, putting these at a higher scope would cause interference across requests..
		var productApiUrl = 'https://api.target.com/products/v3/${productId}';
		var Client = require('node-rest-client').Client;
		var productApiClient = new Client();

		var args = {
			path: { "productId": inProductId }, // path substitution var 
			parameters: { fields : "descriptions", id_type : "TCIN" , key : inKey } // query parameter substitution vars 
		};

		// registering remote methods 
		productApiClient.registerMethod("getProduct", productApiUrl, "GET");
		
		//TODO: use proper logging module.
		console.log('productApiClient.methods.getProduct'+util.inspect(productApiClient.methods.getProduct,false,null));
		//DONE:move this to a separate file

		//productApiClient.get(productApiUrl, function (data, response) {
			productApiClient.methods.getProduct(args, function (data, response) {
				//TODO: move this check to a separate file.
				console.log('data'+util.inspect(data,false,null));
				if(!util.isNullOrUndefined(data) && 
					!util.isNullOrUndefined(data.product_composite_response) &&  
					!util.isNullOrUndefined(data.product_composite_response.items) &&  
					!util.isNullOrUndefined(data.product_composite_response.items[0]) &&  
				 	!util.isNullOrUndefined(data.product_composite_response.items[0].online_description) ) {
					product = { productId : inProductId ,productName : 'NA'};
					// INFO: data is parsed response body as js object 
					//TODO: make the field to read as configurable
					product.productName = data.product_composite_response.items[0].online_description.value;
					//TODO: replace with better logger.
					console.log('id:' + inProductId + 'data from productAPI' + util.inspect(data.product_composite_response.items[0].online_description,false,null));
					// raw response 
					//console.log('raw response from product api' + response);
					return callback(product);
				} else if(!util.isNullOrUndefined(data) && 
					!util.isNullOrUndefined(data.Error) &&
					!util.isNullOrUndefined(data.Error.Message)					
					) {
					//DONE: handle unauthorized case.
					console.log('unauthorized data'+util.inspect(data.Error.Message,false,null));
					product = { productId : inProductId ,productName : 'NA',error: 'NotAuthorized'};
					return callback(product);
				} else if(!util.isNullOrUndefined(data) && 
					util.isNullOrUndefined(data.Error)					
					) {
					//TODO: the existing API is not handling not found correctly so returing as Not found in this case.
					//i.e. no error in response but not found also.
					console.log('Not found for data'+util.inspect(data.Error,false,null));
					product = { productId : inProductId ,productName : 'NA',error: 'NotFound'};
					return callback(product);
				} else {
					console.log('data'+util.inspect(data,false,null));
					product = { productId : inProductId ,productName : 'NA',error: 'Error'};
					return callback(product);
				}	
				//TODO: handle error call back.
				//TODO: return correct response code.
			});
	} else {
		return callback(product);
	}
};

module.exports.getProduct = getProduct;