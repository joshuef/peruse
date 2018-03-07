import * as ui from 'actions/ui_actions';

describe( 'ui actions', () =>
{
    it( 'should have types', () =>
    {
        expect( ui.TYPES ).toBeDefined();
    } );

    it( 'should set addressbar selected', () =>
    {
        const expectedAction = {
            type : ui.TYPES.SELECT_ADDRESS_BAR
        };
        expect( ui.selectAddressBar( ) ).toEqual( expectedAction );
    } );

    it( 'should set addressbar deselected', () =>
    {
        const expectedAction = {
            type : ui.TYPES.DESELECT_ADDRESS_BAR
        };
        expect( ui.deselectAddressBar( ) ).toEqual( expectedAction );
    } );

    it( 'should clear a notification', () =>
    {
        const expectedAction = {
            type : ui.TYPES.BLUR_ADDRESS_BAR
        };
        expect( ui.blurAddressBar( ) ).toEqual( expectedAction );
    } );

} );
