var DIRECTIONS = [
	'forward',
	'right',
	'backward',
	'left'
];

var TRAVERSAL = [
	{ x: 1, y: 0 },
	{ x: 0, y: -1 },
	{ x: -1, y: 0 },
	{ x: 0, y: 1 }
];

class Player {

	constructor() {
	    this.maxHealth = 20;
	    this.prevHealth = null;
	    this.memory = [
	    	[
	    		[['player']]
	    	]
	    ];

	    this.memoryOrigin = {
	    	x: 0,
	    	y: 0
	    }

	    this.currentCoord = {
	    	x: 0,
	    	y: 0
	    }

	    this.facing = TRAVERSAL[0];

	    this.warrior;


	    this.turn = 0;
	}

  	playTurn(warrior) {
  		
  		// if(this.turn > 0) {
  			// return;
  		// }
  		this.turn++;

  		this.warrior = warrior;
  		var goal = 'explore';

    	// Cool code goes here.
    	
    	// Updates spacial memory.
    	this.lookAround(warrior);


  //   	if(this.isLevelExplored()) {
		// 	goal = 'exit';
		// }


    	// If currently safe and health is down then rest.
    	if(this.isSafe(warrior) && warrior.health() < this.maxHealth) {
    		goal = 'rest';
    	}

    	// If NOT safe and health is below 50% then retreat.
    	else if(!this.isSafe(warrior) && warrior.health() < this.maxHealth / 2) {
    		goal = 'flee';
    	}

    	// If NOT safe and health is equal or above 80% then search and destroy.
    	else if(!this.isSafe(warrior)) {
    		goal = 'search and destroy';
    	} else if(this.isCaptiveNearby()) {
    		goal = 'rescue';
    	}
   		
   	// 		if(goal == 'explore') {

   	// 		}

    // 		if(warrior.feel().isEmpty()) {
	   //  		if(warrior.feel().isStairs()) {
	   //  			if(this.isLevelExplored()) {
	   //  				warrior.walk();
	   //  			}
	   //  		} else {
	   //  			warrior.walk();
	   //  		}
	   //  	} else if(warrior.feel().isCaptive()) {
				// warrior.rescue()
	   //  	} else {
	   //  		warrior.attack();
	   //  	}
	    // }


	    switch (goal) {
	    	case 'explore': 

		    	var entityCoordsArray = this.getAllFromMemoryWithException(['isWall', 'isStairs', 'player']);
		    	var coordsAdjToUnknown = [];


		    	// if(this.retrieveMemory(entityCoordsArray[3])[0] === 'isEmpty') {
		    	// if(entityCoordsArray.length == 3) {
		    	// 	this.walk('left');
		    	// } else {
		    	// 	this.walk('right');
		    	// }

		    	if(this.memory[1].length === 1) {
		    	// if(entityCoordsArray[0].y === 0) {
		    	// if(this.retrieveMemory(entityCoordsArray[1])[0] === 'isWall') {
		    		this.walk('left');
		    	} else {
		    		this.walk('right');
		    	}

		    	// for (var i = 0; i < entityCoordsArray.length; i++) {
		    		
		    		// if(this.getEntityAdjToCoords('unknown', entityCoordsArray[0]).length > 0) {
			    	// 	this.walk('left');
			    	// } else {
			    	// 	this.walk('right');
			    	// }


		    		// if(this.getEntityAdjToCoords('unknown', entityCoordsArray[i]).length > 0) {
		    		// 	coordsAdjToUnknown.push(entityCoordsArray[i]);
		    		// 	continue;
		    		// }
		    	// }

		    	// if(coordsAdjToUnknown.length > 0) {
	    		// 	this.walk(this.getCoordDirection(coordsAdjToUnknown[0]));
		    	// }

		    	// -----

			    // var emptyCoords = this.getEntityAdjToCoords('isEmpty', this.currentCoord);
			    // var coordsAdjToUnknown = [];

			    // if(emptyCoords.length > 0) {

				   //  for(var i = 0; i < emptyCoords.length; i++) {
				   //  	if(this.getEntityAdjToCoords('unknown', emptyCoords[i]).length > 0) {
				   //  		coordsAdjToUnknown.push(emptyCoords[i]);
				   //  		continue;
				   //  	}
				   //  }

		    	// 	if(coordsAdjToUnknown.length > 0) {
		    	// 		this.walk(this.getCoordDirection(coordsAdjToUnknown[0]));
			    // 	}
			    // }


	    		break;	    			
	    	case 'exit':

	    		break;

	    	case 'rescue':
	    		var captiveCoords = this.getEntityAdjToCoords('isCaptive', this.currentCoord);

	    		if(captiveCoords.length > 0) {
	    			warrior.rescue(this.getCoordDirection(captiveCoords[0]));
	    		}

	    		break;
	    	case 'rest':
	    		warrior.rest();
	    		break;
	    	case 'flee':
	    		this.walk('backward');
	    		break;
	    	case 'search and destroy':

	    		var hostilesCoords = this.getEntityAdjToCoords('isEnemy', this.currentCoord);	    	

	    		if(hostilesCoords.length > 0) {
	    			warrior.attack(this.getCoordDirection(hostilesCoords[0]));
	    		} else {
	    			this.walk();
	    		}

	    		break;
	    	default:
	    		break;
	    }


	    this.prevHealth = warrior.health();
	    
  	}

