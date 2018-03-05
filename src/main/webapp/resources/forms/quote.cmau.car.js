defineForm("quote.cmau.car", [ "require", "dfe-common", "dfe-field-helper", "components/div", "components/tab-s", "components/div-button", "components/label", "components/button", "components/container", "components/c-radiolist", "components/c-editbox", "components/c-dropdown", "components/editbox-dropdown-switch", "components/c-editbox-$", "components/c-checkbox" ], function(require, cmn, fields, __c_div, __c_tab_s, __c_div_button, __c_label, __c_button, __c_container, __c_c_radiolist, __c_c_editbox, __c_c_dropdown, __c_editbox_dropdown_switch, __c_c_editbox_$, __c_c_checkbox) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_div,
                get: $$ => $$('policy.cmau')
            }, {
                name: "locs",
                component: __c_tab_s,
                parent: "root",
                get: $$ => $$('.location'),
                atr: () => ({
                    haclass: 'tab-item-active',
                    focusnew: 1,
                    hfield: 'loc-hdr',
                    rowclass$header: 'tab-header',
                    rowclass: 'tab-body',
                    rowstyle: 'display: block; width: 900px;'
                })
            }, {
                name: "loc-hdr",
                component: __c_div_button,
                parent: "locs",
                get: $$ => `<a style="color: #444">Location #${$$.index(2) + 1}</a><br/>${$$('.city')} ${$$('.state')} ${$$('.zip')}-${$$('.zipaddon')}`.replace(/-$/, ''),
                val: $$ => $$.errorwatch($$.control.parentControl),
                atr: () => ({
                    class: 'div-button',
                    eclass: 'dfe-error',
                    vstrategy: 'always'
                }),
                pos: [ {
                    colclass: "tab-item"
                } ]
            }, {
                name: "loc-title1",
                component: __c_div,
                parent: "locs",
                get: $$ => [ $$ ],
                pos: [ {
                    colclass: "tab-section-header"
                } ]
            }, {
                name: "cars",
                component: __c_tab_s,
                parent: "locs",
                get: $$ => $$('.car'),
                atr: () => ({
                    haclass: 'tab-item-active',
                    focusnew: 1,
                    hfield: 'car-hdr',
                    style: 'width: 100%;',
                    rowclass$header: 'tab-header',
                    rowclass: 'tab-body',
                    rowstyle: 'padding: 0px; overflow: hidden;'
                }),
                pos: [ {
                    colstyle: "width: 100%; "
                } ]
            }, {
                name: "field-159",
                component: __c_label,
                parent: "loc-title1",
                get: $$ => 'Location #' + ($$.index() + 1)
            }, {
                name: "add-car",
                component: __c_button,
                parent: "loc-title1",
                get: () => 'Add Vehicle',
                set: function($$, value) {
                    let p = $$.append('.car', this.carDefaults)[0], r = $$.runtime;
                    setTimeout(function() {
                        let t = r.findChildren(r.findControls('cars', $$), 1, 0, 'vin', p).pop().ui;
                        t && t.focus();
                    }, 2);
                },
                atr: () => ({
                    style: 'padding: 1px 10px'
                }),
                pos: [ {
                    colstyle: "position: absolute; right: 5px; top: 5px"
                } ]
            }, {
                name: "car-hdr",
                component: __c_div_button,
                parent: "cars",
                get: $$ => `${$$('..state')} - Vehicle #${$$.index() + 1}<br/>${$$('.ModelYr')} ${$$('.make')}`,
                val: $$ => $$.errorwatch($$.control.parentControl),
                atr: $$ => ({
                    class: 'div-button',
                    eclass: 'dfe-error',
                    vstrategy: 'always',
                    ta: {
                        visible: $$('..car').length - 1
                    }
                }),
                pos: [ {
                    colclass: "tab-item"
                } ]
            }, {
                name: "add-loc",
                component: __c_button,
                parent: "root",
                get: () => 'Add location',
                set: $$ => $$.append('.location'),
                atr: () => ({
                    style: 'width: 150px; margin: 3px; display: none'
                }),
                pos: [ {
                    colstyle: "align-self: flex-end;"
                } ]
            }, {
                name: "body",
                component: __c_container,
                parent: "cars",
                get: $$ => [ $$ ],
                atr: function($$) {
                    let skip = $$('.hasvin') == 'Y' ? $$('.vinvalid') != 'Y' && $$('.vinnumber') != 0 ? [] : [ 'vinoverride' ] : [ 'vin', 'vinoverride' ];
                    this.vehDetailsDisabled($$) && skip.push('custom');
                    return {
                        class: 'tab-cols-5-5 tab-alt-color',
                        skip: skip
                    };
                },
                pos: [ {
                    colstyle: "width:100%",
                    colclass: "-dfe-inline-section-1"
                } ]
            }, {
                name: "field-154",
                component: __c_label,
                parent: "body",
                get: $$ => 'Vehicle #' + ($$.index() + 1),
                pos: [ {
                    w: "2"
                } ]
            }, {
                name: "field-9",
                component: __c_c_radiolist,
                parent: "body",
                atr: () => fields.simple('.hasvin', [], {
                    orientation: 'horizontal',
                    text: 'Do you have the VIN?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "vin",
                component: __c_c_editbox,
                parent: "body",
                get: $$ => $$('.vinnumber'),
                set: function($$, value) {
                    $$.set('.vinnumber', value);
                    this.vehProcessVin($$);
                },
                val: function($$) {
                    let vin = $$('.vinnumber');
                    if (vin != 0) {
                        $$('.vinoverride') == 'Y' || (vin.length != 17 ? $$.error('Invalid VIN format') : ajaxCache.get({
                            method: 'CMAUVehicleScriptHelper',
                            action: 'getVinLookupResults',
                            vinNumber: vin
                        }).then(data => data.result.isMatch || $$.error('Vin not found'), () => $$.error('Error fetching VIN data')));
                    } else $$.events.filter(e => 'validate' == e.action).length && $$.error('Required');
                },
                atr: $$ => ({
                    spellcheck: 'false',
                    disabled: $$('.hasvin') != 'Y',
                    style: 'width: 150px; text-transform:uppercase;',
                    pattern: '[a-zA-Z0-9]{1,17}',
                    text: 'Vihicle Identification Number (VIN)',
                    vstrategy: 'notified',
                    trigger: 'change'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "vinoverride",
                component: __c_c_radiolist,
                parent: "body",
                atr: () => fields.simple('.vinoverride', [], {
                    cstyle: 'padding-left: 10px;',
                    orientation: 'horizontal',
                    text: 'Override VIN?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "custom",
                component: __c_c_radiolist,
                parent: "body",
                atr: () => fields.simple('.custom', [], {
                    cstyle: 'padding-left: 10px;',
                    orientation: 'horizontal',
                    text: 'Vehicle Year, Make and/or Model is not available in dropdown'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "type-choice",
                component: __c_c_dropdown,
                parent: "body",
                atr: $$ => fields.choice('.vehicletype', fields.choiceItems({
                    'Private Passenger Type': 'car',
                    'Truck, Tractor or Trailer': 'truck',
                    'Golf Carts and Low Speed Vehicles': 'golf',
                    'Mobile Homes': 'mobile',
                    'Antique Autos': 'antique'
                }), {
                    disabled: this.vehDetailsDisabled($$),
                    text: 'Vehicle Type',
                    style: 'width: fit-content;'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "year-switch",
                component: __c_editbox_dropdown_switch,
                parent: "body",
                val: $$ => $$.required('.ModelYr', '(18|19|20)\\d{2}'),
                atr: $$ => this.vehDetailsChoice($$, '.ModelYr', '\\d{1,4}', 'year', 'Vehicle Year', 'getYearOptions', {
                    vehicleType: $$('.vehicletype')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "make-switch",
                component: __c_editbox_dropdown_switch,
                parent: "body",
                atr: $$ => this.vehDetailsChoice($$, '.make', '[-\\w ]{1,50}', 'make', 'Vehicle Make', 'getMakeOptions', {
                    vehicleType: $$('.vehicletype'),
                    vehicleYear: $$('.ModelYr')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "model-switch",
                component: __c_editbox_dropdown_switch,
                parent: "body",
                atr: $$ => this.vehDetailsChoice($$, '.modelinfo', '[-\\w ]{1,50}', 'model', 'Vehicle Model', 'getModelOptions', {
                    vehicleType: $$('.vehicletype'),
                    vehicleYear: $$('.ModelYr'),
                    vehicleMake: $$('.make')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "costnew-free",
                component: __c_c_editbox_$,
                parent: "body",
                atr: $$ => fields.simple('.vehicleocostnew', {
                    disabled: this.vehDetailsDisabled($$),
                    style: 'width: 150px;',
                    formatting: '$9,999,999',
                    text: 'Original Cost New'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "private",
                component: __c_container,
                parent: "body",
                get: $$ => $$('.vehicletype') == 'car' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "-dfe-inline-section-1"
                } ]
            }, {
                name: "field-36",
                component: __c_label,
                parent: "private",
                get: () => 'Private Passenger Auto',
                pos: [ {
                    w: "3"
                } ]
            }, {
                name: "field-34",
                component: __c_c_dropdown,
                parent: "private",
                atr: () => fields.choice('.VehUseCd', [ 'Furnished for Non-Business Use', 'All Other' ], {
                    text: 'Usage'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-35",
                component: __c_button,
                parent: "private",
                get: () => 'Apply to all Passenger Vehicles',
                set: ($$, value) => this.all($$, '.VehUseCd', 'car'),
                atr: $$ => ({
                    class: 'link-button'
                }),
                pos: [ {
                    n: "N"
                } ]
            }, {
                name: "nonbus",
                component: __c_container,
                parent: "private",
                get: $$ => $$('.VehUseCd') == 'Furnished for Non-Business Use' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-38",
                component: __c_c_dropdown,
                parent: "nonbus",
                atr: () => fields.choice('.OperExp', [ 'No operator licensed less than 5 years', 'Licensed less than 5 yrs not owner or principal operator', 'Owner or principal operator licensed less than 5 yrs' ], {
                    cstyle: 'padding-left: 10px',
                    text: 'Operator Experience'
                })
            }, {
                name: "field-39",
                component: __c_button,
                parent: "nonbus",
                get: () => 'Apply to all Passenger Vehicles',
                set: $$ => this.all($$, '.OperExp', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-42",
                component: __c_c_dropdown,
                parent: "nonbus",
                atr: () => fields.choice('.OperUse', [ 'Not driven to work or school', 'To of from work less than 15 miles', 'To or from work 15 or more miles' ], {
                    cstyle: 'padding-left: 10px',
                    text: 'Operator Use'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-43",
                component: __c_button,
                parent: "nonbus",
                get: () => 'Apply to all Passenger Vehicles',
                set: $$ => this.all($$, '.OperUse', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-151",
                component: __c_div,
                parent: "private",
                get: $$ => [ $$ ],
                pos: [ {
                    n: "Y",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-45",
                component: __c_c_editbox,
                parent: "private",
                atr: () => fields.simple('.Horsepower', [ [ '[0-9]{2,4}' ] ], {
                    pattern: '[0-9]{1,4}',
                    style: 'width: 100px',
                    text: 'Horsepower'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-46",
                component: __c_button,
                parent: "private",
                get: () => 'Apply to all Passenger Vehicles',
                set: ($$, value) => this.all($$, '.Horsepower', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "truck",
                component: __c_container,
                parent: "body",
                get: $$ => $$('.vehicletype') == 'truck' ? [ $$ ] : [],
                atr: $$ => ({
                    class: 'col-va-middle col-3-centred tab-alt-color tab-cols-3-4-3',
                    skip: $$('.VehicleClass') == 'Trailer Types' ? [ 'field-152' ] : []
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "-dfe-inline-section-1"
                } ]
            }, {
                name: "golf",
                component: __c_container,
                parent: "body",
                get: $$ => $$('.vehicletype') == 'golf' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "-dfe-inline-section-1"
                } ]
            }, {
                name: "mobile",
                component: __c_container,
                parent: "body",
                get: $$ => $$('.vehicletype') == 'mobile' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "-dfe-inline-section-1"
                } ]
            }, {
                name: "field-49",
                component: __c_label,
                parent: "truck",
                get: () => 'Trucks, Tractors and Trailers',
                pos: [ {
                    w: "3"
                } ]
            }, {
                name: "field-51",
                component: __c_c_dropdown,
                parent: "truck",
                atr: () => fields.choice('.VehicleClass', [ 'Light Truck 10,000 lbs GVW or less', 'Medium Truck 10,001 to 20,000 lbs GVW', 'Heavy Truck 20,001 to 45,000 lbs GVW', 'Extra-Heavy Truck over 45,000 lbs GVW', 'Heavy Truck-Tractor 45,000 lbs GCW or less', 'Extra-Heavy Truck-Tractor over 45,000 lbs GCW', 'Trailer Types' ], {
                    text: 'Vehicle Class'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-52",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.VehicleClass', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "trailer",
                component: __c_container,
                parent: "truck",
                get: $$ => $$('.VehicleClass') == 'Trailer Types' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-3-4-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-55",
                component: __c_c_dropdown,
                parent: "trailer",
                atr: () => fields.choice('.TrailerType', 'Semitrailers|Trailers|Service or Utility Trailer (0-200 lbs. Load Capacity)'.split('|'), {
                    text: 'Trailer Type',
                    style: 'max-width: 310px;'
                })
            }, {
                name: "field-56",
                component: __c_button,
                parent: "trailer",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.TrailerType', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-152",
                component: __c_div,
                parent: "truck",
                get: $$ => [ $$ ],
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-58",
                component: __c_c_radiolist,
                parent: "truck",
                atr: () => fields.simple('.UseClassInd1', {
                    orientation: 'horizontal',
                    text: 'Is this auto used for transporting personnel, tools and equipment to and from a job location where it is parked for the majority of the day?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-59",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.UseClassInd1', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-62",
                component: __c_c_radiolist,
                parent: "truck",
                atr: () => fields.simple('.UseClassInd2', {
                    orientation: 'horizontal',
                    text: 'Is this auto used for pick-up and/or delivery of property to residential households?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-63",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.UseClassInd2', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-65",
                component: __c_c_dropdown,
                parent: "truck",
                atr: () => fields.choice('.RadiusClass', 'Local up to 50 miles|Intermediate 51 to 200 miles|Long distance over 200 miles'.split('|'), {
                    style: 'width:fit-content',
                    text: 'Radius'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-66",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.RadiusClass', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-68",
                component: __c_c_checkbox,
                parent: "truck",
                atr: $$ => fields.simple('.DumpingOpInd', [], {
                    text: 'Used in dumping'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-69",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.DumpingOpInd', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-71",
                component: __c_c_dropdown,
                parent: "truck",
                atr: () => fields.choice('.SecondaryClass', [ 'Truckers', 'Food Delivery', 'Waste Disposal', 'Farmers', 'Dump & Transit Mix', 'Contractors', 'Not Otherwise Specified' ], {
                    style: 'width:fit-content',
                    text: 'Secondary Class'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-72",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.SecondaryClass', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-74",
                component: __c_c_dropdown,
                parent: "truck",
                atr: $$ => fields.ajaxChoice('.SecondaryClassType', {
                    method: 'CMAUVehicleScriptHelper',
                    action: 'getSecondaryClassTypeOptions',
                    secondaryClass: $$('.SecondaryClass')
                }, {
                    text: 'Secondary Class Type',
                    style: 'width:fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-75",
                component: __c_button,
                parent: "truck",
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.SecondaryClassType', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "covs",
                component: __c_container,
                parent: "body",
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "-dfe-inline-section-1"
                } ]
            }, {
                name: "field-77",
                component: __c_label,
                parent: "covs",
                get: () => 'Coverages',
                pos: [ {
                    w: "3"
                } ]
            }, {
                name: "field-79",
                component: __c_c_checkbox,
                parent: "covs",
                atr: $$ => fields.simple('.PhysDmgInd', [], {
                    text: 'Physical Damage Only?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-80",
                component: __c_button,
                parent: "covs",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.PhysDmgInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-82",
                component: __c_c_dropdown,
                parent: "covs",
                atr: $$ => fields.ajaxChoice('.coverages.otc.ded', {
                    query: {
                        method: 'CMAUVehicleScriptHelper',
                        action: 'getCompDedOptions',
                        vehicleType: $$('.vehicletype')
                    },
                    mapper: o => ({
                        value: o.value,
                        description: o.text
                    })
                }, {
                    style: 'width: min-content;',
                    text: 'Comp. Ded'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-83",
                component: __c_button,
                parent: "covs",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.otc.ded'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-85",
                component: __c_c_dropdown,
                parent: "covs",
                atr: $$ => fields.ajaxChoice('.coverages.col.ded', {
                    query: {
                        method: 'CMAUVehicleScriptHelper',
                        action: 'getCollDedOptions',
                        vehicleType: $$('.vehicletype')
                    },
                    mapper: o => ({
                        value: o.value,
                        description: o.text
                    })
                }, {
                    style: 'width: min-content;',
                    text: 'Coll. Ded'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-86",
                component: __c_button,
                parent: "covs",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.col.ded'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "val-switch",
                component: __c_container,
                parent: "covs",
                get: $$ => ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/) ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-88",
                component: __c_c_dropdown,
                parent: "val-switch",
                atr: $$ => fields.ajaxChoice('.ValuationMethod', {
                    method: 'CMAUVehicleScriptHelper',
                    action: 'getValuationMethodOptions',
                    vehicleType: $$('.vehicletype')
                }, {
                    text: 'Valuation',
                    style: 'width: min-content;'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-89",
                component: __c_button,
                parent: "val-switch",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.ValuationMethod'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "amt-switch",
                component: __c_container,
                parent: "covs",
                get: $$ => this.compCol($$) && $$('.ValuationMethod') == 'Stated Amount' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color-1 tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-92",
                component: __c_c_editbox_$,
                parent: "amt-switch",
                atr: () => fields.simple('.StatedAmt', {
                    text: 'Stated Amount',
                    cstyle: 'padding-left: 10px;',
                    style: 'width: 100px',
                    formatting: '$9,999,999'
                })
            }, {
                name: "field-93",
                component: __c_button,
                parent: "amt-switch",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.StatedAmt'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "pdonly-switch",
                component: __c_container,
                parent: "covs",
                get: $$ => $$('.PhysDmgInd') == 'Y' || $$('..state') != 'KS' ? [] : [ $$ ],
                atr: $$ => this.covTabClass($$, 1),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-96",
                component: __c_c_checkbox,
                parent: "pdonly-switch",
                atr: () => fields.simple('.coverages.pip.IncludeInd', [], {
                    text: 'Personal Injury Protection Coverage'
                })
            }, {
                name: "field-97",
                component: __c_button,
                parent: "pdonly-switch",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.IncludeInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "pip-switch",
                component: __c_container,
                parent: "pdonly-switch",
                get: $$ => $$('.coverages.pip.IncludeInd') == 'Y' ? [ $$ ] : [],
                atr: $$ => this.covTabClass($$),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-100",
                component: __c_c_dropdown,
                parent: "pip-switch",
                atr: () => fields.choice('.coverages.pip.addedpipoption', [ 'Option 1', 'Option 2' ], {
                    text: 'Additional Personal Injury Protection',
                    cstyle: 'padding-left: 10px',
                    style: 'width: fit-content'
                })
            }, {
                name: "field-101",
                component: __c_button,
                parent: "pip-switch",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.addedpipoption'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-103",
                component: __c_c_editbox,
                parent: "pip-switch",
                atr: () => fields.simple('.coverages.pip.broadpipnum', {
                    text: 'Number of Individuals for Broadened PIP',
                    cstyle: 'padding-left: 10px',
                    pattern: '[0-9]{1,5}',
                    style: 'width: 80px;'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-104",
                component: __c_button,
                parent: "pip-switch",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.broadpipnum'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "opt-covs",
                component: __c_container,
                parent: "body",
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: `col-3-centred ${this.vehShowTowingLabor($$) ? 'tab-alt-color' : 'tab-alt-color-1'} tab-cols-4-3-3`,
                    skip: $$('..state') == 'KS' ? [ 'field-111', 'field-112', 'field-114', 'field-115' ] : [ 'field-113' ]
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "-dfe-inline-section-1"
                } ]
            }, {
                name: "field-106",
                component: __c_label,
                parent: "opt-covs",
                get: () => 'Optional Coverages',
                pos: [ {
                    w: "3"
                } ]
            }, {
                name: "car-ctrl",
                component: __c_div,
                parent: "body",
                get: $$ => [ $$ ],
                atr: $$ => ({
                    skip: $$('..car').length > 1 ? [] : [ 'remove-car' ],
                    style: 'padding: 5px; text-align: right; background: lightgray;'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: "padding: 2px 0px"
                } ]
            }, {
                name: "towing-switch",
                component: __c_container,
                parent: "opt-covs",
                get: $$ => this.vehShowTowingLabor($$) ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color-1 tab-cols-4-3-3'
                }),
                pos: [ {
                    w: "3",
                    n: "Y",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "clone-car",
                component: __c_button,
                parent: "car-ctrl",
                get: () => 'Clone Vehicle',
                set: function($$, value) {
                    let r = $$.runtime, p = $$.clone();
                    setTimeout(function() {
                        let t = r.findChildren(r.findControls('cars', p.get('..')), 1, 0, 'vin', p).pop().ui;
                        t && (t.focus(), t.setSelectionRange(t.value.length - 6, t.value.length));
                    }, 2);
                },
                atr: () => ({
                    style: 'padding: 1px 10px; margin: 0px 5px'
                }),
                pos: [ {
                    colstyle: "display: inline-block"
                } ]
            }, {
                name: "field-118",
                component: __c_c_dropdown,
                parent: "towing-switch",
                atr: () => fields.choice('.coverages.towlabor.towlabor', fields.choiceItems({
                    'No Coverage': 'No Coverage',
                    $50: '50',
                    $100: '100',
                    $200: '200'
                }), {
                    style: 'width: fit-content',
                    text: 'Towing and Labor'
                })
            }, {
                name: "remove-car",
                component: __c_button,
                parent: "car-ctrl",
                get: () => 'Remove Vehicle',
                set: $$ => $$.detach(),
                atr: () => ({
                    style: 'padding: 1px 10px; margin: 0px 5px'
                }),
                pos: [ {
                    colstyle: "display: inline-block"
                } ]
            }, {
                name: "field-119",
                component: __c_button,
                parent: "towing-switch",
                get: () => 'Apply to all Passenger Vehicles',
                set: $$ => this.all($$, '.coverages.towlabor.towlabor', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-108",
                component: __c_c_checkbox,
                parent: "opt-covs",
                atr: () => fields.simple('.losspayee.losspayeeInd', [], {
                    text: 'Loss Payee'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-109",
                component: __c_button,
                parent: "opt-covs",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.losspayeeInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-111",
                component: __c_c_checkbox,
                parent: "opt-covs",
                atr: () => fields.simple('.losspayee.ailessorInd', [], {
                    text: 'Additional Insured - Lessor'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-112",
                component: __c_button,
                parent: "opt-covs",
                get: function($$) {
                    return 'Apply to all Vehicles';
                },
                set: $$ => this.all($$, '.losspayee.ailessorInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-114",
                component: __c_c_checkbox,
                parent: "opt-covs",
                atr: () => fields.simple('.losspayee.haownInd', [], {
                    text: 'Hired Auto - Specified As Covered Auto You Own'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-115",
                component: __c_button,
                parent: "opt-covs",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.haownInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-122",
                component: __c_label,
                parent: "golf",
                get: () => 'Golf Carts and Low Speed Vehicles',
                pos: [ {
                    w: "3"
                } ]
            }, {
                name: "field-123",
                component: __c_label,
                parent: "mobile",
                get: () => 'Mobile Homes',
                pos: [ {
                    w: "3"
                } ]
            }, {
                name: "field-125",
                component: __c_c_dropdown,
                parent: "golf",
                atr: () => fields.choice('.GolfType', [ 'Golf Cart', 'Low Speed Vehicles' ], {
                    text: 'Type',
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-126",
                component: __c_button,
                parent: "golf",
                get: () => 'Apply to all Golf Carts and Low Speed Vehicles',
                set: $$ => this.all($$, '.GolfType', 'golf'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-128",
                component: __c_c_dropdown,
                parent: "golf",
                atr: () => fields.choice('.GolfUse', [ 'Used On Golf Course', 'Other Commercial Purposes' ], {
                    text: 'Use',
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-129",
                component: __c_button,
                parent: "golf",
                get: () => 'Apply to all Golf Carts and Low Speed Vehicles',
                set: $$ => this.all($$, '.GolfUse', 'golf'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-131",
                component: __c_c_checkbox,
                parent: "golf",
                atr: () => fields.simple('.GolfVhsub', [], {
                    text: 'Vehicle subject to compulsory, financial or other law'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-132",
                component: __c_button,
                parent: "golf",
                get: () => 'Apply to all Golf Carts and Low Speed Vehicles',
                set: $$ => this.all($$, '.GolfVhsub', 'golf'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-134",
                component: __c_c_dropdown,
                parent: "mobile",
                atr: () => fields.choice('.MobileHomeType', [ 'Trailer Equipped As Living Quarters', 'Pickup Trucks Used Solely To Transport Camper Bodies', 'Motor Homes Self-Propelled Equipped As Living Quarters' ], {
                    text: 'Type',
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-135",
                component: __c_button,
                parent: "mobile",
                get: () => 'Apply to all Mobile Homes',
                set: $$ => this.all($$, '.MobileHomeType', 'mobile'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "length-switch",
                component: __c_container,
                parent: "mobile",
                get: $$ => $$('.MobileHomeType') == 'Motor Homes Self-Propelled Equipped As Living Quarters' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3"
                } ]
            }, {
                name: "field-138",
                component: __c_c_dropdown,
                parent: "length-switch",
                atr: () => fields.choice('.MotorHomeSize', [ 'Up To 22 feet', 'More Than 22 feet' ], {
                    text: 'Length',
                    style: 'width: fit-content'
                })
            }, {
                name: "field-139",
                component: __c_button,
                parent: "length-switch",
                get: () => 'Apply to all Mobile Homes',
                set: $$ => this.all($$, '.MotorHomeSize', 'mobile'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "added-pip",
                component: __c_container,
                parent: "pip-switch",
                get: $$ => +$$('.coverages.pip.broadpipnum') > 0 ? [ $$ ] : [],
                atr: $$ => this.covTabClass($$),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-145",
                component: __c_c_editbox,
                parent: "added-pip",
                atr: () => fields.simple('.coverages.pip.addedbroadpipnum', {
                    text: 'Number of Named Individuals for Additional Broadened PIP',
                    cstyle: 'padding-left: 10px',
                    pattern: '[0-9]{1,5}',
                    style: 'width: 80px;'
                })
            }, {
                name: "field-146",
                component: __c_button,
                parent: "added-pip",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.addedbroadpipnum'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "added-pip-s",
                component: __c_container,
                parent: "added-pip",
                get: $$ => +$$('.coverages.pip.addedbroadpipnum') ? [ $$ ] : [],
                atr: $$ => this.covTabClass($$, 1),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-149",
                component: __c_c_dropdown,
                parent: "added-pip-s",
                atr: () => fields.choice('.coverages.pip.addedbpipoptioncd', [ 'Option 1', 'Option 2' ], {
                    text: 'Additional Broadened Personal Injury Protection',
                    cstyle: 'padding-left: 10px',
                    style: 'width: fit-content'
                })
            }, {
                name: "field-150",
                component: __c_button,
                parent: "added-pip-s",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.addedbpipoptioncd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-157",
                component: __c_c_checkbox,
                parent: "opt-covs",
                atr: () => fields.simple('.emplessor', [], {
                    text: 'Employee as Lessor'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }, {
                name: "field-158",
                component: __c_button,
                parent: "opt-covs",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.emplessor'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-113",
                component: __c_container,
                parent: "opt-covs",
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: `col-3-centred ${this.vehShowTowingLabor($$) ? 'tab-alt-color' : 'tab-alt-color-1'} tab-cols-4-3-3`
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, {
                name: "field-116",
                component: __c_c_checkbox,
                parent: "field-113",
                atr: () => fields.simple('.losspayee.namedinsuredInd', [], {
                    text: 'Additional Named Insured'
                })
            }, {
                name: "field-117",
                component: __c_button,
                parent: "field-113",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.namedinsuredInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }, {
                name: "field-120",
                component: __c_container,
                parent: "field-113",
                get: $$ => $$('.losspayee.namedinsuredInd') == 'Y' ? [ $$ ] : [],
                atr: $$ => ({
                    class: `col-3-centred ${this.vehShowTowingLabor($$) ? 'tab-alt-color-1' : 'tab-alt-color'} tab-cols-4-3-3`
                }),
                pos: [ {
                    n: "Y",
                    s: "padding: 0px;",
                    w: "3"
                } ]
            }, {
                name: "field-121",
                component: __c_c_editbox,
                parent: "field-120",
                atr: () => fields.simple('.losspayee.namedInsured.Name', {
                    cstyle: 'padding-left: 10px;',
                    html: '<b style="color: red">*</b>Name'
                })
            }, {
                name: "field-124",
                component: __c_button,
                parent: "field-120",
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.namedInsured.Name'),
                atr: () => ({
                    class: 'link-button'
                })
            } ];
            this.carDefaults = JSON.parse('{"losspayee":[{"losspayeeInd":"N","ailessorInd":"N","haownInd":"N"}],"emplessor":"N","PhysDmgInd":"N","DumpingOpInd":"N","hasvin":"Y","vinoverride":"N","custom":"N","UseClassInd1":"N","UseClassInd2":"N","coverages":[{"pip":[{"IncludeInd":"N"}],"liab":[{"IncludeInd":"Y"}],"towlabor":[{"towlabor":"No Coverage"}]}]}');
        }
        vehDetailsDisabled($$) {
            return $$('.hasvin') == 'Y' && ($$('.vinnumber') == 0 || $$('.vinoverride') != 'Y');
        }
        vehDetailsChoice($$, field, pattern, help, label, action, query) {
            let disabled = this.vehDetailsDisabled($$), freetext = disabled || $$('.custom') == 'Y';
            return fields.ajaxChoice(field, {
                query: cmn.extend(query, {
                    method: 'CMAUVehicleScriptHelper',
                    action: action
                }),
                noerror: freetext
            }, {
                cstyle: 'padding-left: 10px',
                html: `<a href="javascript:showHelp('/cmau_help.html#${help}')" class="qmark"></a>${label}`,
                editbox: freetext,
                pattern: freetext && pattern,
                disabled: disabled,
                style: freetext ? 'width: 150px; text-transform:uppercase;' : 'width: fit-content;',
                val: freetext ? $$ => $$.required(field) : 0
            });
        }
        vehShowTowingLabor($$) {
            return $$('.vehicletype') == 'car' && $$('.coverages.otc.ded').toString().match(/\d|Full/);
        }
        vehProcessVin($$) {
            let vin = $$.get('.vinnumber');
            vin.length == 17 ? ajaxCache.get({
                method: 'CMAUVehicleScriptHelper',
                action: 'getVinLookupResults',
                vinNumber: $$.get('.vinnumber')
            }).then(function(data) {
                let r = data.result;
                if (r.isMatch) {
                    $$.set('.vinvalid', r.isMatch ? 'Y' : 'N');
                    $$.set('.vehicletype', r.vehicleType);
                    $$.set('.ModelYr', r.vehicleYear);
                    $$.set('.make', r.vehicleMake);
                    $$.set('.modelinfo', r.vehicleModel);
                    $$.set('.vehicleocostnew', r.vehicleCost);
                    $$.set('.vinoverride', 'N');
                }
            }, () => $$.set('.vinvalid', 'N')) : $$.set('.vinvalid', 'N');
        }
        all($$, prop, type) {
            $$('...location.car').forEach(car => type && car.data.vehicletype != type || car.set(prop, $$(prop)));
        }
        compCol($$) {
            return ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/);
        }
        covTabClass($$, opt) {
            let v = $$('.ValuationMethod') == 'Stated Amount' || !this.compCol($$);
            return {
                class: 'col-3-centred tab-cols-4-3-3 ' + (opt ^ v ? 'tab-alt-color-1' : 'tab-alt-color')
            };
        }
        onstart($$) {
            $$('policy.cmau.location').forEach(loc => loc.defaultSubset('.car', this.carDefaults).forEach(car => car.get('.hasvin') == 'Y' && this.vehProcessVin(car)));
        }
        onpost($$) {}
        setup() {
            if (typeof window != 'undefined') {
                window.showHelp = function(url) {
                    window.open(url, 'DetailWin', 'scrollbars=yes,resizable=yes,toolbar=no,height=250,width=250').focus();
                };
            }
        }
    }();
});