var expect = require("chai").expect;
var Serializer = require("../lib/serializer");
var serializer = new Serializer();

describe("Pinkie JSON Serializer", function(){

	describe("trivial cases", function(){
		it("should keep only fields with true", function(){

			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};

			var scheme = {
				"name" : true,
				"age" : false
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.not.have.property("age");
			expect(output).to.not.have.property("gender");
		});

		it("should keep only fields with true(evaluated from function)", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};

			var scheme = {
				"name" : true,
				"age" : function(json){
					return (json["gender"] === "F");
				}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.not.have.property("age");
			expect(output).to.not.have.property("gender");			
		});
	});

	describe("as clausule", function(){

		it("should relabel given field", function(){
			var person = {
				"name" : "John Doe"
			};

			var scheme = {
				"name" : {"as" : "full_name"}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("full_name", "John Doe");
		});

		it("should relabel given field for an array", function(){
			var people = [
				{"name" : "John Doe"},
				{"name" : "Steven Paterson"},
				{"name" : "Troy Adamo"}
			];

			var scheme = {
				"name" : {"as" : "full_name"}
			};

			var output = serializer.serialize(people, scheme);
			expect(output).to.have.length(3);
			expect(output[0]).to.have.property("full_name", "John Doe");
			expect(output[1]).to.have.property("full_name", "Steven Paterson");
			expect(output[2]).to.have.property("full_name", "Troy Adamo");
		});

		it("should relabel given field with a function", function(){
			var person = {
				"name" : "John Doe"
			};

			var scheme = {
				"name" : {
					"as" : function(json){
						return "full_name";
					}
				}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("full_name", "John Doe");
		});

	});

	describe("show clausule", function(){
		it("should keep only fields with 'show' true", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};
			var scheme = {
				"name" : {"show" : true},
				"age" : {"show" : false}
			};
			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.not.have.property("age");
			expect(output).to.not.have.property("gender");
		});

		it("should keep only fields with 'show' true(evaluated from function)", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};

			var scheme = {
				"name" : true,
				"age" : {
					"show" : function(json){
						return (json["gender"] === "F");
					}
				}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.not.have.property("age");
			expect(output).to.not.have.property("gender");			
		});
	});

	describe("set clausule", function(){

		it("should set property to passed value", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};

			var scheme = {
				"name" : true,
				"gender" : {"set" : "UNKNOWN"}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.not.have.property("age");
			expect(output).to.have.property("gender", "UNKNOWN");				
		});

		it("should set property to returned value of passed function", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};

			var scheme = {
				"name" : true,
				"gender" : {
					"set" : function(json){
						if(json["gender"] === "F")
							return "girl";
						else
							return "boy";
					}
				}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.not.have.property("age");
			expect(output).to.have.property("gender", "boy");	
		});
	});

	describe("minimize clausule", function(){

		it("should not minimize fields if requested", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M"
			};
			var scheme = {
				"name" : true,
				"height" : {"minimize" : false}
			};
			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.have.property("height", null);
			expect(output).to.not.have.property("gender");
			expect(output).to.not.have.property("age");
		});

		it("should set minimized field", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M",
				"favorite_numbers" : [1, 2, 3]
			};
			var scheme = {
				"name" : true,
				"favorite_numbers" : true,
				"height" : {"minimize" : false,
					"set" : function(json){
						if(json["gender"] === "M"){
							return 180;
						}else{
							return 160;
						}
					}
				},
				"fatness" : {"minimize" : false, "set" : "fat"}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.have.property("height", 180);
			expect(output).to.have.property("fatness", "fat");
			expect(output).to.have.property("favorite_numbers");
			expect(output["favorite_numbers"]).to.have.length(3);
			expect(output["favorite_numbers"][0]).to.equal(1);
			expect(output["favorite_numbers"][1]).to.equal(2);
			expect(output["favorite_numbers"][2]).to.equal(3);
			expect(output).to.not.have.property("gender");
			expect(output).to.not.have.property("age");
		});
	});

	describe("nested objects", function(){
		it("should handle nested array of objects", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M",
				"pets" : [
					{"name" : "Rex"},
					{"name" : "Jack"},
					{"name" : "Roudy"}
				]
			};

			var scheme = {
				"name" : {"as" : "full_name"},
				"pets" : {
					"show" : {
						"name" : true,
						"age" : {"show" : function(json){return Math.random()}, "minimize" : false}
					}
				}
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("full_name", "John Doe");
			expect(output).to.have.property("pets");
			expect(output["pets"]).to.have.length(3);
			expect(output["pets"][0]).to.have.property("name", "Rex");
			expect(output["pets"][0]).to.have.property("age");
			expect(output["pets"][1]).to.have.property("name", "Jack");
			expect(output["pets"][1]).to.have.property("age");
			expect(output["pets"][2]).to.have.property("name", "Roudy");
			expect(output["pets"][2]).to.have.property("age");
		});

		it("should handle nested object", function(){
			var person = {
				"name" : "John Doe",
				"age" : 17,
				"gender" : "M",
				"pet" : {
					"name" : "Rex",
					"age" : 3
				},
				"house" : {
					"big" : true
				}
			};

			var scheme = {
				"name" : true,
				"pet" : {
					"show" : {
						"name" : true,
						"age" : {
							"set" : function(json){
								return json["age"] * 8;
							}
						}
					}
				},
				"house" : true
			};

			var output = serializer.serialize(person, scheme);
			expect(output).to.have.property("name", "John Doe");
			expect(output).to.have.property("pet");
			expect(output).to.have.property("house");
			expect(output["house"]).to.have.property("big", true);
			expect(output["pet"]).to.have.property("name", "Rex");
			expect(output["pet"]).to.have.property("age", 24);
		});
	});

	describe("passing bundle", function(){
		var bundle = 10;

		var person = {
			"name" : "John Doe",
			"age" : 17,
			"gender" : "M"
		};

		var scheme = {
			"name" : true,
			"gender" : {
				"set" : function(json, b){
					return b;
				}
			}
		};		

		var output = serializer.serialize(person, scheme, bundle);
		expect(output).to.have.property("name", "John Doe");
		expect(output).to.have.property("gender", bundle);
	});
});