var Serializer = require('./lib/serializer');

var serializer = new Serializer();

var schema = {
	'name' : true,
	'surname' : true,
	'hajs' : {
		'as' : 'salary', 
		'set' : function(data, bundle){
			return {'brutto' : data['hajs'], 'netto' : data['hajs'] * 1.23}
		}
	},
	'zwierzaki' : {
		'as' : 'pets',
		'show' : {
			'name' : {'as' : 'imie'},
			'rasa' : true,
			'price' : {
				'set' : function(data, bundle){
					return bundle['price'];
				}
			}
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

console.log(serializer.serialize(data, schema, {'price' : 123}));