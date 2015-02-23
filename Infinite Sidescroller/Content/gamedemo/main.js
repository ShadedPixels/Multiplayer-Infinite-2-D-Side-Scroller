"use strict";

/*
 * Rules for working on this:
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
 * 		comment ambigious code, for larger functions indicate their purpose 
 */

var sidescroller_game = (function namespace(){
	// Constants section >>>
	
	var SCREEN_W; // set up when the page is loaded (to 95% of width of containing element) 
	var SCREEN_H = 600;


	// Frames Per Second. Essentially, frequency of createjs.Ticker 
	// Warning! Frequency of the Box2D physics updates may be different
	// (Currently not implemented)
		var FPS = 30; 

	var B2D_SCALE = 30;
	
	// END Constants section <<<

	// Utility
	var Utility = (function()
	{
		var lg = function()
		{
			/*
			 * shortcut to console.log()
			 * prints all arguments to console
			 * first argument is used as a label for the rest
			 *
			 * each labeled group is enclosed into the colored delimiters
			 * >>> and <<< so it's easily distinguished. I found it helpful,
			 * if you don't let me know, or use something else
			 */
			console.log("%s %c %s", arguments[0], "background: #DAF2B1", ">>>");
			
			for(var i = 1; i < arguments.length; i++)
			{
				console.log("\t", arguments[i]);
			}
			console.log("%c<<<", "background: #DAF2B1");

		};

		var random_choice = function(probabilities, choices){
			/*
			   takes 2 arrays with elements at corresponding indexes
			   being choice and it's probability. picks random one.
			   choices are anything, probability is integer a, such that
			   probability of a choice is a/10. with a < 10, of course
			   and probabilities adding up to 10. 
			   Yes, it's not very good implementation (read: terrible), 
			   and since you noticed, now it's your job to improve it.

			*/

			// array with choices duplicated a proper amount of times based on
			// their probability
			var blah = []; 

			for(var i = 0; i < choices.length; i++){
				for(var j = 0; j < probabilities[i]; j++){
					blah.push(choices[i]);
				}
			}

			var rand_index = Math.floor(Math.random() * blah.length);

			return blah[rand_index];
		};

		

		return {
			lg: lg,
			random_choice: random_choice
		};

	})();
	var lg = Utility.lg; // for quicker access

	// Models section: >>>
	
	// Unlike controllers, which are allowed to support "private" methods,
	// models are not allowed to have that.
	
	var GameModel = new function(){ // main model

		// Notice that all these variables will be initialized from the InitController

		this.stage; // easeljs representation of the main canvas

		this.other_players = {}; // players controlled by remote clients

		this.hero; // player controlled by the current user
	};

	var PlayerModel; // TODO: must be possible to instantiate [and/or] duplicate

	var TerrainModel = new function(){

		// TODO: dynamic initialization
		this.terrain_queues = [
			[],
			[],
			[]
		];

	};

	var BackgroundModel; // Split in two later? (Tow background mooving at the different speed may give more depth)

	var HUDModel; // Heads-Up Display 

	var EnemyModel;

	var AssetModel = new function(){
		// As always, almost anything is initialized in the InitController
		
		this.loader;

		this.manifest = [ // defining resources to be loaded in bulk with preload.js
				{src: "greek_warrior.png", id: "greek_warrior"},
				//{src:, id:},
				{src: "middle_terrain.png", id:"middle_terrain"},
				{src: "bottom_terrain.png", id: "bottom_terrain"},
				{src: "grass.png", id: "grass"}
			]; 
			// TODO make adding resources easier? Automatic loading 
			// of everything from assets, automatic names etc.?

		this.shapes = {}; // maybe this aren't needed

		this.bitmaps = {};

		this.animations = {};

	};

	var CameraModel = new function(){
		this.center_x; // not implemented
		this.center_y; // not implemented

		this.following;


	};
	
	var WorldModel = new function(){


	};

	// END Models section <<<

	// Controllers section: >>>

	var WorldController = (function(){

		return {
		}
	})();

	var GameController = (function(){

		var MOVEMENT_EDGE = 500; // where terrain start scrolling

		var update_all = function(event){
			/*
			 * main function pretty much
			 * everyghing else is called from here every tick
			 */
			
			var delta = event.delta;

			var cmds = KeyboardController.movement_commands();

			// Separate function >>>
			if(cmds.indexOf("right") > -1){
				// temporary

				if(GameModel.hero.x > MOVEMENT_EDGE){
					PlayerController.move_right(GameModel.hero);
					CameraController.move(10, 0);
					//TerrainController.move_left(10);
					//CameraController.follow(GameModel.hero);
				}else{
					//CameraController.unfollow();
					PlayerController.move_right(GameModel.hero);
				}
			}


			if(cmds.indexOf("left") > -1){
				if(GameModel.hero.x > 10){
					PlayerController.move_left(GameModel.hero);
				}
			}

			// <<<

			//TerrainController.generate_terrain(); 
			
			// Should be called after all movement of objects is done:
			CameraController.update(); 

			GameModel.stage.update();
		};



		

		return {
			update_all: update_all,
		};

	})();

	var CameraController = (function(){

		var update = function(){
			var following = CameraModel.following;
			if(following){
				center_at(following.x,  following.y);
			}

		};

		var center_at = function(x, y){
			/* NOT IMPLEMENTED
			 * instantly center camera at the given coordinates
			 * Alg: calculate x offset, calculate y ofsset, call >move<
			 */
			var scr_center = get_screen_center(); // current camera position

			var offset_x = x - scr_center.x;
			var offset_y = y - scr_center.y;

			lg("x, y", offset_x, offset_y);

			move(offset_x, offset_y);
		};

		var get_screen_center = function(){
			// is a function to handle screen resize functionality, when implemented
			return {
				x: SCREEN_W / 2,
				y: SCREEN_H / 2
			};

		};

		var follow = function(easeljs_obj){
			/*
			 * follow specific easeljs object everywhere
			 */

			CameraModel.following = easeljs_obj;
		};

		var unfollow = function(){
			CameraModel.following = null;
		};

		var move = function(offset_x, offset_y){
			/*
			 * moving camera in some direction essentially means
			 * moving world (terrain, background, players, enemies, etc.)
			 * in opposite direction, and screen elements (HUD, minimap) in the smae
			 * direction
			 * Later it may need significantly more functionality 
			 */

			var n_x = (-1) * offset_x;
			var n_y = (-1) * offset_y;

			TerrainController.move(n_x, n_y);
			PlayerController.move(n_x, n_y);

			// other related things.move(..., ...)
		};

		var slide = function(x, y, speed){
			/* NOT IMPLEMENTED
			 * assign the camera a coordinates to slide to with >speed< pixels/tick
			 * if we do scripted scenes, that could be useful
			 */
		};

		return {
			move: move,
			follow: follow,
			unfollow: unfollow,
			update: update

		};
	})();

	
	var WorldGenerationController;

	var PhysicsController;

	var PlayerController = (function(){

			var move_right = function(){
			GameModel.hero.x += 10;
		};

		var move_left = function(){
			//GameModel.hero.x -=10;
			move(-10, 0);
		};

		var move = function(offset_x, offset_y){
			GameModel.hero.x += offset_x;
			GameModel.hero.y += offset_y;
		};

		return {
			move_right: move_right,
			move_left: move_left,
			move: move
		};
	})();

	var EnemyController;

	var TerrainController = (function(){
		var LVL_PROB = [
			[7, 2, 1],
			[0, 7, 3],
			[0, 1, 9]
		]; // probabilities for each level; temporary!

		
		
		var retrieve_world_parameters = function(){};

		var generate_terrain = function(){
			/*
			   Load appropriate amount of the terrain ahead
			   Only a demo!!! must be made more sophisticated!
			*/


			var terrain_choices = ["grass", "middle_terrain", "bottom_terrain"];

			// TODO: make more efficient by detecting whether terrain moved since the last time
			for(var i = 0; i < TerrainModel.terrain_queues.length; i++){
				//// for each level of terrain
				var slice_index = 0; //
				var terrain_queue =  TerrainModel.terrain_queues[i];

				for(var j = 0; j < terrain_queue.length; j++){
					// for each tile, if tile is ofscreen, delete it
					var tile = terrain_queue[j];
					// TODO break after encountering first tile with bigger index (I do not implement it now to simplify debugging)
					if(tile.x < -100){
						GameModel.stage.removeChild(tile);
						slice_index += 1;
					   }
				   }

				if(slice_index > 0){
					TerrainModel.terrain_queues[i] = terrain_queue.slice(slice_index);
					var terrain_queue =  TerrainModel.terrain_queues[i];
				}


				
				var last_tile = terrain_queue[terrain_queue.length - 1];

				while(terrain_queue.length < 70){
						// while level queue isn't full
						var next_x = last_tile ? last_tile.x + 30 : -100;

						var random_id = Utility.random_choice(LVL_PROB[i], terrain_choices);

						var rand_tile = AssetController.request_bitmap(random_id);

						//This must be it's own function and be greately generalized and standartized:
						rand_tile.regX = 0;
						rand_tile.regY = 30;
						rand_tile.y = 510 + 30*(i+1);
						rand_tile.x = next_x;

						// this must be done in its own function, to keep track of everything
						// e.g. "z-index" of every element, etc.
						GameModel.stage.addChild(rand_tile); 

						terrain_queue.push(rand_tile);

						last_tile = rand_tile;

				   }

			   
		   } // end for 



		}; //end generate_terrain

		var for_each_tile = function(f){
			// takes function >f< that takes three parameters: tile (eseljs object),
			// terrain_lvl (int), and tile_index (int)
			// calls this function for every tile of the terrain
			
			var queues = TerrainModel.terrain_queues;

			$.each(queues, function(terrain_lvl){
				$.each(queues[terrain_lvl], function(tile_index){
					f(queues[terrain_lvl][tile_index], terrain_lvl, tile_index);
				});
			});

		};

		var move_left = function(pixels){
			// Should I scrap this function and just use >move<, or is this a helpful shortcut?
			
			move((-1)*pixels, 0);

		}; // end move_left
		
		var move = function(offset_x, offset_y){
			if(offset_x != 0){
				for_each_tile(function(tile, terrain_lvl, tile_index){
					tile.x += offset_x;
				});

			}// fi

			if(offset_y != 0){
				for_each_tile(function(tile, terrain_lvl, tile_index){
					tile.y += offset_y;
				});

			}

			// TODO: rework this suboptimal solution, so that terrain is regenerated only once per tick
			// instead of at each movement command; solution should be better than just placing the call
			// into the GameController.update_all function
			generate_terrain();
		};

		return {
			generate_terrain: generate_terrain,
			move_left: move_left,
			move: move
		}
	})();

	var AssetController = (function(){
		/*
		   AssetController is in charge of setting up all bitmaps/animations/other resources
		   for everyone else.
	   */

		// use AssetModel.loader.getResult("id_of_the_asset");


		var load_all = function(asset_path){

			/* TODO make model with the easily managed tables of resources which will be
			   added to the loader automatically
			*/

			var manifest = AssetModel.manifest;	


			//loader = new createjs.LoadQueue(false); // loading resourses using preload.js
			//loader.addEventListener("complete", handleComplete);
			AssetModel.loader.loadManifest(manifest, true, asset_path);
		}

		var request_bitmap = function(id){
			// if id is invalid, throw meaningful exception?
			return new createjs.Bitmap(AssetModel.loader.getResult(id));
			// TODO research DisplayObject's caching. and maybe incorporate
		};

		
		return {
			load_all: load_all,
			request_bitmap: request_bitmap
		};

	})();


	var KeyboardController = (function()
	{
		// TODO: does this section belong into the controller? >>>
		var keys = {};

		var TR_TABLES = // translation tables
		{
			code_to_name: {
				37: "left",
				38: "up",
				39: "right",
				40: "down"
			}
		}

		// <<< end TODO

		var get_active_commands = function(table){
			// get all commands associated with keys that are defined in the >table<,
			// and are currently pressed
			//
			// returns: array of commands
			
			var commands = [];
			
			$.each(table, function(key, cmd){
				if(keys[key]){
					commands.push(cmd);
				}
			});

			return commands;
		};

		// public:
		
		var keydown = function(event){
			keys[event.keyCode] = true;
		};

		var keyup = function(event){
			delete keys[event.keyCode];
		};


		var movement_commands = function(){
			return get_active_commands(TR_TABLES.code_to_name);
		};


		return {
			keydown: keydown,
			keyup: keyup,

			movement_commands: movement_commands

		};

	})();

	var InitController = (function(){

		var init = function(mode){


			setup_screen();
			setup_events();


			// Notice that asset dependent stuff doesn't (and mustn't) start until
			// all assets are completely loaded. That includes ticker, i.e. no ticks are processed
			// until everything is loaded. If you want something different, e.g. display some sort of loading
			// animation - let me know.
			// Look into the setup_asset_dependent function
				AssetModel.loader = new createjs.LoadQueue(false); // loading resourses using preload.js
				AssetModel.loader.addEventListener("complete", setup_asset_dependant);

				// if more stuff needs to be done for the test mode, 
				// or more types of it needs to be added
				// you can safely make the following a separate function
				var asset_path = (mode == "test") ? "./assets/art/" : "../Content/gamedemo/assets/art/";

				AssetController.load_all(asset_path);

			// <<<
	
		};

		
		var setup_screen = function(){

			// Setting up other stuff:
			// e.g setup canvas size
			
			// TODO: allow resizes?

			SCREEN_W = $('#canvas_container').width(); // is dynamically set to pixel width of the containing element

			// possible resizing technique: 
			// http://www.fabiobiondi.com/blog/2012/08/createjs-and-html5-canvas-resize-fullscreen-and-liquid-layouts/

			
			//$('#debug_canvas').width(String(SCREEN_W) + "px");
			//$('#display_canvas').width(String(SCREEN_W) + "px");

			//$('#debug_canvas').height(String(SCREEN_H) + "px");
			//$('#display_canvas').height(String(SCREEN_H) + "px");
			
		};

		var setup_ticker = function(){

			createjs.Ticker.setFPS(FPS);

			// ticker: on each tick call GameController.update_all();
			createjs.Ticker.addEventListener("tick", GameController.update_all);

		
		};

		var setup_events = function(){


			// keyboard input event: on each keyboard event call appropriate KeyboardController function
			document.onkeydown = KeyboardController.keydown;
			document.onkeyup = KeyboardController.keyup;

				// on interrupt event: stop/pause ticker ?

		};

		var setup_asset_dependant = function(){
			// this may need to move to either load_game or some sort of resizing function
			GameModel.stage = new createjs.Stage("display_canvas");
			GameModel.stage.canvas.width = SCREEN_W;
			GameModel.stage.canvas.height = SCREEN_H;


			GameModel.hero = AssetController.request_bitmap("greek_warrior");
			GameModel.hero.regX = 0;
			GameModel.hero.regY = GameModel.hero.image.height;
			GameModel.hero.x = 100;
			GameModel.hero.y = 510;

			GameModel.stage.addChild(GameModel.hero);

			setup_ticker();

			TerrainController.generate_terrain(); // Initial terrain generation
		};


		return {
			init: init,
		};
	})();

	var TestController = (function(){
		// placeholder for implementing testing
		// may be changed/removed/upgraded depending on how we will handle our tests
		
		var test = function(){
			// if you need some sort of tests launched, this is one of the places to do it
		};

		var post_loading_test = function(){
			// TODO: call when loading assets is completed if there are some tests that need
			// to be done at that moment. (Refer to InitController.init and 
			// InitController.setup_asset_dependent methods
		};


		return {
			test: test,
			post_loading_test: post_loading_test,
		}
	})();

	// END Controllers section <<<
	

	// Game initiation section: >>>
	
		
	var load_game = function(mode)
	{

		InitController.init(mode); // init all the stuff

		if(mode == "test"){
			TestController.test();
		}
	};


	var run = function(mode)
	{
		// done this way to ensure that load_game's internals aren't accessible to the world:
		load_game(mode);
	}; 
	
	return {
		run: run
	}; // expose function run to the world

})(); 
