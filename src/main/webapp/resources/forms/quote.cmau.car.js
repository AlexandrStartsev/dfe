defineForm("quote.cmau.car", [ "require", "dfe-common", "dfe-field-helper", "components/div-button", "components/label", "components/button", "components/div", "components/c-radiolist", "components/c-editbox", "components/c-dropdown", "components/editbox-dropdown-switch", "components/c-editbox-$", "components/container", "components/c-checkbox", "components/tab-s" ], function(require, cmn, fields, __c_div_button, __c_label, __c_button, __c_div, __c_c_radiolist, __c_c_editbox, __c_c_dropdown, __c_editbox_dropdown_switch, __c_c_editbox_$, __c_container, __c_c_checkbox, __c_tab_s) {
    return new class {
        constructor() {
            this.dfe = __c_div("root", {
                get: $$ => $$('policy.cmau')
            }, [ __c_tab_s("locs", {
                get: $$ => $$('.location'),
                val: $$ => $$.required('.location'),
                atr: () => ({
                    haclass: 'tab-item-active',
                    focusnew: 1,
                    hfield: 'loc-hdr',
                    rowclass$header: 'tab-header',
                    rowclass: 'tab-body',
                    rowstyle: 'display: block; width: 900px;'
                })
            }, [ __c_div_button("loc-hdr", {
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
            }), __c_div("loc-title1", {
                get: $$ => [ $$ ],
                pos: [ {
                    colclass: "tab-section-header"
                } ]
            }, [ __c_label("field-159", {
                get: $$ => 'Location #' + ($$.index() + 1)
            }), __c_button("add-car", {
                get: () => 'Add Vehicle',
                set: function($$, value) {
                    let p = $$.append('.car', this.carDefaults)[0], r = $$.runtime;
                    setTimeout(function() {
                        let t = r.findChildren(r.findControls('cars', $$), 1, 0, 'vin', p).pop().ui;
                        t && t.focus();
                    }, 100);
                },
                atr: () => ({
                    style: 'padding: 1px 10px'
                }),
                pos: [ {
                    colstyle: "position: absolute; right: 5px; top: 5px"
                } ]
            }) ]), __c_tab_s("cars", {
                get: $$ => $$('.car'),
                val: $$ => $$.required('.car'),
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
            }, [ __c_div_button("car-hdr", {
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
            }), __c_container("body", {
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
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-154", {
                get: $$ => 'Vehicle #' + ($$.index() + 1),
                pos: [ {
                    w: "2"
                } ]
            }), __c_c_radiolist("field-9", {
                atr: () => fields.simple('.hasvin', [], {
                    orientation: 'horizontal',
                    text: 'Do you have the VIN?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_editbox("vin", {
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
            }), __c_c_radiolist("vinoverride", {
                atr: () => fields.simple('.vinoverride', [], {
                    cstyle: 'padding-left: 10px;',
                    orientation: 'horizontal',
                    text: 'Override VIN?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_radiolist("custom", {
                atr: () => fields.simple('.custom', [], {
                    cstyle: 'padding-left: 10px;',
                    orientation: 'horizontal',
                    text: 'Vehicle Year, Make and/or Model is not available in dropdown'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_dropdown("type-choice", {
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
            }), __c_editbox_dropdown_switch("year-switch", {
                val: $$ => $$.required('.ModelYr', '(18|19|20)\\d{2}'),
                atr: $$ => this.vehDetailsChoice($$, '.ModelYr', '\\d{1,4}', 'year', 'Vehicle Year', 'getYearOptions', {
                    vehicleType: $$('.vehicletype')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_editbox_dropdown_switch("make-switch", {
                atr: $$ => this.vehDetailsChoice($$, '.make', '[-\\w ]{1,50}', 'make', 'Vehicle Make', 'getMakeOptions', {
                    vehicleType: $$('.vehicletype'),
                    vehicleYear: $$('.ModelYr')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_editbox_dropdown_switch("model-switch", {
                atr: $$ => this.vehDetailsChoice($$, '.modelinfo', '[-\\w ]{1,50}', 'model', 'Vehicle Model', 'getModelOptions', {
                    vehicleType: $$('.vehicletype'),
                    vehicleYear: $$('.ModelYr'),
                    vehicleMake: $$('.make')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_editbox_$("costnew-free", {
                atr: $$ => fields.simple('.vehicleocostnew', {
                    disabled: this.vehDetailsDisabled($$),
                    style: 'width: 150px;',
                    formatting: '$9,999,999',
                    text: 'Original Cost New'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_container("private", {
                get: $$ => $$('.vehicletype') == 'car' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1"
                } ]
            }, [ __c_label("field-36", {
                get: () => 'Private Passenger Auto',
                pos: [ {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-34", {
                atr: () => fields.choice('.VehUseCd', [ 'Furnished for Non-Business Use', 'All Other' ], {
                    text: 'Usage'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-35", {
                get: () => 'Apply to all Passenger Vehicles',
                set: ($$, value) => this.all($$, '.VehUseCd', 'car'),
                atr: $$ => ({
                    class: 'link-button'
                }),
                pos: [ {
                    n: "N"
                } ]
            }), __c_container("nonbus", {
                get: $$ => $$('.VehUseCd') == 'Furnished for Non-Business Use' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_dropdown("field-38", {
                atr: () => fields.choice('.OperExp', [ 'No operator licensed less than 5 years', 'Licensed less than 5 yrs not owner or principal operator', 'Owner or principal operator licensed less than 5 yrs' ], {
                    cstyle: 'padding-left: 10px',
                    text: 'Operator Experience'
                })
            }), __c_button("field-39", {
                get: () => 'Apply to all Passenger Vehicles',
                set: $$ => this.all($$, '.OperExp', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-42", {
                atr: () => fields.choice('.OperUse', [ 'Not driven to work or school', 'To of from work less than 15 miles', 'To or from work 15 or more miles' ], {
                    cstyle: 'padding-left: 10px',
                    text: 'Operator Use'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-43", {
                get: () => 'Apply to all Passenger Vehicles',
                set: $$ => this.all($$, '.OperUse', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_div("field-151", {
                get: $$ => [ $$ ],
                pos: [ {
                    n: "Y",
                    s: "padding: 0px;"
                } ]
            }) ]), __c_container("truck", {
                get: $$ => $$('.vehicletype') == 'truck' ? [ $$ ] : [],
                atr: $$ => ({
                    class: 'col-va-middle col-3-centred tab-alt-color tab-cols-3-4-3',
                    skip: $$('.VehicleClass') == 'Trailer Types' ? [ 'field-152' ] : []
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1"
                } ]
            }, [ __c_label("field-49", {
                get: () => 'Trucks, Tractors and Trailers',
                pos: [ {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-51", {
                atr: () => fields.choice('.VehicleClass', [ 'Light Truck 10,000 lbs GVW or less', 'Medium Truck 10,001 to 20,000 lbs GVW', 'Heavy Truck 20,001 to 45,000 lbs GVW', 'Extra-Heavy Truck over 45,000 lbs GVW', 'Heavy Truck-Tractor 45,000 lbs GCW or less', 'Extra-Heavy Truck-Tractor over 45,000 lbs GCW', 'Trailer Types' ], {
                    text: 'Vehicle Class'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-52", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.VehicleClass', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("trailer", {
                get: $$ => $$('.VehicleClass') == 'Trailer Types' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-3-4-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_dropdown("field-55", {
                atr: () => fields.choice('.TrailerType', 'Semitrailers|Trailers|Service or Utility Trailer (0-200 lbs. Load Capacity)'.split('|'), {
                    text: 'Trailer Type',
                    style: 'max-width: 310px;'
                })
            }), __c_button("field-56", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.TrailerType', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_div("field-152", {
                get: $$ => [ $$ ],
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }), __c_c_radiolist("field-58", {
                atr: () => fields.simple('.UseClassInd1', {
                    orientation: 'horizontal',
                    text: 'Is this auto used for transporting personnel, tools and equipment to and from a job location where it is parked for the majority of the day?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-59", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.UseClassInd1', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_radiolist("field-62", {
                atr: () => fields.simple('.UseClassInd2', {
                    orientation: 'horizontal',
                    text: 'Is this auto used for pick-up and/or delivery of property to residential households?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-63", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.UseClassInd2', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-65", {
                atr: () => fields.choice('.RadiusClass', 'Local up to 50 miles|Intermediate 51 to 200 miles|Long distance over 200 miles'.split('|'), {
                    style: 'width:fit-content',
                    text: 'Radius'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-66", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.RadiusClass', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_checkbox("field-68", {
                atr: $$ => fields.simple('.DumpingOpInd', [], {
                    text: 'Used in dumping'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-69", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.DumpingOpInd', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-71", {
                atr: () => fields.choice('.SecondaryClass', [ 'Truckers', 'Food Delivery', 'Waste Disposal', 'Farmers', 'Dump & Transit Mix', 'Contractors', 'Not Otherwise Specified' ], {
                    style: 'width:fit-content',
                    text: 'Secondary Class'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-72", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.SecondaryClass', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-74", {
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
            }), __c_button("field-75", {
                get: () => 'Apply to all Trucks, Tractors and Trailers',
                set: $$ => this.all($$, '.SecondaryClassType', 'truck'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_container("golf", {
                get: $$ => $$('.vehicletype') == 'golf' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1"
                } ]
            }, [ __c_label("field-122", {
                get: () => 'Golf Carts and Low Speed Vehicles',
                pos: [ {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-125", {
                atr: () => fields.choice('.GolfType', [ 'Golf Cart', 'Low Speed Vehicles' ], {
                    text: 'Type',
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-126", {
                get: () => 'Apply to all Golf Carts and Low Speed Vehicles',
                set: $$ => this.all($$, '.GolfType', 'golf'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-128", {
                atr: () => fields.choice('.GolfUse', [ 'Used On Golf Course', 'Other Commercial Purposes' ], {
                    text: 'Use',
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-129", {
                get: () => 'Apply to all Golf Carts and Low Speed Vehicles',
                set: $$ => this.all($$, '.GolfUse', 'golf'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_checkbox("field-131", {
                atr: () => fields.simple('.GolfVhsub', [], {
                    text: 'Vehicle subject to compulsory, financial or other law'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-132", {
                get: () => 'Apply to all Golf Carts and Low Speed Vehicles',
                set: $$ => this.all($$, '.GolfVhsub', 'golf'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_container("mobile", {
                get: $$ => $$('.vehicletype') == 'mobile' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1"
                } ]
            }, [ __c_label("field-123", {
                get: () => 'Mobile Homes',
                pos: [ {
                    w: "3"
                } ]
            }), __c_c_dropdown("field-134", {
                atr: () => fields.choice('.MobileHomeType', [ 'Trailer Equipped As Living Quarters', 'Pickup Trucks Used Solely To Transport Camper Bodies', 'Motor Homes Self-Propelled Equipped As Living Quarters' ], {
                    text: 'Type',
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-135", {
                get: () => 'Apply to all Mobile Homes',
                set: $$ => this.all($$, '.MobileHomeType', 'mobile'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("length-switch", {
                get: $$ => $$('.MobileHomeType') == 'Motor Homes Self-Propelled Equipped As Living Quarters' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3"
                } ]
            }, [ __c_c_dropdown("field-138", {
                atr: () => fields.choice('.MotorHomeSize', [ 'Up To 22 feet', 'More Than 22 feet' ], {
                    text: 'Length',
                    style: 'width: fit-content'
                })
            }), __c_button("field-139", {
                get: () => 'Apply to all Mobile Homes',
                set: $$ => this.all($$, '.MotorHomeSize', 'mobile'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]) ]), __c_container("covs", {
                get: $$ => [ $$ ],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1"
                } ]
            }, [ __c_label("field-77", {
                get: () => 'Coverages',
                pos: [ {
                    w: "3"
                } ]
            }), __c_c_checkbox("field-79", {
                atr: $$ => fields.simple('.PhysDmgInd', [], {
                    text: 'Physical Damage Only?'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-80", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.PhysDmgInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-82", {
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
            }), __c_button("field-83", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.otc.ded'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_dropdown("field-85", {
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
            }), __c_button("field-86", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.col.ded'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("val-switch", {
                get: $$ => ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/) ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_dropdown("field-88", {
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
            }), __c_button("field-89", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.ValuationMethod'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_container("amt-switch", {
                get: $$ => this.compCol($$) && $$('.ValuationMethod') == 'Stated Amount' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color-1 tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_editbox_$("field-92", {
                atr: () => fields.simple('.StatedAmt', {
                    text: 'Stated Amount',
                    cstyle: 'padding-left: 10px;',
                    style: 'width: 100px',
                    formatting: '$9,999,999'
                })
            }), __c_button("field-93", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.StatedAmt'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_container("pdonly-switch", {
                get: $$ => $$('.PhysDmgInd') == 'Y' || $$('..state') != 'KS' ? [] : [ $$ ],
                atr: $$ => this.covTabClass($$, 1),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_checkbox("field-96", {
                atr: () => fields.simple('.coverages.pip.IncludeInd', [], {
                    text: 'Personal Injury Protection Coverage'
                })
            }), __c_button("field-97", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.IncludeInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("pip-switch", {
                get: $$ => $$('.coverages.pip.IncludeInd') == 'Y' ? [ $$ ] : [],
                atr: $$ => this.covTabClass($$),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_dropdown("field-100", {
                atr: () => fields.choice('.coverages.pip.addedpipoption', [ 'Option 1', 'Option 2' ], {
                    text: 'Additional Personal Injury Protection',
                    cstyle: 'padding-left: 10px',
                    style: 'width: fit-content'
                })
            }), __c_button("field-101", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.addedpipoption'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_editbox("field-103", {
                atr: () => fields.simple('.coverages.pip.broadpipnum', {
                    text: 'Number of Individuals for Broadened PIP',
                    cstyle: 'padding-left: 10px',
                    pattern: '[0-9]{1,5}',
                    style: 'width: 80px;'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-104", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.broadpipnum'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("added-pip", {
                get: $$ => +$$('.coverages.pip.broadpipnum') > 0 ? [ $$ ] : [],
                atr: $$ => this.covTabClass($$),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_editbox("field-145", {
                atr: () => fields.simple('.coverages.pip.addedbroadpipnum', {
                    text: 'Number of Named Individuals for Additional Broadened PIP',
                    cstyle: 'padding-left: 10px',
                    pattern: '[0-9]{1,5}',
                    style: 'width: 80px;'
                })
            }), __c_button("field-146", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.addedbroadpipnum'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("added-pip-s", {
                get: $$ => +$$('.coverages.pip.addedbroadpipnum') ? [ $$ ] : [],
                atr: $$ => this.covTabClass($$, 1),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_dropdown("field-149", {
                atr: () => fields.choice('.coverages.pip.addedbpipoptioncd', [ 'Option 1', 'Option 2' ], {
                    text: 'Additional Broadened Personal Injury Protection',
                    cstyle: 'padding-left: 10px',
                    style: 'width: fit-content'
                })
            }), __c_button("field-150", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.coverages.pip.addedbpipoptioncd'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]) ]) ]) ]) ]), __c_container("opt-covs", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: `col-3-centred ${this.vehShowTowingLabor($$) ? 'tab-alt-color' : 'tab-alt-color-1'} tab-cols-4-3-3`,
                    skip: $$('..state') == 'KS' ? [ 'field-111', 'field-112', 'field-114', 'field-115' ] : [ 'field-113' ]
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1"
                } ]
            }, [ __c_label("field-106", {
                get: () => 'Optional Coverages',
                pos: [ {
                    w: "3"
                } ]
            }), __c_container("towing-switch", {
                get: $$ => this.vehShowTowingLabor($$) ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-alt-color-1 tab-cols-4-3-3'
                }),
                pos: [ {
                    w: "3",
                    n: "Y",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_dropdown("field-118", {
                atr: () => fields.choice('.coverages.towlabor.towlabor', fields.choiceItems({
                    'No Coverage': 'No Coverage',
                    $50: '50',
                    $100: '100',
                    $200: '200'
                }), {
                    style: 'width: fit-content',
                    text: 'Towing and Labor'
                })
            }), __c_button("field-119", {
                get: () => 'Apply to all Passenger Vehicles',
                set: $$ => this.all($$, '.coverages.towlabor.towlabor', 'car'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]), __c_c_checkbox("field-108", {
                atr: () => fields.simple('.losspayee.losspayeeInd', [], {
                    text: 'Loss Payee'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-109", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.losspayeeInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_checkbox("field-111", {
                atr: () => fields.simple('.losspayee.ailessorInd', [], {
                    text: 'Additional Insured - Lessor'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-112", {
                get: function($$) {
                    return 'Apply to all Vehicles';
                },
                set: $$ => this.all($$, '.losspayee.ailessorInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_checkbox("field-114", {
                atr: () => fields.simple('.losspayee.haownInd', [], {
                    text: 'Hired Auto - Specified As Covered Auto You Own'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-115", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.haownInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_c_checkbox("field-157", {
                atr: () => fields.simple('.emplessor', [], {
                    text: 'Employee as Lessor'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_button("field-158", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.emplessor'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("field-113", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: `col-3-centred ${this.vehShowTowingLabor($$) ? 'tab-alt-color' : 'tab-alt-color-1'} tab-cols-4-3-3`
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __c_c_checkbox("field-116", {
                atr: () => fields.simple('.losspayee.namedinsuredInd', [], {
                    text: 'Additional Named Insured'
                })
            }), __c_button("field-117", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.namedinsuredInd'),
                atr: () => ({
                    class: 'link-button'
                })
            }), __c_container("field-120", {
                get: $$ => $$('.losspayee.namedinsuredInd') == 'Y' ? [ $$ ] : [],
                atr: $$ => ({
                    class: `col-3-centred ${this.vehShowTowingLabor($$) ? 'tab-alt-color-1' : 'tab-alt-color'} tab-cols-4-3-3`
                }),
                pos: [ {
                    n: "Y",
                    s: "padding: 0px;",
                    w: "3"
                } ]
            }, [ __c_c_editbox("field-121", {
                atr: () => fields.simple('.losspayee.namedInsured.Name', {
                    cstyle: 'padding-left: 10px;',
                    html: '<b style="color: red">*</b>Name'
                })
            }), __c_button("field-124", {
                get: () => 'Apply to all Vehicles',
                set: $$ => this.all($$, '.losspayee.namedInsured.Name'),
                atr: () => ({
                    class: 'link-button'
                })
            }) ]) ]) ]), __c_div("car-ctrl", {
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
            }, [ __c_button("clone-car", {
                get: () => 'Clone Vehicle',
                set: function($$, value) {
                    let r = $$.runtime, p = $$.clone();
                    setTimeout(function() {
                        let t = r.findChildren(r.findControls('cars', p.get('..')), 1, 0, 'vin', p).pop().ui;
                        t && (t.focus(), t.setSelectionRange(t.value.length - 6, t.value.length));
                    }, 100);
                },
                atr: () => ({
                    style: 'padding: 1px 10px; margin: 0px 5px'
                }),
                pos: [ {
                    colstyle: "display: inline-block"
                } ]
            }), __c_button("remove-car", {
                get: () => 'Remove Vehicle',
                set: $$ => $$.detach(),
                atr: () => ({
                    style: 'padding: 1px 10px; margin: 0px 5px'
                }),
                pos: [ {
                    colstyle: "display: inline-block"
                } ]
            }) ]) ]) ]) ]), __c_button("add-loc", {
                get: () => 'Add location',
                set: $$ => $$.append('.location'),
                atr: () => ({
                    style: 'width: 150px; margin: 3px; display: none'
                }),
                pos: [ {
                    colstyle: "align-self: flex-end;"
                } ]
            }) ]);
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
                html: `<a href="javascript:showHelp('/cmau_help.html#${help}')" class="css-qmark"></a>${label}`,
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
            $$.get('.vinnumber').length == 17 ? ajaxCache.get({
                method: 'CMAUVehicleScriptHelper',
                action: 'getVinLookupResults',
                vinNumber: $$.get('.vinnumber')
            }).then(function(data) {
                let r = data.result, isTrailer = r.vehicleType == 'x';
                $$.set(r.isMatch ? {
                    vinvalid: 'Y',
                    vehicletype: isTrailer ? 'truck' : r.vehicleType,
                    ModelYr: r.vehicleYear,
                    make: r.vehicleMake,
                    modelinfo: r.vehicleModel,
                    vehicleocostnew: r.vehicleCost,
                    vinoverride: 'N',
                    VehicleClass: isTrailer ? 'Trailer Types' : $$.get('.VehicleClass')
                } : {
                    vinvalid: 'N'
                });
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