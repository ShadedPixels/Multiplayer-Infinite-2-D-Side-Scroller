config = require ("../Config.js");

var HeroLogic = (function(){

		
	var Hero = function(){
		/* Will be instantiated for every created entity to hold all the information 
			about the physical (not graphical) state of the entity in question. 
			declare the properties like this:
			this.some_state_variable_initial_value = 0;
			instantiate (most likely in the spawn function) like that:
			var new_entity_instance = new Hero();
		*/
		this.hp = 100;
		this.wound = false;
		this.jumps = 0;
		this.score = 0;
	};

	var init = function(){
		/* Is ran from the EntityController.init once during game loading 
			you should assign type to your model here using the identification controller
		*/
		include(); // satisfy requirements, GOES FIRST
		IdentificationController.assign_type(Hero, "hero");
	};

	var spawn = function(x, y){
		/* spawn instance of this entity at the given coordinates
			you will have to create new entity instance, assign it id
			using the IdentificationController.assign_id(entity_instance),
			assign it a body which you can get through PhysicsController
			do any other stuff you want to do during spawning,
			and finally you HAVE TO(!!!) return the instance you just created from this function
		*/

		var hero = new Hero();

		hero.body = PhysicsController.get_rectangular({x: x, y: y, border_sensors: true}, hero);

		var id = IdentificationController.assign_id(hero);

		hero.hp = 100;
		hero.wound = false;
		hero.jumps = 0;
		hero.score = 0;


		return hero;
	
	};

	var tick_AI = function(hero){
		/* Is ran each tick from the EntityController.update for every registered
			entity of this type. I given entity_instance
		*/

		var hero_x = hero.body.GetWorldCenter().x;
		var pconf = Config.Player;
		if(pconf.movement_edge < hero_x - 20){
			pconf.movement_edge = hero_x - 20;
		}

		var cmds = KeyboardController.movement_commands();

		if(cmds("right")){
		    // temporary
		    add_score(hero, 1);
		    move_right(hero);	
		    GraphicsController.set_season(hero.body.GetWorldCenter());
		}
		if(cmds("left")){
		    // temporary
		    move_left(hero);
		    GraphicsController.set_season(hero.body.GetWorldCenter());
		}
		if(cmds("down")){
			drop(hero);
		}
		if(cmds("up")){
			jump(hero);
		}
		if(hero.wound)
		{
			hero.hp--;
			console.log("Taking damage");
			GraphicsController.update_health(hero.hp);
		}
		
		if(hero.hp <= 0)
		{
		    EntityController.delete_entity(hero);
			console.log("Player Is Dead");
		}
		
		if (hero.body.GetWorldCenter().x < pconf.movement_edge + hero.body.GetUserData().def.width/2) {
			stop_hero(hero);
			console.log("working");
		}
		if (hero.body.GetWorldCenter().y > 22) {
		    EntityController.delete_entity(hero);
		    hero.hp = 0;
		    GraphicsController.update_health(hero.hp);
		    console.log("drop of death");
		}
		GraphicsController.update_score(hero.score);
	};

	var begin_contact = function(contact, info){
		//console.log(info.Me.id, ":", "My fixture", "'" + info.Me.fixture_name + "'", "came into contact with fixture", 
			//"'" + info.Them.fixture_name + "'", "of", info.Them.id);
		if (info.Me.fixture_name == "bottom"){
			info.Me.entity.jumps = 0;
		}
		if (info.Me.fixture_name == "top"){
			take_hit(info.Me.entity, 1);
		}
		
		if(info.Me.fixture_name != "bottom" && info.Them.entity.can_attack)
		{
		    info.Me.entity.wound = true;
		}
				
	};
	
	var add_score = function (hero, amount) {
	    hero.score += amount;
	}
	

	var take_hit = function(hero, amount){
	    hero.hp -= amount;
		//GraphicsController.update_health(hero.hp);
	}

	var end_contact = function(contact, info){
			
		info.Me.entity.wound = false;
	};

	var stop_hero = function (hero) {
		//var body = hero.body;
		//var velocity = body.GetLinearVelocity();
		//velocity.x = 0;
		//body.SetLinearVelocity(velocity); // body.SetLinearVelocity(new b2Vec2(5, 0)); would work too
		//body.SetAwake(true);

		var body = hero.body;
		var w = hero.body.GetUserData().def.width/2;
		var pos = new B2d.b2Vec2(Config.Player.movement_edge + w, body.GetWorldCenter().y)
		var vel = body.GetLinearVelocity();
		if(vel.x < 0){
			var vel = new B2d.b2Vec2(0, vel.y);
			body.SetLinearVelocity(vel);
		}

	    body.SetAwake(true);
	}

	

	var jump = function(hero){
	    var body = hero.body;
		if (hero.jumps == 0){
		    body.ApplyImpulse(new B2d.b2Vec2(0, -100), body.GetWorldCenter());
		    hero.jumps += 1;
		}
		else if (hero.jumps == 1 && body.GetLinearVelocity().y > -1) {
		    body.ApplyImpulse(new B2d.b2Vec2(0, -100), body.GetWorldCenter());
		    hero.jumps += 1;
		}

		//hero.y = body.GetPosition().y * 30;
	
	};
	var drop = function(hero){
		var body = hero.body;
		body.ApplyImpulse(new B2d.b2Vec2(0, 20), body.GetWorldCenter());
	};

	var set_coordinates = function(position_vector, hero){
		// TODO: remove;
		// temporary/testing
		hero.x = (position_vector.x - 1.5/2) * 30 ;
		hero.y = (position_vector.y + 2.5/2) * 30 ;

	};

	var b2b_get_coordinates = function(hero){
		return hero.body.GetWorldCenter();
	};

	var move_left = function(hero){
		var velocity = hero.body.GetLinearVelocity();
		velocity.x = -10;
		hero.body.SetLinearVelocity(velocity); // hero.SetLinearVelocity(new b2Vec2(5, 0)); would work too
		hero.body.SetAwake(true);
	};

	var move_right = function(hero){
		var velocity = hero.body.GetLinearVelocity();
		velocity.x = +10;
		hero.body.SetLinearVelocity(velocity); // hero.SetLinearVelocity(new b2Vec2(5, 0)); would work too
		hero.body.SetAwake(true);
	};

	var move = function(offset_x, offset_y, hero){
		// unimplemented
		// should it hard-set position (not safe!)
		// or just allow to set any velocity/impulse vector?
	};
	var get_hero_x = function(){
			return hero.body.GetWorldCenter().x;
	
	};

	return {
		// declare public
		init: init, 
		spawn: spawn,
		tick_AI: tick_AI,
		begin_contact: begin_contact,
		end_contact: end_contact,
		get_hero_x: get_hero_x,
	};
})();

module.exports = HeroLogic;

var Includes = require("../Includes.js"); var include_data = Includes.get_include_data({
	current_module: "HeroLogic", 
	include_options: Includes.choices.LOGIC_SPECIFIC
}); eval(include_data.name_statements); var include = function(){eval(include_data.module_statements);}
