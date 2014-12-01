describe('jxlStateMachine Factory Spec', function()
{
    var jxlStateMachine = null;

    beforeEach(function()
    {
        module('com.jessewarden.statemachine');
    });

    beforeEach(inject(function(_jxlStateMachine_)
    {
        jxlStateMachine = _jxlStateMachine_;
    }));

    afterEach(function()
    {
        jxlStateMachine = null;
    });

    it('should have a dummy test', inject(function()
    {
        expect(true).to.equal(true);
    }));

    it('should not be null', function()
    {
        assert.isNotNull(jxlStateMachine);
    });

    // it('should give an instance', function()
    // {
    //     console.log("jxlStateMachine:", jxlStateMachine);
    //     console.log("new jxlStateMachine:", new jxlStateMachine());
    //     var instance = new jxlStateMachine();
    //     assert.isNotNull(instance);
    // });

    // it('instances should be unique', function()
    // {
    //     var instanceA = new jxlStateMachine();
    //     var instanceB = new jxlStateMachine();
    //     expect(instanceA == instanceB).to.equal(false);
    //     expect(instanceA === instanceB).to.equal(false);
    // });

});
