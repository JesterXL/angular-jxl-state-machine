describe('jxlStateMachine Factory Spec: Basics', function()
{
    var fsm = null;
    var jxlStateMachine = null;

    beforeEach(function()
    {
        module('com.jessewarden.statemachine');
    });

    beforeEach(inject(function(_jxlStateMachine_)
    {
        jxlStateMachine = _jxlStateMachine_;
        fsm = new jxlStateMachine();
    }));

    afterEach(function()
    {
        fsm = null;
    });

    it('should have a dummy test', function()
    {
        expect(true).to.equal(true);
    });

    it('can add a state', function()
    {
        fsm.addState('fire1');
        assert.equal(fsm.currentState, null);
    });
    
    it('can add a state and make it the current', function()
    {
        var defaultState = fsm.addState('defaultState');
        fsm.initialState = 'defaultState';
        assert.equal(fsm.currentState, defaultState);
    });
    
    it('can add multiple states and make the 1st current', function()
    {
        fsm.addState('fire1');
        fsm.addState('fire2');
        fsm.addState('fire3');
        fsm.initialState = 'fire1';
        assert.equal(fsm.currentState.name, 'fire1');
    });
    
    it('can move from one state to the other', function()
    {
        fsm.addState('fire1');
        fsm.addState('fire2');
        fsm.initialState = 'fire1';
        fsm.changeState('fire2');
        assert.equal(fsm.currentState.name, 'fire2');
    });
    
    it('can move from one state to the next and back again', function()
    {
        fsm.addState('fire1');
        fsm.addState('fire2');
        fsm.initialState = 'fire1';
        fsm.changeState('fire2');
        fsm.changeState('fire1');
        assert.equal(fsm.currentState.name, 'fire1');
    });
    
    it('can move from one state to the next and back again with 3 states', function()
    {
        fsm.addState('fire1');
        fsm.addState('fire2');
        fsm.addState('fire3');
        fsm.initialState = 'fire1';
        fsm.changeState('fire2');
        fsm.changeState('fire3');
        assert.equal(fsm.currentState.name, 'fire3');
    });

    it('can have multiple instances', function()
    {
        var fsm1 = new jxlStateMachine();
        var fsm2 = new jxlStateMachine();
        expect(fsm1).not.to.equal(fsm2);
    });

    it('multiple instances can have different states', function()
    {
        var fsm1 = new jxlStateMachine();
        fsm1.addState('fire1');
        fsm1.addState('fire2');
        fsm1.addState('fire3');
        fsm1.initialState = 'fire1';

        var fsm2 = new jxlStateMachine();
        fsm2.addState('cow1');
        fsm2.addState('moogoo');
        fsm2.addState('yet again 4, dude!');
        fsm2.initialState = 'moogoo';

        expect(fsm1.currentState.name).not.to.equal(fsm2.currentState.name);
    });
    
});

describe('jxlStateMachine Factory Spec: Basics', function()
{

    var fsm = null;
    var $rootScope = null;

    beforeEach(function()
    {
        module('com.jessewarden.statemachine');
    });

    beforeEach(inject(function(_jxlStateMachine_, _$rootScope_)
    {
        fsm = new _jxlStateMachine_();
        $rootScope = _$rootScope_;
    }));

    afterEach(function()
    {
        fsm = null;
        $rootScope = null;
    });
    
    // tearDown(()
    // {
    //     fsm = null;
    //     if(subscription != null)
    //     {
    //         subscription.cancel();
    //         subscription = null;
    //     }
    // });
    
    it('can go to * states from any state', function(done)
    {
        fsm.addState('fire1');
        fsm.addState('fire2', {from: ["*"]});
        fsm.initialState = 'fire1';
        fsm.changeState('fire2')
        .then(function()
        {
            assert.equal(fsm.currentState.name, 'fire2');
            done();
        },
        function(error)
        {
            console.error("man, error:", error);
            done(error);
        },
        function(notify)
        {
            console.log("notify:", notify);
        });
        $rootScope.$digest();
    });
    
    // it('successfully fires a transition denied event for non-from events', function()
    // {
    //     fsm.addState('fire1');
    //     fsm.addState('fire2', from: ["moocow"]);
    //     fsm.initialState = 'fire1';
    //     bool called = false;
    //     subscription = fsm.changes
    //     .where((StateMachineEvent event)
    //     {
    //         return event.type == StateMachineEvent.TRANSITION_DENIED;
    //     })
    //     .listen((StateMachineEvent event)
    //     {
    //         called = true;
    //     });
    //     Function callback = expectAsync((bool success) => success);
    //     fsm.changeState('fire2').then(callback);
    //     assert.equal(called, true);
    // });
    
    // it('successfully fires a transition complete event for approved events', ()
    // {
    //     fsm.addState('fire1');
    //     fsm.addState('fire2', from: ["fire1"]);
    //     fsm.initialState = 'fire1';
    //     bool called = false;
    //     subscription = fsm.changes
    //     .where((StateMachineEvent event)
    //     {
    //         return event.type == StateMachineEvent.TRANSITION_COMPLETE;
    //     })
    //     .listen((StateMachineEvent event)
    //     {
    //         called = true;
    //     });
    //     Function callback = expectAsync((bool success) => success);
    //     fsm.changeState('fire2').then(callback);
    //     assert.equal(called, true);
    // });
    
    it('individual state gets enter callback', function()
    {
        var called = false;
        var onEnter = function()
        {
            called = true;
        };
        fsm.addState('main', {enter: onEnter});
        fsm.initialState = 'main';
        expect(called).to.equal(true);
    });
    
    it('parent states work', function()
    {
        fsm.addState('main');
        fsm.addState('child1', {parent: 'main'});
        fsm.addState('child2', {parent: 'main'});
        fsm.initialState = 'child1';
        assert.equal(fsm.currentState.name, 'child1');
    });
    
    it('child state can go to sibling', function(done)
    {
        fsm.addState('main');
        fsm.addState('child1', {parent: 'main'});
        fsm.addState('child2', {parent: 'main'});
        fsm.initialState = 'child1';
        fsm.changeState('child2')
        .then(function()
        {
            assert.equal(fsm.currentState.name, 'child2');
            done();
        },
        function(error)
        {
            done(error);
        });
        
        $rootScope.$digest();
    });
    
    it('child state enter callback is called', function()
    {
        var called = false;
        fsm.addState("main");
        fsm.addState("defense", {
            from: ["main"], 
            enter: function()
            {
                called = true;
            }});
        fsm.addState("row", {from: ["main"]});
        fsm.initialState = 'defense';
        assert.equal(called, true);
    });
    
    it('child state exit callback is called', function(done)
    {
        var called = false;
        fsm.addState("main");
        fsm.addState("defense", {
            parent: 'main', 
            exit: function()
            {
                called = true;
            }});
        fsm.addState("row", {parent: 'main'});
        fsm.initialState = 'defense';
        fsm.changeState('row')
        .then(function()
        {
            assert.equal(called, true);
            done();
        },
        function(error)
        {
            done(error);
        });
        
        $rootScope.$digest();
    });

});
