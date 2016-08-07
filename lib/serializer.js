/*
	Keywords:
		-set(anything + function)
		-as(only string)
		-show(boolean/function/object - for nested)

	Different, valid definitions:
	{
		"field_1" : true,
		"field_2" : function(){return true;},
		"field_3" : function(){return false;},
		"field_4" : function(data){return (data["owner"] === true);},
		"field_5" : {"as" : "salary", "set" : function(data, key){
			return {"brutto" : data[key], "netto" : data[key] * 1.23f}
		}}

		More in tests...
	}
*/

var JSON_Serializer = function(serialization_schema){
	this.keywords = {
		'SET' : 'set',
		'SHOW' : 'show',
		'AS' : 'as',
		'MINIMIZE' : 'minimize'
	};
};

JSON_Serializer.prototype.serialize = function(data, serialization_schema){
	if(typeof(serialization_schema) !== 'object' || Array.isArray(serialization_schema)
		|| serialization_schema === undefined || serialization_schema === null){
		throw 'serialization_schema is not valid object.';
	}	
	if(typeof(data) !== 'object'){throw 'Passed entity is not valid object.';}

	serialization_schema =  this.sanitize_scheme(serialization_schema);

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

JSON_Serializer.prototype.serialize_object = function(data, serialization_schema){
	if(typeof(serialization_schema) !== 'object' || Array.isArray(serialization_schema)
		|| serialization_schema === undefined || serialization_schema === null){
		throw 'serialization_schema is not valid object.';
	}	
	if(typeof(data) !== 'object' || Array.isArray(data)){throw 'Passed entity is not valid object.';}

	serialization_schema = this.sanitize_scheme(serialization_schema);

	var result = {};
	var minimized = [];

	for (var key in serialization_schema) {
		if (data.hasOwnProperty(key) && serialization_schema.hasOwnProperty(key)) {
	    	
			if(typeof(data[key]) === 'object' &&
			 	typeof(serialization_schema[key][this.keywords['SHOW']]) === 'object'){
				result[key] = this.serialize(data[key], serialization_schema[key][this.keywords['SHOW']]);
				continue;
			}

	    	var set = serialization_schema[key][this.keywords['SET']];
	    	var show = serialization_schema[key][this.keywords['SHOW']];
	    	var as = serialization_schema[key][this.keywords['AS']];

	    	if(typeof(set) === 'function'){set = set(data, key);}
	    	if(typeof(show) === 'function'){show = show(data, key);}
	    	if(typeof(as) === 'function'){as = as(data, key);}

	    	if(as === null || as === undefined){as = key;}
	    	if(show === null || show === undefined){show = false;}

	    	if(Boolean(show) === true){

	    		var val = data[key];
	    		if(set !== undefined){
	    			val = set;
	    		}
	    		result[as] = val;
	    	}
		}else if(!data.hasOwnProperty(key) && serialization_schema.hasOwnProperty(key)
			&& serialization_schema[key][this.keywords['MINIMIZE']] === false){
			var as = serialization_schema[key][this.keywords['AS']];
			if(typeof(as) === 'function'){as = as(data);}
			if(as === null || as === undefined){as = key;}
			result[as] = null;			
		}
	}

	return result;
};

JSON_Serializer.prototype.sanitize_scheme = function(serialization_schema){

	var sanitized = {};
	var minimized = [];

	for(var field in serialization_schema){
		if (serialization_schema.hasOwnProperty(field)){

			var value = serialization_schema[field];
			if(typeof(value) === 'function'){
				sanitized[field] = this.build_scheme_field(value, field);
			}else if(typeof(value) === 'boolean'){
				sanitized[field] = this.build_scheme_field(value, field);
			}else if(typeof(value) === 'object' && !(Array.isArray(value))){

				var show = undefined;
				var set = undefined;
				var as = undefined;
				var minimize = true; //minimize by default

				if(value.hasOwnProperty(this.keywords['SET'])){
					set = value[this.keywords['SET']];
				}

				if(value.hasOwnProperty(this.keywords['SHOW'])){

					if(typeof(value[this.keywords['SHOW']]) === 'object'){
						show = this.sanitize_scheme(value[this.keywords['SHOW']]);
					}else{
						show = value[this.keywords['SHOW']];
					}

					if(show === undefined){
						show = true;
					}
				}

				if(value.hasOwnProperty(this.keywords['AS'])){
					as = value[this.keywords['AS']];
				}

				if(value.hasOwnProperty(this.keywords['MINIMIZE'])){
					minimize = Boolean(value[this.keywords['MINIMIZE']]);
				}

				sanitized[field] = this.build_scheme_field(show, as, set, minimize);
			}else{
				throw ('Invalid schema definition: ' + field + ' : ' + value);
			}

		}
	}

	return sanitized;
};

JSON_Serializer.prototype.build_scheme_field = function(show, as, set, minimize){
	var scheme_field = {};
	scheme_field[this.keywords['SHOW']] = show;
	scheme_field[this.keywords['AS']] = as;
	scheme_field[this.keywords['SET']] = set;
	scheme_field[this.keywords['MINIMIZE']] = minimize;
	return scheme_field;
};

module.exports = JSON_Serializer;