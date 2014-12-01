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
                    configs = {};
                }
                return new State(name, configs.from, configs.enter, configs.exit, configs.parent);
            }
        };
    }

    function State(name, from, enter, exit, parent)
    {
    	var _name = name;
    	var _from = from == null ? ["*"] : from;
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

        	get enterCallback()
        	{
        		return _enterCallback;
        	},

        	get exitCallback()
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
