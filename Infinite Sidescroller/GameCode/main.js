
/*
 * Rules for working on the (client-side) game code:
 *
 * 1. If you think that one of these rules is stupid or useless, tell me, along with some better suggestions.
 *
 * 2. Model [name]Model can only be accessed through [name]Controller. If you need to do something to 
 * 		change [name]Model from [other_name]Controller, write function in the [name]Controller that does
 * 		what you need, and call it from the [other_name]Controller
 *
 * 3. Controllers are allowed to have private methods/fields. Models aren't. 
 *
 * 4. Controllers aren't allowed to have public data fields. 
 * 		Those data fields that are present must not reflect state of the game, they must be related to
 * 		some internal functionality of the controller
 *
 * 5. If you write some function that doesn't logically belong to one of the controllers,
 * 		put it in the Utility
 *
 * 6. Variables are named like that: variable_name
 * 		Except (singleton)class names, that are written like that: ClassName
 *
 * 7. And all the obvious stuff that everyone knows:
 * 		function must do one thing; don't make function public unless it needs to be that; 
 * 		comment ambigious code, for larger functions indicate their purpose (through commenting);
 */


// main namespace that is exposed to global scope (window object)
window.sidescroller_game = (function namespace(){

		var Includes = require("./Includes.js"); var include_data = Includes.get_include_data({
		current_module: "None", 
		include_options: Includes.choices.ALL_CONTROLLERS
	}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}

	// Game initiation section: >>>
		
	var load_game = function(mode, session_id, player_id, player_id_array)
	{
	
		Includes.init(); // first
		include(); // second

		InitController.init(mode, session_id, player_id, player_id_array); // init all the stuff

		if(mode == "test"){
			TestController.test();
		}
	};


	var run = function(mode, session_id, player_id, player_id_array)
	{
		// done this way to ensure that load_game's internals aren't accessible to the world:
		load_game(mode, session_id, player_id, player_id_array);
	}; 
	
	return {
		run: run
	}; // expose function run to the world

})(); 

