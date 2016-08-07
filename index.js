var Serializer = require('./lib/serializer');

var serializer = new Serializer();

var schema = {
	'name' : true,
	'surname' : true,
	'hajs' : {
		'as' : 'salary', 
		'set' : function(data, key){
			return {'brutto' : data[key], 'netto' : data[key] * 1.23}
		}
	},
	'zwierzaki' : {
		'as' : 'pets',
		'show' : {
			'name' : {'as' : 'imie'},
			'rasa' : {'minimize' : false}
		}
	}
};

var data = {
	'name' : 'Szymon',
	'surname' : 'Czerniam',
	'gender' : 'M',
	'hajs' : 5000,
	'zwierzaki' : [
		{
			'name' : 'Pawełek',
			'rasa' : 'ostry buldog',
			'kolor_obrozy' : 'czerwony'
		},{
			'name' : 'Piotruś',
			'kolor_obrozy' : 'zielony'
		},{
			'name' : 'Dawid',
			'kolor_obrozy' : 'niebieski'
		}
	]
};

console.log(serializer.serialize(data, schema));