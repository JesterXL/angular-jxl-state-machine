describe('logger', function()
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

});
