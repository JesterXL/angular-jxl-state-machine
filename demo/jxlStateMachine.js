(function() {
    'use strict';

    angular
        .module('com.jessewarden.statemachine', []);
})();

(function () {
    'use strict';

    angular
        .module('com.jessewarden.statemachine')
        .factory('jxlState', jxlState);
    
    function jxlState()
    {
        return {
            getState: function(name, configs)
            {
                if(typeof configs == 'undefined')
                {
                    configs = {
                        from: null,
                        enter: null,
                        exit: null,
                        parent: null
                    };
                }
                return new State(name, configs.from, configs.enter, configs.exit, configs.parent);
            }
        };
    }

    function State(name, from, enter, exit, parent)
    {
    	var _name = name;
    	var _from = (from == null) ? ["*"] : from;
    	var _enterCallback = enter;
    	var _exitCallback = exit;
    	var _parent;
    	var _children = [];

        var state = {
        	
        	get name()
        	{
        		return _name;
        	},

        	get from()
        	{
        		return _from;
        	},

        	get enter()
        	{
        		return _enterCallback;
        	},

        	get exit()
        	{
        		return _exitCallback;
        	},

        	get parent()
        	{
        		return _parent;
        	},

        	set parent(parentState)
        	{
        		_parent = parentState;
        		if(_parent != null)
        		{
        			_parent.children.push(this);
        		}
        		// $scope.$broadcast("state:parentChanged", _parent);
        	},

        	get root()
        	{
        		var currentParentState = parent;
        		if(currentParentState != null)
        		{
        			while(currentParentState.parent != null)
        			{
        				currentParentState = currentParentState.parent;
        			}
        		}
        		return currentParentState;
        	},

        	get parents()
        	{
        		var parents = [];
        		var currentParentState = parent;
        		if(currentParentState != null)
        		{
        			parents.push(currentParentState);
        			while(currentParentState != null)
        			{
        				currentParentState = currentParentState.parent;
        				if(currentParentState != null)
        				{
        					parents.push(currentParentState);
        				}
        				else
        				{
        					break;
        				}
        			}
        		}
        		return parents;
        	},

        	isParentState: function(stateName)
        	{
        		var currentParents = this.parents;
        		if(currentParents.length > 0)
        		{
        			currentParents.forEach(function(parentState)
        			{
        				if(parentState.name == stateName)
        				{
        					return true;
        				}
        			});
        		}
        		return false;
        	}
        };
        
        if(parent != null)
    	{
    		_parent = parent;
    		_parent.children.push(state);
    	}

        return state;
    }

})();

