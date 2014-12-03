(function () {
    'use strict';

    angular
        .module('com.jessewarden.statemachine')
        .factory('jxlStateMachine', jxlStateMachine);

    /* ngInject */
    function jxlStateMachine(jxlState, $q, $rootScope)
    {
        function StateMachine()
        {
            var _currentState;
            var _currentParentState;
            var _currentParentStates;

            var stateMachineInstance = {

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
            return stateMachineInstance;
        }
        return StateMachine;
    }

})();
