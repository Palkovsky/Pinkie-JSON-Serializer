/*
	Keywords:
		-set(anything + function)
		-as(only string)
		-show(boolean/function/object - for nested)
*/

var JSON_Serializer = function(serialization_schema){
	if(typeof(serialization_schema) !== 'object' || Array.isArray(serialization_schema)){throw 'serialization_schema is not valid object.';}

	this.default_formater = function(data, key){
		return data[key];
	};
};

JSON_Serializer.prtotype.serialize = function(data, serialization_schema){
	if(serialization_schema === undefined){serialization_schema = this.serialization_schema;}
	if(typeof(serialization_schema) !== 'object' || Array.isArray(serialization_schema)){throw 'serialization_schema is not valid object.';}	
	if(typeof(data) !== 'object'){throw 'Passed entity is not valid object.';}

	var result = null;

	if(Array.isArray(data)){
		result = [];

		for(var i = 0; i < data.length; i++){
			var item = data[i];
			result.push(this.serialize(item, serialization_schema));
		}

	}else if(typeof(data) === 'object'){
		result = this.serialize_object(data, serialization_schema);
	}

	return result;
};

JSON_Serializer.prtotype.serialize_object = function(object, serialization_schema){
	if(serialization_schema === undefined){serialization_schema = this.serialization_schema;}
	if(typeof(serialization_schema) !== 'object' || Array.isArray(serialization_schema)){throw 'serialization_schema is not valid object.';}	
	if(typeof(data) !== 'object' || Array.isArray(data)){throw 'Passed entity is not valid object.';}

	var result = {};

	for (var key in data) {
		if (data.hasOwnProperty(key) && serialization_schema.hasOwnProperty(key)) {
	    	
			if(typeof(data[key]) === 'object' &&
			 	typeof(serialization_schema[key]['show']) === 'object'){
				result[key] = this.serialize(data[key], serialization_schema[key]);
				continue;
			}

	    	var set = serialization_schema[key]["set"];
	    	var show = serialization_schema[key]["show"];
	    	var as = serialization_schema[key]["as"];

	    	if(typeof(set) === 'function'){set = set(data[key], key);}
	    	if(typeof(show) === 'function'){show = show(data[key], key);}
	    	if(typeof(as) === 'function'){as = as(data[key], key);}

	    	if(as === null || as === undefined){as = key;}
	    	if(show === null || show === undefined){show = false;}

	    	if(Boolean(show) === true){
	    		if(set !== undefined && set !== null){
	    			result[as] = set;
	    		}else{
	    			result[as] = data[key];
	    		}
	    	}
		}
	}

	return result;
};

module.exports = JSON_Serializer;