  	getCoordAdjToUnknown() {
  		for (var i = 0; i < this.memory.length; i++) {
  			for (var j = 0; j < this.memory[i].length; j++) {
  				if(this.memory[i][j][0] != 'isWall') {
  					for (var t = 0; t < TRAVERSAL.length; t++) {

  					
	  					if(this.memory[i + TRAVERSAL[t].x]) {
	  						return {x: i, y: j};
	  					} else if(this.memory[i + TRAVERSAL[t].x][j + TRAVERSAL[t].y]) {
	  						return {x: i, y: j};;
	  					}
	  				}
  				}
  			}
  		}

  		return false;
  	}

  	walk(direction) {
  		// WARNING THIS BREAKS IF THE PLAYER BUMPS INTO SOMETHING AS THIS ASSUMES THE PLAYER HASNT!
  		if(!direction) {
  			direction = 'forward';
  		}
  		this.currentCoord.x = this.currentCoord.x + TRAVERSAL[DIRECTIONS.indexOf(direction.toLowerCase())].x;
  		this.currentCoord.y = this.currentCoord.y + TRAVERSAL[DIRECTIONS.indexOf(direction.toLowerCase())].y;

  		this.warrior.walk(direction);
  	}


  	isCaptiveNearby() {
  		if(this.getEntityAdjToCoords('isCaptive', this.currentCoord).length > 0) {
  			return true;
  		}

  		return false;
  	}

  	getCoordDirection(coord) {

  		var direction = {x: 0, y: 0};

  		// direction.x = this.currentCoord.x + coord.x;
  		// direction.y = this.currentCoord.y + coord.y;

  		// direction.x = (direction.x / direction.x);
  		// direction.x = direction.x * direction.x;

  		// direction.y = (direction.y / direction.y);
  		// direction.y = direction.y * direction.y;

  		direction.x = coord.x - this.currentCoord.x;
  		direction.y = coord.y - this.currentCoord.y;

  		for (var i = 0; i < TRAVERSAL.length; i++) {
  			if(TRAVERSAL[i].x == direction.x && TRAVERSAL[i].y == direction.y) {
  				return DIRECTIONS[i];
  			}
  		}

  		return;
  	}

  	getEntityAdjToCoords(entity, coordOrigin) {
  		var adjCoords = this.getAdjacentCoords(coordOrigin);
  		var entitiyCoords = [];

  		for (var i = 0; i < adjCoords.length; i++) {
			if(this.retrieveMemory(adjCoords[i])[0] === entity) {
				entitiyCoords.push(adjCoords[i]);
			}
		}

  		return entitiyCoords;
  	}

  	getEntityFromMemory(entity) {
  		var entityCoordsArray = [];

  		for (var i = 0; i < this.memory.length; i++) {
  			for (var j = 0; j < this.memory[i].length; j++) {
  				if(this.retrieveMemory({x: i, y: j})[0] === entity) {
  					entityCoordsArray.push({x: i, y: j});
  				}
  			}
  		}
  		return entityCoordsArray;
  	}

  	getAllFromMemoryWithException(entityException) {
  		var entityCoordsArray = [];

  		for (var i = 0; i < this.memory.length; i++) {
  			for (var j = 0; j < this.memory[i].length; j++) {
  				
  				var containsException = false;

  				for (var e = 0; e < entityException.length; e++) {
  					
  					if(this.retrieveMemory({x: i, y: j})[0] === entityException[e]) {
  						// containsException = true;
  					}

  				}

  				if(!containsException) {
  					entityCoordsArray.push({x: i, y: j});
  				}


  				// if(this.retrieveMemory({x: i, y: j})[0] !== entityException) {
  				// 	entityCoordsArray.push({x: i, y: j});
  				// }
  			}
  		}
  		return entityCoordsArray;
  	}

