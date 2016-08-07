var JSON_Serializer = function(serialization_schema){
	this.serialization_schema = serialization_schema;
};

JSON_Serializer.prtotype.serialize = function(data, serialization_schema){

	if(serialization_schema === undefined){
		serialization_schema = this.serialization_schema;
	}

		
};

module.exports = JSON_Serializer;