import React from 'react';
import { mount, shallow } from 'enzyme';

import Browser from 'components/Browser';
import AddressBar from 'components/AddressBar';
import TabBar from 'components/TabBar';
import Notifier from 'components/Notifier';
import TabContents from 'components/TabContents';

jest.mock('extensions', () => {

});

describe( 'Browser', () =>
{
    let wrapper;
    let instance;
    let props;

    beforeEach( () =>
    {
        props = {
            ui                   : {},
            addBookmark          : jest.fn(),
            removeBookmark       : jest.fn(),
            selectAddressBar      : jest.fn(),
            blurAddressBar       : jest.fn(),
            addNotification      : jest.fn(),
            addLocalNotification : jest.fn()
        };
        wrapper = mount( <Browser { ...props } /> );
        instance = wrapper.instance();
    } );

    describe( 'constructor( props )', () =>
    {
        it( 'should have name Browser', () =>
        {
            expect( instance.constructor.name ).toMatch( 'Browser' );
        } );
    } );

    describe( 'mount() with one tab', () =>
    {
        beforeEach( () =>
        {
            props = { ...props, tabs: [{ url: 'hello', isActiveTab: true, windowId: 1 }] };
            wrapper = mount( <Browser { ...props } /> );
            instance = wrapper.instance();
        } );

        it( 'should have exactly 1 AddressBar component', () =>
        {
            expect( wrapper.find( AddressBar ).length ).toBe( 1 );
        } );

        it( 'should have exactly 1 TabBar component', () =>
        {
            expect( wrapper.find( TabBar ).length ).toBe( 1 );
        } );

        it( 'should have exactly 1 Notifier component', () =>
        {
            expect( wrapper.find( Notifier ).length ).toBe( 1 );
        } );

        it( 'should have exactly 1 TabContents component', () =>
        {
            expect( wrapper.find( TabContents ).length ).toBe( 1 );
        } );
    } );

    describe( 'props', () =>
    {
        beforeEach( () =>
        {
            props = { ...props, tabs: [] };
            wrapper = shallow( <Browser { ...props } /> );
            instance = wrapper.instance();
        } );

        describe( 'addressBarIsSelected', () =>
        {
            it( 'addressBarIsSelected should be "false" by default', () =>
            {
                expect( instance.addressBarIsSelected ).toBeFalsy();
            } );
        } );

        describe( 'tabs', () =>
        {
            it( 'should exist', () =>
            {
                expect( instance.props ).not.toBeUndefined( );
            } );
            it( 'should be empty by default', () =>
            {
                expect( instance.props.tabs.length ).toBe( 0 );
            } );

            it( 'should be an array', () =>
            {
                expect( Array.isArray( instance.props.tabs ) ).toBeTruthy( );
            } );
        } );
    } );
} );