  	lookAround(warrior) {

  		if(this.memory[this.currentCoord.x] === undefined) {
			this.memory[this.currentCoord.x] = [];
		}
		
		if(this.memory[this.currentCoord.x][this.currentCoord.y] === undefined) {
  			this.memory[this.currentCoord.x][this.currentCoord.y] = [];
  		}

		this.addMemory(this.currentCoord, 'player');

  		for (var i = 0; i < DIRECTIONS.length; i++) {
  			var observedCoord = {
				x: this.currentCoord.x + TRAVERSAL[i].x,
				y: this.currentCoord.y + TRAVERSAL[i].y
			};

			if(observedCoord.x >= 0 && observedCoord.y >= 0) {

			// x = ( typeof x != 'undefined' && x instanceof Array ) ? x : []

			if(this.memory[observedCoord.x] === undefined) {
				this.memory[observedCoord.x] = [];
			}
			
			if(this.memory[observedCoord.x][observedCoord.y] === undefined) {
	  			this.memory[observedCoord.x][observedCoord.y] = [];
	  		}

	  		if(warrior.feel(DIRECTIONS[i]).isEnemy()) {
	  			if(this.retrieveMemory(observedCoord)[0] != 'isEnemy') {
  					this.addMemory(observedCoord, 'isEnemy');
  				}
  			} else if(warrior.feel(DIRECTIONS[i]).isCaptive()) {

  				if(this.retrieveMemory(observedCoord)[0] != 'isCaptive') {
  					this.addMemory(observedCoord, 'isCaptive');
  				}
  			} else if(warrior.feel(DIRECTIONS[i]).isWall()) {

  				if(this.retrieveMemory(observedCoord)[0] != 'isWall') {
  					this.addMemory(observedCoord, 'isWall');
  				}

  			} else if(warrior.feel(DIRECTIONS[i]).isStairs()) {
  				if(this.retrieveMemory(observedCoord)[0] != 'isStairs') {
  					this.addMemory(observedCoord, 'isStairs');
  				}
  			} else if(warrior.feel(DIRECTIONS[i]).isEmpty()) {

  				if(this.retrieveMemory(observedCoord)[0] != 'isEmpty') {
  					this.addMemory(observedCoord, 'isEmpty');
  				}
  			} else {
  				if(this.retrieveMemory(observedCoord)[0] != 'unidentified') {
  					this.addMemory(observedCoord, 'unidentified');
  				}
  			}
  		}
  		}
  	}

  	getAdjacentCoords(coord) {
  		var adjCoords = [];

  		for (var i = 0; i < DIRECTIONS.length; i++) {

  			adjCoords.push({
				x: coord.x + TRAVERSAL[i].x,
				y: coord.y + TRAVERSAL[i].y
			});
  		}	
  		return adjCoords;
  	}

  	isLevelExplored() {

  		for (var i = 0; i < this.memory.length; i++) {
  			for (var j = 0; j < this.memory[i].length; j++) {

  				for (var t = 0; t < TRAVERSAL.length; t++) {

  					if(this.memory[i][j][0] == 'isWall') {
	  					if(this.memory[i + TRAVERSAL[t].x]) {
	  						return false;
	  					} else if(this.memory[i + TRAVERSAL[t].x][j + TRAVERSAL[t].y]) {
	  						return false;
	  					}
	  				}
  				}
  			}
  		}
  		return true;
  	}

  	addMemory(coord, entity) {
  		// if(!this.memory[coord.x][coord.y]) {
  		// 	this.memory[coord.x].push([coord.y]);
  		// }

  		this.memory[coord.x][coord.y].unshift(entity);
  	}

  	retrieveMemory(coord) {
  		if(this.memory[coord.x] != undefined && this.memory[coord.x][coord.y] != undefined) {
  			return this.memory[coord.x][coord.y];
  		}
  		return ['unknown'];
  	}

  	isSafe(warrior) {
  		

  		if(this.tookDamageLastTurn(warrior)) {
  			return false;
  		}

  		for (var i = 0; i < DIRECTIONS.length; i++) {
  			if(!warrior.feel(DIRECTIONS[i]).isEmpty() && !warrior.feel(DIRECTIONS[i]).isWall() && !warrior.feel(DIRECTIONS[i]).isCaptive()) {
  				return false;
  			}
  		}
  		return true;
  	}

  	tookDamageLastTurn(warrior) {
  		if(warrior.health() < this.prevHealth) {
  			return true;
  		}
  		return false;
  	}
}
