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


function isInteger(i) {
    if (typeof i ==='number' && (i % 1) === 0) {
        return true;
    }
    return false;
}

class Coord {
    constructor(x, y) {
        this.x = isInteger(x) ? x : undefined;
        this.y = isInteger(y) ? y : undefined;
    }
}

class Player {

	constructor() {
        this.warrior;
        this.maxSightRange = 3;                     // Maximum distance the warrior can see.
	    this.maxHealth = 20;                    // Stores the warriors maximum health.
	    this.prevHealth = null;                 // Stores the health value the warrior had in the previous turn.

        this.memory = {                         // Stores the warriors spatial memory using an object as a 2 dimentional array.
            0: {
                0: ['player']
            }
        };

	    this.memoryOrigin = {                   // Initialises the warriors starting coordinate.
	    	x: 0,
	    	y: 0
	    }

	    this.currentCoord = new Coord(0, 0);    // Stores warriors currently location.
        this.facing = TRAVERSAL[0];             // Stores the traversal values for the warriors currently faced direction.
        this.coordToExplore = null;             // Stores over multiple turns a specific coordinate the warrior should explore.
	}

  	playTurn(warrior) {
  		
  		this.warrior = warrior;
  		var goal = 'explore';


        // UPDATE MEMORY
        // =============
    	
    	// Updates spacial memory.
    	this.lookAroundObj(warrior);


    	

        // DETERMINE GOAL
        // ==============

    	// If currently safe and health is down then rest.
    	if(this.isSafe(warrior) && warrior.health() < this.maxHealth) {
    		goal = 'rest';
    	}

    	// If NOT safe and health is below 50% then retreat.
    	else if(!this.isSafe(warrior) && warrior.health() < this.maxHealth / 2) {
    		goal = 'flee';
    	}
        else if(this.canTakeShotAtEnemy().length > 0) {
            goal = 'attack';
    	// If NOT safe and health is equal or above 80% then search and destroy.
    	} else if(!this.isSafe(warrior)) {
    		goal = 'search and destroy';
    	} else if(this.isCaptiveInSight()) {
    		goal = 'rescue';
    	} else if(this.isLevelExplored()) {
            goal = 'exit';
        }


        // ACTION ON GOAL
        // ==============

	    switch (goal) {
	    	case 'explore': 

                if(!this.coordToExplore) {
    		    	var entityCoordsArray = this.getAllFromMemoryWithExceptionObj(['isStairs', 'isWall', 'player', 'unidentified']);
    		    	var coordsAdjToUnknown = [];


    		    	for (var i = 0; i < entityCoordsArray.length; i++) {
 
    		    		if(this.getEntityAdjToCoords('unknown', entityCoordsArray[i]).length > 0) {
    		    			coordsAdjToUnknown.push(entityCoordsArray[i]);
    		    		}
    		    	}

                    if(coordsAdjToUnknown.length > 0) {
                        this.coordToExplore = coordsAdjToUnknown[0];
                    }
                }

                
                
                if(this.coordToExplore) {
                    var direction = this.getCoordDirection(this.coordToExplore);

                    if(direction != 'forward') {
                       


                        this.pivot(direction);
                        
                    } else {
                        this.walk(direction);
                    }
                }
                



	    		break;	    			
	    	case 'exit':
                var exitCoord = this.getEntityFromMemory('isStairs')[0];

                if(exitCoord) {
                    this.walk(this.getCoordDirection(exitCoord));
                }

	    		break;

	    	case 'rescue':
	    		var captiveCoords = this.getEntityAdjToCoords('isCaptive', this.currentCoord, this.maxSightRange);

     
                if(captiveCoords.length > 0) {
                    if(this.isWithinMeleeRange(captiveCoords[0])) {
                        warrior.rescue(this.getCoordDirection(captiveCoords[0]));
                    } else {
                        this.walk(this.getCoordDirection(captiveCoords[0]));
                    }
                }
	    	
	    		break;
	    	case 'rest':
	    		warrior.rest();
	    		break;
	    	case 'flee':
	    		this.walk('backward');
	    		break;
            case 'attack':

                var hostilesCoords = this.canTakeShotAtEnemy();
     
                if(hostilesCoords.length > 0) {
                    if(this.isWithinMeleeRange(hostilesCoords[0])) {
                        warrior.attack(this.getCoordDirection(hostilesCoords[0]));
                    } else {
                        warrior.shoot(this.getCoordDirection(hostilesCoords[0]));
                    }
                }

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

        // HOUSE KEEPING
        // =============

	    this.prevHealth = warrior.health();

        // If the coordinate we wanted to explore has changed to reveal stairs, make sure to cancel
        // the exploreable coordinate so we relook for valid exploreable coordinates.
        if(this.coordToExplore) {
            if(this.getEntityAdjToCoords('unknown', this.coordToExplore).length == 0 || this.retrieveMemory(this.coordToExplore)[0] === 'isStairs' || (this.coordToExplore.x == this.currentCoord.x && this.coordToExplore.y == this.currentCoord.y)) {
                this.coordToExplore = null;
            }
        }
	    
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

    pivot(direction) {

        if(!direction) {
            direction = 'backward';
        }

        for (var i = 0; i < DIRECTIONS.length; i++) {
            if(DIRECTIONS[i] == direction) {
                this.facing = TRAVERSAL[i];
            }
        }

        this.warrior.pivot(direction);
        
    }

    isCaptiveInSight() {
        var captivesInSight = this.getEntityAdjToCoords('isCaptive', this.currentCoord, this.maxSightRange);

        if(captivesInSight.length > 0) {
            return true;
        }
        return false;
    }



    // Returns an x, y object containing the distance between two coordinates on eac axis.
    getCoordDirectDistance(coord1, coord2) {
        return {x: (coord1.x - coord2.x), y: (coord1.y - coord2.y) };
    }

  	getCoordDirection(coord) {

  		var direction = new Coord(0, 0);

        if(coord.x < this.currentCoord.x) {
            direction.x = -1;
        } else if (coord.x > this.currentCoord.x) { // changed > directions
            direction.x = 1;
        } else {
            direction.x = 0;
        }

        if(coord.y < this.currentCoord.y) {
            direction.y = -1;
        } else if (coord.y > this.currentCoord.y) { // changed > directions
            direction.y = 1;
        } else {
            direction.y = 0;
        }


        // Determine the TRAVERSAL array offset needed in calculating which direction to
        // go based off of facing direction.
        var offset = 0;
        for (var i = 0; i < TRAVERSAL.length; i++) {
            if(this.facing == TRAVERSAL[i]) {
                offset = i;
            }
        }



  		for (var i = 0; i < TRAVERSAL.length; i++) {
  			if(TRAVERSAL[i].x == direction.x && TRAVERSAL[i].y == direction.y) {

                // Apply the array offset created from which way the warrior is facing.
                var directionIndex = ( i + offset >= TRAVERSAL.length) ? i - offset : i + offset;

                // if(directionIndex >= 0) {
                //    return 'left';
                // }
                // return 'left';
  				return DIRECTIONS[directionIndex];
  			}
  		}

  		// return 'left';
  	}

  	getEntityAdjToCoords(entity, coordOrigin, range) {

  		var adjCoords = this.getAdjacentCoords(coordOrigin, range);
  		var entitiyCoords = [];
        // if(entity === 'isCaptive') {
        //     if(adjCoords.length == 12) {
        //         return [{x: 2, y: 0}];
        //     }
        // }
        // var count = 0;
  		for (var i = 0; i < adjCoords.length; i++) {
            // if(entity === 'isCaptive') {
                // if(adjCoords[i].x == 2) {
                    // count++;
                    // return [{x: 2, y: 0}];
                // }

                // if(count == 3) {
                //     return [{x: 2, y: 0}];
                // }
            // }
			if(this.retrieveMemory(adjCoords[i])[0] === entity) {
				entitiyCoords.push(adjCoords[i]);
			}
		}

  		return entitiyCoords;
  	}

  	getEntityFromMemory(entity) {
  		var entityCoordsArray = [];

        for (var key_x in this.memory) {
            if (this.memory.hasOwnProperty(key_x)) {
                for (var key_y in this.memory[key_x]) {
                    if (this.memory[key_x].hasOwnProperty(key_y)) {

                        var observedCoord = new Coord(parseInt(key_x), parseInt(key_y));

          				if(this.retrieveMemory(observedCoord)[0] === entity) {
          					entityCoordsArray.push(observedCoord);
          				}
                    }
                }
  			}
  		}
  		return entityCoordsArray;
  	}

    // Returns an ARRAY of OBJECTS containing two KEYS, 'x' and 'y', each with an INT coord assigned.
    getAllFromMemoryWithExceptionObj(entityException) {
        var entityCoordsArray = [];

        for (var key_1D in this.memory) {
            if (this.memory.hasOwnProperty(key_1D)) {
                
                for (var key_2D in this.memory[key_1D]) {
                    if (this.memory[key_1D].hasOwnProperty(key_2D)) {

                        var observedCoord = new Coord(parseInt(key_1D), parseInt(key_2D));
                        var containsException = false;

                        for (var e = 0; e < entityException.length; e++) {

                            if(this.retrieveMemory(observedCoord)[0] === entityException[e] || this.retrieveMemory(observedCoord)[0] === 'isStairs') {
                                containsException = true;
                                break;
                            }
                        }

                        if(!containsException) {
                            entityCoordsArray.push(observedCoord);
                        }
                    }
                }

            }
        }
        return entityCoordsArray;
    }

    lookAroundObj(warrior) {

        if(this.memory[this.currentCoord.x] === undefined) {
            this.memory[this.currentCoord.x] = {};
        }
        
        if(this.memory[this.currentCoord.x][this.currentCoord.y] === undefined) {
            this.memory[this.currentCoord.x][this.currentCoord.y] = [];
        }

        this.addMemory(this.currentCoord, 'player');

        for (var i = 0; i < DIRECTIONS.length; i++) {

            var lookingArray = warrior.look(DIRECTIONS[i]);

            for (var j = 0; j < lookingArray.length; j++) {
                lookingArray[j]
            // }
                var observedCoord = new Coord( this.currentCoord.x + (TRAVERSAL[i].x * (j + 1)), this.currentCoord.y + (TRAVERSAL[i].y * (j + 1)));


                if(this.memory[observedCoord.x] === undefined) {
                    this.memory[observedCoord.x] = {};
                }
                
                if(this.memory[observedCoord.x][observedCoord.y] === undefined) {
                    this.memory[observedCoord.x][observedCoord.y] = [];
                }


                // CURRENTLY IF MEMORY ALREADY HAS SAY isStairs in mind, say after having rested for a few turns.
                // THEN LOOKS AGAIN WILL OVERRIDE WITH AN ISEMPTY! - No it doesn't!
                if(lookingArray[j].isEnemy()) {
                    if(this.retrieveMemory(observedCoord)[0] !== 'isEnemy') {
                        this.addMemory(observedCoord, 'isEnemy');
                    }
                } else if(lookingArray[j].isCaptive()) {

                    if(this.retrieveMemory(observedCoord)[0] !== 'isCaptive') {
                        this.addMemory(observedCoord, 'isCaptive');
                    }
                } else if(lookingArray[j].isWall()) {

                    if(this.retrieveMemory(observedCoord)[0] !== 'isWall') {
                        this.addMemory(observedCoord, 'isWall');
                    }

                } else if(lookingArray[j].isStairs()) {
                    if(this.retrieveMemory(observedCoord)[0] !== 'isStairs') {
                        this.addMemory(observedCoord, 'isStairs');
                    }
                } else if(lookingArray[j].isEmpty()) {

                    if(this.retrieveMemory(observedCoord)[0] !== 'isEmpty') {
                        this.addMemory(observedCoord, 'isEmpty');
                    }
                } else {
                    if(this.retrieveMemory(observedCoord)[0] !== 'unidentified') {
                        this.addMemory(observedCoord, 'unidentified');
                    }
                }
            }
        }
    }


    // COMMENTING THIS OUT UNTIL I'M SURE THE LOOKAROUND FUNCTION WORKS.
    // feelAroundObj(warrior) {

    //     if(this.memory[this.currentCoord.x] === undefined) {
    //         this.memory[this.currentCoord.x] = {};
    //     }
        
    //     if(this.memory[this.currentCoord.x][this.currentCoord.y] === undefined) {
    //         this.memory[this.currentCoord.x][this.currentCoord.y] = [];
    //     }

    //     this.addMemory(this.currentCoord, 'player');

    //     for (var i = 0; i < DIRECTIONS.length; i++) {
    //         // var observedCoord = {
    //         //     x: this.currentCoord.x + TRAVERSAL[i].x,
    //         //     y: this.currentCoord.y + TRAVERSAL[i].y
    //         // };

    //         var observedCoord = new Coord( this.currentCoord.x + TRAVERSAL[i].x, this.currentCoord.y + TRAVERSAL[i].y);

    //         // if(observedCoord.x >= 0 && observedCoord.y >= 0) {

    //             // x = ( typeof x != 'undefined' && x instanceof Array ) ? x : []

    //             if(this.memory[observedCoord.x] === undefined) {
    //                 this.memory[observedCoord.x] = {};
    //             }
                
    //             if(this.memory[observedCoord.x][observedCoord.y] === undefined) {
    //                 this.memory[observedCoord.x][observedCoord.y] = [];
    //             }


    //             // CURRENTLY IF MEMORY ALREADY HAS SAY isStairs in mind, say after having rested for a few turns.
    //             // THEN LOOKS AGAIN WILL OVERRIDE WITH AN ISEMPTY! - No it doesn't!
    //             if(warrior.feel(DIRECTIONS[i]).isEnemy()) {
    //                 if(this.retrieveMemory(observedCoord)[0] !== 'isEnemy') {
    //                     this.addMemory(observedCoord, 'isEnemy');
    //                 }
    //             } else if(warrior.feel(DIRECTIONS[i]).isCaptive()) {

    //                 if(this.retrieveMemory(observedCoord)[0] !== 'isCaptive') {
    //                     this.addMemory(observedCoord, 'isCaptive');
    //                 }
    //             } else if(warrior.feel(DIRECTIONS[i]).isWall()) {

    //                 if(this.retrieveMemory(observedCoord)[0] !== 'isWall') {
    //                     this.addMemory(observedCoord, 'isWall');
    //                 }

    //             } else if(warrior.feel(DIRECTIONS[i]).isStairs()) {
    //                 if(this.retrieveMemory(observedCoord)[0] !== 'isStairs') {
    //                     this.addMemory(observedCoord, 'isStairs');
    //                 }
    //             } else if(warrior.feel(DIRECTIONS[i]).isEmpty()) {

    //                 if(this.retrieveMemory(observedCoord)[0] !== 'isEmpty') {
    //                     this.addMemory(observedCoord, 'isEmpty');
    //                 }
    //             } else {
    //                 if(this.retrieveMemory(observedCoord)[0] !== 'unidentified') {
    //                     this.addMemory(observedCoord, 'unidentified');
    //                 }
    //             }
    //         // }
    //     }
    // }

  	getAdjacentCoords(coord, range) {
  		var adjCoords = [];

        if(!range) {
            range = 1;
        }

  		for (var i = 0; i < DIRECTIONS.length; i++) {
            for (var j = 1; j <= range; j++) {
                adjCoords.push({
                    x: coord.x + (TRAVERSAL[i].x * j),
                    y: coord.y + (TRAVERSAL[i].y * j)
                });   
            }
  		}	
  		return adjCoords;
  	}

  	isLevelExplored() {

        var entityCoordsArray = this.getAllFromMemoryWithExceptionObj(['isStairs', 'isWall', 'isPlayer', 'unidentified']);
        var coordsAdjToUnknown = [];

        for (var i = 0; i < entityCoordsArray.length; i++) {
            
            if(this.getEntityAdjToCoords('unknown', entityCoordsArray[i]).length > 0) {
                coordsAdjToUnknown.push(entityCoordsArray[i]);
            }
        }

        if(coordsAdjToUnknown.length > 0) {
            return false;
        }

  		return true;
  	}

  	addMemory(coord, entity) {
  		this.memory[coord.x][coord.y].unshift(entity);
  	}

  	retrieveMemory(coord) {
  		if(this.memory[coord.x] != undefined && this.memory[coord.x][coord.y] != undefined) {
  			return this.memory[coord.x][coord.y];
  		}
  		return ['unknown'];
  	}

    // Determines whether or not an enemy is within maxSiteDistance of warrior but not if there is an obsticle between the warrior and enemy.
    isEnemyInRange() {

        var enemiesInRange = this.getEntityAdjToCoords('isEnemy', this.currentCoord, this.maxSightRange);
        if(enemiesInRange.length > 0) {
            return true;
        }
        return false;
    }

    canTakeShotAtEnemy() {
        var enemiesInRange = this.getEntityAdjToCoords('isEnemy', this.currentCoord, this.maxSightRange);
        var enemiesWithClearShot = [];

        if(enemiesInRange.length > 0) {
            for (var i = 0; i < enemiesInRange.length; i++) {
                
                var enemyDirection = this.getCoordDirection(enemiesInRange[i]);
                var traversalVals = TRAVERSAL[DIRECTIONS.indexOf(enemyDirection.toLowerCase())];

                for (var distance = 1; distance <= this.maxSightRange; distance++) {
                    
                    var targetCoord = new Coord(this.currentCoord.x + (traversalVals.x * distance), this.currentCoord.y + (traversalVals.y * distance));
                    
                    if(this.retrieveMemory(targetCoord)[0] === 'isEnemy') {
                        enemiesWithClearShot.push(targetCoord);
                    }

                    if(this.retrieveMemory(targetCoord)[0] !== 'isEmpty') {
                        break;
                    }
                }
                        
            }
            // if(enemiesWithClearShot.length > 0) {
            // return [new Coord(3,0)];
            
            // }

            return enemiesWithClearShot;
        }
        return false;
    }

    isWithinMeleeRange(coord) {
        var distance = this.getCoordDirectDistance(this.currentCoord, coord);

        distance.x = (distance.x >= 0) ? distance.x : distance.x * -1;
        distance.y = (distance.y >= 0) ? distance.y : distance.y * -1;

        if((distance.x == 1 && distance.y == 0) || (distance.x == 0 && distance.y == 1)) {
            return true;
        }
        return false;
    }

  	isSafe(warrior) {
  		
  		if(this.tookDamageLastTurn(warrior)) {
  			return false;
  		}

        if(this.getEntityAdjToCoords('isEnemy', this.currentCoord).length > 0) {
            return false;
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
