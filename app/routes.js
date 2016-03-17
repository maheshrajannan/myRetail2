var PriceInfo = require('./models/priceInfo');
var util = require('util');
var ProductApiClient = require('./productApiClient');

function getProduct(res,inProductId,inKey){
	console.log('getProduct inProductId:' + inProductId);
	console.log('getProduct inKey:' + inKey);

	//IMPROVEMENT: format nicely.
	//IMPROVEMENT: unit testing (pm2 ?).
	//DONE: callback for each price info, call forEachCallback, 
	//DONE: add the authentication param
	var product;
	ProductApiClient.getProduct(inProductId,inKey,function(foundProduct) {
		console.log('getProduct updating product' + util.inspect(foundProduct,false,null));
		//Example response: {"id":13860428,"name":"The Big Lebowski (Blu-ray) (Widescreen)","current_price":{"value": 13.49,"currency_code":"USD"}}
		if(!util.isNullOrUndefined(foundProduct) && util.isNullOrUndefined(foundProduct.error)) {
			PriceInfo.find(
				{productId:inProductId},
				function(err, foundPriceInfos) {
					if (err)
						res.send(err)
					console.log('foundPriceInfo ' + util.inspect(foundPriceInfos,false,null));
					product = {id:inProductId,name:foundProduct.productName,priceInfos:foundPriceInfos};
					res.json(product);
				});
		} else if(!util.isNullOrUndefined(foundProduct.error) && foundProduct.error === 'NotAuthorized') {
			//DONE: return correct response code.
			//INFO: http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
			//401 Not Authorized, when not authorized.
			console.log('unAuthorized Key#'+inKey + 'error' + foundProduct.error);
			res.status(401)        // HTTP status 404: NotFound
   			.send('Key#'+inKey+' Not Authorized');
   		} else if(!util.isNullOrUndefined(foundProduct.error) && foundProduct.error === 'Error') {
			//DONE: return correct response code.
			//INFO: http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
			//401 Not Authorized, when not authorized.
			console.log('unAuthorized Key#'+inKey + 'error' + foundProduct.error);
			res.status(401)        // HTTP status 404: NotFound
   			.send('Key#'+inKey+' Not Authorized');
   		} else {
			//DONE: return correct response code.
			//INFO: http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
			//404 Not Found - When a non-existent resource is requested
			console.log('unable to find product#'+inProductId);
			res.status(404)        // HTTP status 404: NotFound
   			.send('productId#'+inProductId+'Not found');
		}

	});
};

function verifyProduct(inProductId,inKey,callback){
	console.log('getProduct inProductId:' + inProductId);
	console.log('getProduct inKey:' + inKey);

	//TODO: format nicely.
	//TODO: unit testing.
	//TODO: callback mayhem for each price info, call forEachCallback, 
	//DONE: add the authentication param
	var product;
	ProductApiClient.getProduct(inProductId,inKey,function(foundProduct) {
		console.log('getProduct updating product' + util.inspect(foundProduct,false,null));
		//Example response: {"id":13860428,"name":"The Big Lebowski (Blu-ray) (Widescreen)","current_price":{"value": 13.49,"currency_code":"USD"}}
		if(!util.isNullOrUndefined(foundProduct)) {
			PriceInfo.find(
				{productId:inProductId},
				function(err, foundPriceInfos) {
					if (err)
						res.send(err)
					console.log('foundPriceInfo ' + util.inspect(foundPriceInfos,false,null));
					product = {id:inProductId,name:foundProduct.productName,priceInfos:foundPriceInfos};
					callback(product);
				});
		} else {
			callback(product);
		}

	});
};

module.exports = function(app) {

	//DONE: return the correct response code if product is not found.
	app.get('/api/products/:productId', function(req, res) {
		console.log('getProduct:' + req.params.productId);
		console.log('getKey:' + req.query.key);
		// use mongoose to get all priceInfos in the database
		getProduct(res,req.params.productId,req.query.key);
	});

	// create priceInfo and send back all priceInfos after creation
	//TODO: delete this after creating enough test data.This does not follow REST standards and status codes.
	app.post('/api/products', function(req, res) {
		// create a priceInfo, information comes from AJAX request from Angular
		console.log('Posting' + req.body.productId);
		PriceInfo.create({
			value : req.body.value,
			currencyCode : req.body.currencyCode,
			productId : req.body.productId,
			done : false
		}, function(err, priceInfo) {
			if (err)
				res.send(err);
			res.json(priceInfo);
		});
	});

	// create priceInfo and send back all priceInfos after creation
	//TODO: INFO ideal way to do CRUD is on the domain object itself..
	//Not the parent object
	app.put('/api/products', function(req, res) {
		if(!util.isNullOrUndefined(req.body.id)) {
			verifyProduct(req.body.id,req.body.key,function(productFound) {
				if(!util.isNullOrUndefined(productFound)) {
				console.log('productId ' + util.inspect(req.body.id,false,null));
				PriceInfo.findOneAndUpdate(
					{ productId: req.body.id,currencyCode: req.body.currencyCode },
					{ 
					 	value: req.body.value
					 },
					 //INFO: requirement says update the product price, so upsert is false.
					 //if need to do insert also use post on price info directly and implement it.
					 {
					 	upsert:false,
					 	setDefaultsOnInsert: true
					 }, 
					 function(err, priceInfo) {
					 	if (err) throw err;
						console.log('updated priceInfo ' + priceInfo);
						if(!util.isNullOrUndefined(priceInfo)) {
							//INFO: fetch from table again, for the product because only then we get the
							//actual result of update.
							getProduct(res,req.body.id,req.body.key);					 
						} else {
							//INFO: basically for the given product if a price for the currency code is found then update it.
							//INFO: if not found it is considered as an error for PUT, use POST on price info.
							res.status(404)        // HTTP status 404: NotFound
				   			.send('For productId#'+req.body.id+' Not found Currency Code ' + req.body.currencyCode);	
						}
					});
				} else{
					res.status(404)        // HTTP status 404: NotFound
		   			.send('productId#'+req.body.id+' Not found');	
				} 
			});
		} else {
			res.status(404)        // HTTP status 404: NotFound
	   		.send('productId#'+req.body.id+' Not found or invalid');		
   		}
   	}
	);	

	// delete a priceInfo
	//TODO: delete this. This does not follow REST standards and codes.
	app.delete('/api/products/:priceInfoId', function(req, res) {
		PriceInfo.remove({
			priceInfoId : req.params.priceInfoId
		}, function(err, priceInfo) {
			if (err)
				res.send(err);

			getPriceInfos(res);
		});
	});

	//TODO: remove the front end.
	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};