(function () {
    'use strict';

    angular
        .module('com.jessewarden.statemachine')
        .service('jxlStateMachine', jxlStateMachine);

    /* ngInject */
    function jxlStateMachine(jxlState, $q, $rootScope)
    {
        var _currentState;
        var _currentParentState;
        var _currentParentStates;

        var stateMachine = {

            get currentState()
            {
                return _currentState;
            },

            states: {},

            set initialState(startStateName)
            {
                var initial = this.states[startStateName];
                _currentState = initial;
                var root = initial.root;
                if(root != null)
                {
                    _currentParentStates = initial.parents;
                    _currentParentStates.forEach(function(parentState)
                    {
                        if(parentState.enter != null)
                        {
                            // TODO: make event class
                            // local event = {name = "onEnterState", 
                            // target = self, toState = stateName, 
                            // entity = self.entity}
                            //event.currentState = parentState.name;
                            parentState.enter();
                        }
                    });
                }

                if(initial.enter != null)
                {
                    // TODO: make event class
                    initial.enter();
                }

                // TODO: dispatch transition complete... man... these should all be streams, eff me
                // local outEvent = {name = "onTransitionComplete", target = self, toState = stateName}
                
                // _streamController.add(new StateMachineEvent(StateMachineEvent.STATE_CHANGE));
                $rootScope.$broadcast('stateMachine:change', {to: startStateName, from: null});
            },

            set currentState(state)
            {
                _currentState = state;
            },

            // NOTE: I'm aware the map is flat, and I don't support multiple states of the same name.
            // TODO: fix if you care, I don't. I believe Dart Map throws error if you attempt set
            // an already existing State.
            // TODO: translate above to JavaScript, lulz
            addState: function(stateName, config)
            {
                if(typeof config == 'undefined')
                {
                    config = {};
                }
                var parentState = null;
                if(parent != null)
                {
                    parentState = this.states[parent];
                }
                var newState = jxlState.getState(stateName,
                                            {from: config.from,
                                            enter: config.enter,
                                            exit: config.exit,
                                            parent: parentState});
                this.states[stateName] = newState;
                return newState;
            },
            
            canChangeStateTo: function(stateName)
            {
                var targetToState = this.states[stateName];
                var score = 0;
                var win = 2;

                
                if(stateName != _currentState.name)
                {
                    score++;
                }
                
                // NOTE: Lua via State.inFrom was walking up one parent if from was null... why?
                if(targetToState.from != null)
                {
                    // TODO: remove lodash, someone will get all bent out of shape
                    // that I'm adding precious k to their code. #inb4lessqueque
                    
                    var tempFrom = targetToState.from;
                    var tempName = _currentState.name;
                    var tempValue = tempFrom.indexOf(tempName);
                    if(tempValue > -1)
                    {
                        score++;
                    }
                    
                    if(targetToState.from.indexOf("*") > -1)
                    {
                        score++;
                    }
                }
                
                if(_currentState != null && _currentState.parent != null)
                {
                    if(_currentState.parent.name == stateName)
                    {
                        score++;
                    }
                }
                
                if(targetToState.from == null)
                {
                    score++;
                }
                
                if(score >= win)
                {
                    return true;
                }
                else
                {
                    return false;
                }   
            },
            
            findPath: function(stateFrom, stateTo)
            {
                var fromState = this.states[stateFrom];
                var c = 0;
                var d = 0;
                var path = [];
                while(fromState != null)
                {
                    d = 0;
                    var toState = this.states[stateTo];
                    while(toState != null)
                    {
                        if(fromState == toState)
                        {
                            path.push(c);
                            path.push(d);
                            return path;
                        }
                        d++;
                        toState = toState.parent;
                    }
                    c++;
                    fromState = fromState.parent;
                }
                path.push(c);
                path.push(d);
                return path;
            },

            changeState: function(stateName)
            {
                var me = this;
                return $q(function(resolve, reject)
                {
                    try
                    {
                        if(me.canChangeStateTo(stateName) == false)
                        {
                            //_streamController.add(new StateMachineEvent(StateMachineEvent.TRANSITION_DENIED));
                            console.warn("Rejecting state change.");
                            reject(false);
                            return false;
                        }
                        var oldStateName = _currentState.name;
                        var path = me.findPath(_currentState.name, stateName);
                        
                        if(path[0] > 0)
                        {
                //          local exitCallback = {name = "onExitState",
                //                                              target = self,
                //                                              toState = stateTo,
                //                                              fromState = state}
                            if(_currentState.exit != null)
                            {
                                //exitCallback.currentCallback = _currentState;
                                _currentState.exit();
                            }

                            _currentParentState = _currentState;
                            
                            var p = 0;
                            while(p < path[0])
                            {
                                _currentParentState = _currentParentState.parent;
                                if(_currentParentState != null && _currentParentState.exit != null)
                                {
                                    // exitCallback.currentState = _currentParentState.parentState.name;
                                    _currentParentState.exit();
                                }
                                p++;
                            }
                        }
                        
                        var toState = me.states[stateName];
                        var oldState = _currentState;
                        _currentState = toState;
                        
                        if(path[1] > 0)
                        {
                //          local enterCallback = {name = "onEnterState",
                //                                              target = self,
                //                                              toState = stateTo,
                //                                              fromState = oldState,
                //                                              entity = self.entity}
                            
                            if(toState.root != null)
                            {
                                _currentParentStates = toState.parents;
                                var secondPath = path[1];
                                var k = secondPath - 1;

                                while(k >= 0)
                                {
                                    var theCurrentParentState = _currentParentStates[k];
                                    if(theCurrentParentState != null && theCurrentParentState.enter != null)
                                    {
                                        // enterCallback.currentState = theCurrentParentState.name;
                                        theCurrentParentState.enter();
                                    }
                                    k--;
                                }
                            }
                            
                            if(toState.enter != null)
                            {
                                // enterCallback.currentState = toState.name;
                                toState.enter();
                            }

                        }
                        
                //      local outEvent = {name = "onTransitionComplete",
                //                                  target = self,
                //                                  fromState = oldState,
                //                                  toState = stateTo}
                //              self:dispatchEvent(outEvent)
                        //_streamController.add(new StateMachineEvent(StateMachineEvent.TRANSITION_COMPLETE));
                        
                        // TODO: timing may be off here, check, too tired to remember right now
                        $rootScope.$broadcast('stateMachine:change', {to: toState.name, from: oldStateName});
                        resolve(true);
                    }
                    catch(error)
                    {
                        console.error("jxlStateMachine::changeState, error:", error);
                        reject(error);
                    }
                });
            }
        };

        return stateMachine;
    }
    jxlStateMachine.$inject = ['jxlState', '$q', '$rootScope'];

})();
