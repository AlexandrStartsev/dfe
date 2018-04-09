defineForm("quote.cmau.car", [ "require", "dfe-common", "dfe-field-helper", "forms/cmau/applytoall", "components/div-button", "components/label", "components/button", "components/div", "components/c-radiolist", "components/c-editbox", "components/c-dropdown", "components/c-editbox-$", "components/dfe-table", "components/container", "components/tab-s", "components/editbox", "components/dropdown", "components/c-switch" ], function(require, cmn, fields, __f_applytoall, __c_div_button, __c_label, __c_button, __c_div, __c_c_radiolist, __c_c_editbox, __c_c_dropdown, __c_c_editbox_$, __c_dfe_table, __c_container, __c_tab_s, __c_editbox, __c_dropdown, __c_c_switch) {
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
            }), __c_div("body", {
                get: $$ => [ $$ ]
            }, [ __c_dfe_table("info", {
                get: $$ => [ $$ ],
                atr: function($$) {
                    let skip = $$('.hasvin') == 'Y' ? $$('.vinvalid') != 'Y' && $$('.vinnumber') != 0 ? [] : [ 'vinoverride' ] : [ 'vin', 'vinoverride' ];
                    this.vehDetailsDisabled($$) && skip.push('custom');
                    return {
                        class: 'tab-cols-5-5',
                        skip: skip
                    };
                },
                pos: [ {
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-154", {
                get: $$ => 'Vehicle #' + ($$.index() + 1),
                pos: [ {
                    w: "2"
                } ]
            }), __c_c_radiolist("field-9", {
            	set: ($$, value) => { $$.set('.hasvin', value), 'Y' == value && this.vehProcessVin($$) },
            	get: $$ => $$('.hasvin'),
                atr: () => ({
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
                atr: $$ => fields.choice('.vehicletype', Object.keys(this.typeMap).map(k => ({
                    value: k,
                    description: this.typeMap[k].name
                })), {
                    disabled: this.vehDetailsDisabled($$),
                    text: 'Vehicle Type',
                    style: 'width: fit-content;'
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_switch("year-switch", {
                val: $$ => $$.required('.ModelYr', '(18|19|20)\\d{2}'),
                atr: $$ => this.vehDetailsChoice($$, '.ModelYr', '\\d{1,4}', 'year', 'Vehicle Year', 'getYearOptions', {
                    vehicleType: $$('.vehicletype')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_switch("make-switch", {
                atr: $$ => this.vehDetailsChoice($$, '.make', '[-\\w ]{1,50}', 'make', 'Vehicle Make', 'getMakeOptions', {
                    vehicleType: $$('.vehicletype'),
                    vehicleYear: $$('.ModelYr')
                }),
                pos: [ {
                    n: "Y"
                }, {} ]
            }), __c_c_switch("model-switch", {
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
            }) ]), __c_dfe_table("private", {
                get: $$ => $$('.vehicletype') == 'car' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1",
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-36", {
                get: () => 'Private Passenger Auto',
                pos: [ {
                    w: "3"
                } ]
            }), __f_applytoall("field-34", {
                atr: $$ => this.makeApplyAllAttrs($$, '.VehUseCd', 'Usage', {
                    items: [ 'Furnished for Non-Business Use', 'All Other' ],
                    type: 'car'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __c_container("nonbus", {
                get: $$ => $$('.VehUseCd') == 'Furnished for Non-Business Use' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-38", {
                atr: $$ => this.makeApplyAllAttrs($$, '.OperExp', 'Operator Experience', {
                    cstyle: 'padding-left: 10px',
                    items: [ 'No operator licensed less than 5 years', 'Licensed less than 5 yrs not owner or principal operator', 'Owner or principal operator licensed less than 5 yrs' ],
                    type: 'car'
                })
            }), __f_applytoall("field-42", {
                atr: $$ => this.makeApplyAllAttrs($$, '.OperUse', 'Operator Use', {
                    cstyle: 'padding-left: 10px',
                    items: [ 'Not driven to work or school', 'To of from work less than 15 miles', 'To or from work 15 or more miles' ],
                    type: 'car'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }) ]) ]), __c_dfe_table("truck", {
                get: $$ => $$('.vehicletype') == 'truck' ? [ $$ ] : [],
                atr: $$ => ({
                    class: 'col-va-middle col-3-centred tab-cols-3-4-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1",
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-49", {
                get: () => 'Trucks, Tractors and Trailers',
                pos: [ {
                    w: "3"
                } ]
            }), __f_applytoall("field-51", {
                atr: $$ => this.makeApplyAllAttrs($$, '.VehicleClass', 'Vehicle Class', {
                    items: [ 'Light Truck 10,000 lbs GVW or less', 'Medium Truck 10,001 to 20,000 lbs GVW', 'Heavy Truck 20,001 to 45,000 lbs GVW', 'Extra-Heavy Truck over 45,000 lbs GVW', 'Heavy Truck-Tractor 45,000 lbs GCW or less', 'Extra-Heavy Truck-Tractor over 45,000 lbs GCW', 'Trailer Types' ],
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __c_container("tt-switch", {
                get: $$ => $$('.VehicleClass') == 'Trailer Types' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-va-middle col-3-centred dfe-table tab-cols-3-4-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-55", {
                atr: $$ => this.makeApplyAllAttrs($$, '.TrailerType', 'Trailer Type', {
                    items: [ 'Semitrailers', 'Trailers', 'Service or Utility Trailer (0-200 lbs. Load Capacity)' ],
                    type: 'truck'
                })
            }) ]), __f_applytoall("field-58", {
                atr: $$ => this.makeApplyAllAttrs($$, '.UseClassInd1', 'Is this auto used for transporting personnel, tools and equipment to and from a job location where it is parked for the majority of the day?', {
                    component: 'radiolist',
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-62", {
                atr: $$ => this.makeApplyAllAttrs($$, '.UseClassInd2', 'Is this auto used for pick-up and/or delivery of property to residential households?', {
                    component: 'radiolist',
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-65", {
                atr: $$ => this.makeApplyAllAttrs($$, '.RadiusClass', 'Radius', {
                    items: [ 'Local up to 50 miles', 'Intermediate 51 to 200 miles', 'Long distance over 200 miles' ],
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-68", {
                atr: $$ => this.makeApplyAllAttrs($$, '.DumpingOpInd', 'Used in dumping', {
                    component: 'checkbox',
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-71", {
                atr: $$ => this.makeApplyAllAttrs($$, '.SecondaryClass', 'Secondary Class', {
                    items: [ 'Truckers', 'Food Delivery', 'Waste Disposal', 'Farmers', 'Dump & Transit Mix', 'Contractors', 'Not Otherwise Specified' ],
                    style: 'width:fit-content',
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-74", {
                atr: $$ => this.makeApplyAllAttrs($$, '.SecondaryClassType', 'Secondary Class Type', {
                    component: 'ajax-dropdown',
                    ajax: {
                        method: 'CMAUVehicleScriptHelper',
                        action: 'getSecondaryClassTypeOptions',
                        secondaryClass: $$('.SecondaryClass')
                    },
                    style: 'width: fit-content',
                    type: 'truck'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }) ]), __c_dfe_table("golf", {
                get: $$ => $$('.vehicletype') == 'golf' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1",
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-122", {
                get: () => 'Golf Carts and Low Speed Vehicles',
                pos: [ {
                    w: "3"
                } ]
            }), __f_applytoall("field-125", {
                atr: $$ => this.makeApplyAllAttrs($$, '.GolfType', 'Type', {
                    items: [ 'Golf Cart', 'Low Speed Vehicles' ],
                    style: 'width: fit-content',
                    type: 'golf'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-128", {
                atr: $$ => this.makeApplyAllAttrs($$, '.GolfUse', 'Use', {
                    items: [ 'Used On Golf Course', 'Other Commercial Purposes' ],
                    style: 'width: fit-content',
                    type: 'golf'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-131", {
                atr: $$ => this.makeApplyAllAttrs($$, '.GolfVhsub', 'Vehicle subject to compulsory, financial or other law', {
                    component: 'checkbox',
                    type: 'golf'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }) ]), __c_dfe_table("mobile", {
                get: $$ => $$('.vehicletype') == 'mobile' ? [ $$ ] : [],
                atr: $$ => ({
                    class: 'col-3-centred tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1",
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-123", {
                get: () => 'Mobile Homes',
                pos: [ {
                    w: "3"
                } ]
            }), __f_applytoall("field-134", {
                atr: $$ => this.makeApplyAllAttrs($$, '.MobileHomeType', 'Type', {
                    items: [ 'Trailer Equipped As Living Quarters', 'Pickup Trucks Used Solely To Transport Camper Bodies', 'Motor Homes Self-Propelled Equipped As Living Quarters' ],
                    style: 'width: fit-content',
                    type: 'mobile'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __c_container("size-switch", {
                get: $$ => $$('.MobileHomeType') == 'Motor Homes Self-Propelled Equipped As Living Quarters' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-2-5-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-138", {
                atr: $$ => this.makeApplyAllAttrs($$, '.MotorHomeSize', 'Length', {
                    items: [ 'Up To 22 feet', 'More Than 22 feet' ],
                    style: 'width: fit-content',
                    type: 'mobile'
                })
            }) ]) ]), __c_dfe_table("covs", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: 'col-3-centred tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1",
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-77", {
                get: () => 'Coverages',
                pos: [ {
                    w: "3"
                } ]
            }), __f_applytoall("field-81", {
                atr: $$ => this.makeApplyAllAttrs($$, '.PhysDmgInd', 'Physical Damage Only?', {
                    component: 'checkbox'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-82", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.otc.ded', 'Comp. Ded', {
                    component: 'ajax-dropdown',
                    ajax: {
                        query: {
                            method: 'CMAUVehicleScriptHelper',
                            action: 'getCompDedOptions',
                            vehicleType: $$('.vehicletype')
                        },
                        mapper: o => ({
                            value: o.value,
                            description: o.text
                        })
                    },
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-85", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.col.ded', 'Coll. Ded', {
                    component: 'ajax-dropdown',
                    ajax: {
                        query: {
                            method: 'CMAUVehicleScriptHelper',
                            action: 'getCollDedOptions',
                            vehicleType: $$('.vehicletype')
                        },
                        mapper: o => ({
                            value: o.value,
                            description: o.text
                        })
                    },
                    style: 'width: fit-content'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __c_container("val-switch", {
                get: $$ => ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/) ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-88", {
                atr: $$ => this.makeApplyAllAttrs($$, '.ValuationMethod', 'Valuation', {
                    component: 'ajax-dropdown',
                    ajax: {
                        method: 'CMAUVehicleScriptHelper',
                        action: 'getValuationMethodOptions',
                        vehicleType: $$('.vehicletype')
                    },
                    style: 'width: min-content'
                })
            }) ]), __c_container("amt-switch", {
                get: $$ => ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/) && $$('.ValuationMethod') == 'Stated Amount' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-92", {
                atr: $$ => this.makeApplyAllAttrs($$, '.StatedAmt', 'Stated Amount', {
                    component: 'editbox-$',
                    cstyle: 'padding-left: 10px;',
                    style: 'width: 100px'
                })
            }) ]), __c_container("pdonly-switch", {
                get: $$ => $$('.PhysDmgInd') == 'Y' || $$('..state') != 'KS' ? [] : [ $$ ],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-96", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.pip.IncludeInd', 'Personal Injury Protection Coverage', {
                    component: 'checkbox'
                })
            }), __c_container("pip-switch", {
                get: $$ => $$('.coverages.pip.IncludeInd') == 'Y' ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-100", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.pip.addedpipoption', 'Additional Personal Injury Protection', {
                    items: [ 'Option 1', 'Option 2' ],
                    cstyle: 'padding-left: 10px',
                    style: 'width: fit-content'
                })
            }), __f_applytoall("field-103", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.pip.broadpipnum', 'Number of Individuals for Broadened PIP', {
                    component: 'editbox',
                    pattern: '[0-9]{1,5}',
                    cstyle: 'padding-left: 10px',
                    style: 'width: 80px'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __c_container("added-pip", {
                get: $$ => +$$('.coverages.pip.broadpipnum') > 0 ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-145", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.pip.addedbroadpipnum', 'Number of Named Individuals for Additional Broadened PIP', {
                    component: 'editbox',
                    pattern: '[0-9]{1,5}',
                    cstyle: 'padding-left: 10px',
                    style: 'width: 80px'
                })
            }), __c_container("added-pip-s", {
                get: $$ => +$$('.coverages.pip.addedbroadpipnum') ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-149", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.pip.addedbpipoptioncd', 'Additional Broadened Personal Injury Protection', {
                    items: [ 'Option 1', 'Option 2' ],
                    cstyle: 'padding-left: 10px',
                    style: 'width: fit-content'
                })
            }) ]) ]) ]) ]) ]), __c_dfe_table("opt-covs", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: `col-3-centred tab-cols-4-3-3`,
                    skip: $$('..state') == 'KS' ? [ 'field-111', 'field-114' ] : [ 'field-113' ]
                }),
                pos: [ {
                    n: "Y",
                    w: "2",
                    s: ".dfe-inline-section-1",
                    colclass: "dfe-inline-section-1"
                } ]
            }, [ __c_label("field-106", {
                get: () => 'Optional Coverages',
                pos: [ {
                    w: "3"
                } ]
            }), __c_container("towing-switch", {
                get: $$ => $$('.vehicletype') == 'car' && $$('.coverages.otc.ded').toString().match(/\d|Full/) ? [ $$ ] : [],
                atr: () => ({
                    class: 'col-3-centred dfe-table tab-cols-4-3-3'
                }),
                pos: [ {
                    w: "3",
                    n: "Y",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-118", {
                atr: $$ => this.makeApplyAllAttrs($$, '.coverages.towlabor.towlabor', 'Towing and Labor', {
                    items: fields.choiceItems({
                        'No Coverage': 'No Coverage',
                        $50: '50',
                        $100: '100',
                        $200: '200'
                    }),
                    style: 'width: fit-content'
                })
            }) ]), __f_applytoall("field-108", {
                atr: $$ => this.makeApplyAllAttrs($$, '.losspayee.losspayeeInd', 'Loss Payee', {
                    component: 'checkbox'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-111", {
                atr: $$ => this.makeApplyAllAttrs($$, '.losspayee.ailessorInd', 'Additional Insured - Lessor', {
                    component: 'checkbox'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-114", {
                atr: $$ => this.makeApplyAllAttrs($$, '.losspayee.haownInd', 'Hired Auto - Specified As Covered Auto You Own', {
                    component: 'checkbox'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __f_applytoall("field-157", {
                atr: $$ => this.makeApplyAllAttrs($$, '.emplessor', 'Employee as Lessor', {
                    component: 'checkbox'
                }),
                pos: [ {
                    n: "Y"
                }, {}, {} ]
            }), __c_container("field-113", {
                get: $$ => [ $$ ],
                atr: $$ => ({
                    class: `col-3-centred dfe-table tab-cols-4-3-3`
                }),
                pos: [ {
                    n: "Y",
                    w: "3",
                    s: "padding: 0px;"
                } ]
            }, [ __f_applytoall("field-116", {
                atr: $$ => this.makeApplyAllAttrs($$, '.losspayee.namedinsuredInd', 'Additional Named Insured', {
                    component: 'checkbox'
                })
            }), __c_container("field-120", {
                get: $$ => $$('.losspayee.namedinsuredInd') == 'Y' ? [ $$ ] : [],
                atr: $$ => ({
                    class: `col-3-centred dfe-table tab-cols-4-3-3`
                }),
                pos: [ {
                    n: "Y",
                    s: "padding: 0px;",
                    w: "3"
                } ]
            }, [ __f_applytoall("field-121", {
                atr: $$ => this.makeApplyAllAttrs($$, '.losspayee.namedInsured.Name', '<b style="color: red">*</b>Name', {
                    component: 'editbox',
                    cstyle: 'padding-left: 10px;',
                    html: true
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
            this.carDefaults = {
                losspayee: [ {
                    losspayeeInd: "N",
                    ailessorInd: "N",
                    haownInd: "N"
                } ],
                emplessor: "N",
                PhysDmgInd: "N",
                DumpingOpInd: "N",
                hasvin: "Y",
                vinoverride: "N",
                custom: "N",
                UseClassInd1: "N",
                UseClassInd2: "N",
                coverages: [ {
                    pip: [ {
                        IncludeInd: "N"
                    } ],
                    liab: [ {
                        IncludeInd: "Y"
                    } ],
                    towlabor: [ {
                        towlabor: "No Coverage"
                    } ]
                } ]
            };
            this.typeMap = {
                car: {
                    name: "Private Passenger Type",
                    btn: "Passenger Vehicles"
                },
                truck: {
                    name: "Trucks, Tractors and Trailers"
                },
                golf: {
                    name: "Golf Carts and Low Speed Vehicles"
                },
                mobile: {
                    name: "Mobile Homes"
                },
                antique: {
                    name: "Antique Autos"
                }
            };
        }
        makeApplyAllAttrs($$, field, text, opts) {
            return cmn.extend(opts, {
                set: ($$, value, method) => method=='all' ? this.all($$, field, opts.type) : $$.set(field, value),
                get: $$ => ({ value: $$(field).toString() }),
                text: text,
                all: opts.type ? this.typeMap[opts.type].btn || this.typeMap[opts.type].name : 'Vehicles',
                component: 'dropdown'
            })
        }
        vehDetailsDisabled($$) {
            return $$('.hasvin') == 'Y' && ($$('.vinnumber') == 0 || $$('.vinoverride') != 'Y');
        }
        vehDetailsChoice($$, field, pattern, help, label, action, query) {
            let disabled = this.vehDetailsDisabled($$), freetext = disabled || $$('.custom') == 'Y';
            let args = {
                cstyle: 'padding-left: 10px',
                text: `<a href="javascript:showHelp('/cmau_help.html#${help}')" class="css-qmark"></a>${label}`,
                html: true,
                component: freetext ? __c_editbox : __c_dropdown,
                pattern: pattern,
                disabled: disabled,
                style: freetext ? 'width: 150px; text-transform:uppercase;' : 'width: fit-content;'
            };
            return freetext ? fields.simple(field, args) : fields.ajaxChoice(field, {
                query: cmn.extend(query, {
                    method: 'CMAUVehicleScriptHelper',
                    action: action
                })
            }, args);
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