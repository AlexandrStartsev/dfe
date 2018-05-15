define([ "require", "dfe-core", "dfe-common", "dfe-field-helper", "components/div-button", "components/label", "components/button", "components/div", "components/labeled-radiolist", "components/labeled-editbox", "components/labeled-dropdown", "components/labeled-editbox-money", "components/table", "components/tab-s", "components/editbox", "components/dropdown", "components/either", "components/labeled-component", "components/container", "components/inline-rows", "components/labeled-checkbox"], function(require, Core, cmn, fields, DivButton, Label, Button, Div, LabeledRadiolist, LabeledEditbox, LabeledDropdown, LabeledEditboxMoney, Table, TabS, Editbox, Dropdown, Either, Labeled, Container, InlineRows, LabeledCheckbox) {
    let Form = Core.Form;
    
    let carDefaults = {
        losspayee: [ {
            losspayeeInd: "N",
            ailessorInd: "N",
            haownInd: "N"
        } ],
        emplessor: "N",
        PhysDmgInd: "N",
        DumpingOpInd: "N",
        vinoverride: "N",
        hasvin: "Y",
        vinvalid: "N",
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
    
    let typeMap = {
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
    
    class VinNumber extends LabeledEditbox {
        render(data, error, attributes) {
            let structure = super.render(data.vin, error, {...attributes, ref: dom => (dom.focus(), dom.select())});
            data.vinvalid === 'Y' || data.vin && (structure[1][1] = 'vin not found'); // hax(!)
            return structure;
        }
    }
    
    function vehDetailsDisabled($$) {
        return $$('.hasvin') == 'Y' && ($$('.vinnumber') == 0 || $$('.vinoverride') != 'Y');
    }
    
    class VehDetailsChoice extends Form {
        static fields(children, config) {
            return Form.field(Labeled, {
                atr: () => ({
                    style: 'padding-left: 10px', 
                    html: `<a href="javascript:showHelp('/cmau_help.html#${config.helpId}')" class="css-qmark"></a>${config.label}`, 
                    errorwatch: true
                })
            }, Form.field(Either, {
                val: config.validation,
                atr: $$ => ({ 
                    first: vehDetailsDisabled($$) || $$('.custom') == 'Y' 
                })
            }, Form.field(Editbox, { 
                atr: $$ => fields.simple(config.field, {
                    pattern: config.pattern, 
                    disabled: vehDetailsDisabled($$),
                    style: 'width: 150px; text-transform: uppercase;',
                    hideError: true
                })
            }), Form.field(Dropdown, {
                atr: $$ => fields.ajaxChoice(config.field, {
                    query: { 
                        ...config.ajaxOptions($$), 
                        method: 'CMAUVehicleScriptHelper', 
                        action: config.action
                    }
                }, {
                    disabled: vehDetailsDisabled($$) || $$('.custom') == 'Y',
                    hideError: true
                }) 
            })))
        }
    }
    
    class ApplyToAllField extends Form {
        static fields(children, config) {
            return [ ...children, Form.field(Button, { 
                get: () => 'Apply to all ' + (config.type ? typeMap[config.type].btn || typeMap[config.type].name : 'Vehicles'), 
                set: ($$, value) => $$('...location.car').forEach(car => config.type && car.data.vehicletype != config.type || car.set(config.field, $$(config.field))),
                atr: () => ({ class: 'link-button'})
            })]
        }
    }
    
    let QuoteCmauCarForm = class extends Form {
        constructor(node) {
            super(node);
            node.unboundModel.get('policy.cmau.location').forEach(loc => loc.defaultSubset('.car', carDefaults).forEach(car => car.get('.hasvin') == 'Y' && QuoteCmauCarForm.vehProcessVin(car)));
        }            
        static fields() {
            return Form.field(Container, "root", {
                get: $$ => $$('policy.cmau')
            }, [ Form.field(TabS, "locs", 
                            {
                get: $$ => $$('.location'),
                val: $$ => $$.required('.location'),
                atr: () => ({
                    haclass: 'tab-item-active',
                    focusnew: 1,
                    headField: 'loc-hdr',
                    rowclass$header: 'tab-header',
                    rowclass: 'tab-body',
                    rowstyle: 'display: block; width: 900px;'
                })
            }, [ Form.field(DivButton, "loc-hdr", {
                get: $$ => `<a style="color: #444">Location #${$$.index(2) + 1}</a><br/>${$$('.city')} ${$$('.state')} ${$$('.zip')}-${$$('.zipaddon')}`.replace(/-$/, ''),
                atr: $$ => ({
                    class: 'div-button',
                    errorwatch: { target: 'peers', accept: () => 'error' }
                }),
                layout: [ {
                    class: "tab-item"
                } ]
            }), Form.field(Div, "loc-title1", {
                layout: [ {
                    class: "inline-section-header"
                } ]
            }, [ Form.field(Label, "field-159", {
                get: $$ => 'Location #' + ($$.index() + 1)
            }), Form.field(Button, "add-car", {
                get: () => 'Add Vehicle',
                set: $$ => $$.append('.car', carDefaults),
                atr: () => ({
                    style: 'padding: 1px 10px'
                }),
                layout: [ {
                    style: "position: absolute; right: 5px; top: 5px"
                } ]
            }) ]), Form.field(TabS, "cars", {
                get: $$ => $$('.car'),
                val: $$ => $$.required('.car'),
                atr: () => ({
                    haclass: 'tab-item-active',
                    focusnew: 1,
                    headField: 'car-hdr',
                    style: 'width: 100%;',
                    rowclass$header: 'tab-header',
                    rowclass: 'tab-body',
                    rowstyle: 'padding: 0px; overflow: hidden;'
                }),
                layout: [ {
                    style: "width: 100%; "
                } ]
            }, [ Form.field(DivButton, "car-hdr", {
                get: $$ => `${$$('..state')} - Vehicle #${$$.index() + 1}<br/>${$$('.ModelYr')} ${$$('.make')}`,
                atr: $$ => ({
                    class: 'div-button',
                    errorwatch: { target: 'peers', accept: () => 'error' }
                }),
                layout: [ {
                    class: "tab-item"
                } ]
            }),  
                Form.field(Table, "info", {
                atr: function($$) {
                    let skip = $$('.hasvin') != 'Y' || $$('.vinvalid') == 'Y' || $$('.vinnumber') == 0 ? [ 'override' ] : [];
                    vehDetailsDisabled($$) && skip.push('custom');
                    return {
                        singleColumn: true,
                        class: 'dfe-table tab-cols-5-5',
                        skip: skip
                    };
                },
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-154", {
                get: $$ => 'Vehicle #' + ($$.index() + 1),
                layout: [ {
                    colSpan: "2",
                    class: "inline-section-header"
                } ]
            }), Form.field(LabeledRadiolist, "field-9", {
            	set: ($$, value) => { $$.set('.hasvin', value), 'Y' == value && QuoteCmauCarForm.vehProcessVin($$) },
            	get: $$ => $$('.hasvin'),
                atr: () => ({
                    orientation: 'horizontal',
                    text: 'Do you have the VIN?'
                })
            }), Form.field(InlineRows, { get: $$ => $$('.hasvin') == 'Y' ? [$$] : [] },
                Form.field(VinNumber, "vin", {
                    get: $$ => ({ vin: $$('.vinnumber'), vinvalid: $$('.vinvalid') }),
                    set: function($$, value) {
                        $$.set('.vinnumber', value);
                        QuoteCmauCarForm.vehProcessVin($$);
                    },
                    val: $$ => $$('.vinoverride') == 'Y' || $$.required('.vinnumber') && $$.required('.vinnumber', /[a-zA-Z0-9]{17}/, 'Invalid VIN format') && ($$('.vinvalid') == 'Y' || $$.error('Vin not found')),
                    atr: $$ => ({
                        spellcheck: 'false',
                        disabled: $$('.hasvin') != 'Y',
                        style: 'width: 150px; text-transform: uppercase; display: block;',
                        pattern: /[a-zA-Z0-9]{1,17}/,
                        text: 'Vihicle Identification Number (VIN)',
                    })
                })
            ), Form.field(LabeledRadiolist, "override", {
                atr: () => fields.simple('.vinoverride', [], {
                    cstyle: 'padding-left: 10px;',
                    orientation: 'horizontal',
                    text: 'Override VIN?'
                })
            }), Form.field(LabeledRadiolist, "custom", {
                atr: () => fields.simple('.custom', [], {
                    cstyle: 'padding-left: 10px;',
                    orientation: 'horizontal',
                    text: 'Vehicle Year, Make and/or Model is not available in dropdown'
                })
            }), Form.field(LabeledDropdown, "type-choice", {
                atr: $$ => fields.choice('.vehicletype', Object.keys(typeMap).map(k => ({
                    value: k,
                    description: typeMap[k].name
                })), {
                    disabled: vehDetailsDisabled($$),
                    text: 'Vehicle Type',
                    style: 'width: fit-content;'
                })
            }), Form.field(VehDetailsChoice, "year-option", {
                config: {
                    validation: $$ => $$.required('.ModelYr', /(18|19|20)\d{2}/),
                    field: '.ModelYr',
                    pattern: /\d{1,4}/,
                    helpId: 'year',
                    label: 'Vehicle Year',
                    action: 'getYearOptions',
                    ajaxOptions: $$ => ({
                        vehicleType: $$('.vehicletype')
                    })
                }
            }), Form.field(VehDetailsChoice, "make-option", {
                config: {
                    validation: $$ => $$.required('.make', /[-\w ]{1,50}/),
                    field: '.make',
                    helpId: 'make',
                    label: 'Vehicle Make',
                    action: 'getMakeOptions',
                    ajaxOptions: $$ => ({
                        vehicleType: $$('.vehicletype'),
                        vehicleYear: $$('.ModelYr')
                    })
                }
            }), Form.field(VehDetailsChoice, "model-option", {
                config: {
                    validation: $$ => $$.required('.make', /[-\w ]{1,50}/),
                    field: '.modelinfo',
                    helpId: 'model',
                    label: 'Vehicle Model',
                    action: 'getModelOptions',
                    ajaxOptions: $$ => ({
                        vehicleType: $$('.vehicletype'),
                        vehicleYear: $$('.ModelYr'),
                        vehicleMake: $$('.make')
                    })
                }
            }),
            Form.field(LabeledEditboxMoney, "costnew-free", {
                atr: $$ => fields.simple('.vehicleocostnew', {
                    disabled: vehDetailsDisabled($$),
                    style: 'width: 150px;',
                    format: '$9,999,999',
                    text: 'Original Cost New'
                })
            }) ]), Form.field(Table, "private", {
                get: $$ => $$('.vehicletype') == 'car' ? [ $$ ] : [],
                atr: () => ({
                    class: 'dfe-table col-3-centred tab-cols-2-5-3',
                    singleColumn: true
                }),
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-36", {
                get: () => 'Private Passenger Auto',
                layout: [ {
                    colSpan: "3",
                    class: "inline-section-header"
                } ]
            }), Form.field(ApplyToAllField, "field-34", { config: {type: 'car', field: '.VehUseCd'} }, [
                Form.field(LabeledDropdown, {
                    atr: () => fields.choice('.VehUseCd',  [ 'Furnished for Non-Business Use', 'All Other' ], { text: 'Usage' })
                })
            ]), Form.field(InlineRows, "nonbus", { get: $$ => $$('.VehUseCd') == 'Furnished for Non-Business Use' ? [ $$ ] : [] }, [
                    Form.field(ApplyToAllField, "field-38", { config: {type: 'car', field: '.OperExp'} }, [
                        Form.field(LabeledDropdown, {
                            atr: () => fields.choice('.OperExp',  [ 'No operator licensed less than 5 years', 'Licensed less than 5 yrs not owner or principal operator', 'Owner or principal operator licensed less than 5 yrs' ], { text: 'Operator Experience', cstyle: 'padding-left: 10px' })
                        })
                    ]), 
                    Form.field(ApplyToAllField, "field-42", { config: {type: 'car', field: '.OperUse'} }, [
                        Form.field(LabeledDropdown, {
                            atr: () => fields.choice('.OperUse',  [ 'Not driven to work or school', 'To of from work less than 15 miles', 'To or from work 15 or more miles' ], { text: 'Operator Use', cstyle: 'padding-left: 10px' })
                        })
                    ]) ]) ]), 
            Form.field(Table, "truck", {
                get: $$ => $$('.vehicletype') == 'truck' ? [ $$ ] : [],
                atr: $$ => ({
                    class: 'dfe-table col-va-middle col-3-centred tab-cols-3-4-3',
                    singleColumn: true,
                }),
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-49", {
                get: () => 'Trucks, Tractors and Trailers',
                layout: [ {
                    colSpan: "3",
                    class: "inline-section-header"
                } ]
            }),
                Form.field(ApplyToAllField, "field-51", { config: {type: 'truck', field: '.VehicleClass'} }, [
                    Form.field(LabeledDropdown, {
                        atr: () => fields.choice('.VehicleClass',  [ 'Light Truck 10,000 lbs GVW or less', 'Medium Truck 10,001 to 20,000 lbs GVW', 'Heavy Truck 20,001 to 45,000 lbs GVW', 'Extra-Heavy Truck over 45,000 lbs GVW', 'Heavy Truck-Tractor 45,000 lbs GCW or less', 'Extra-Heavy Truck-Tractor over 45,000 lbs GCW', 'Trailer Types' ], { text: 'Vehicle Class' })
                    })
                ]),
                Form.field(InlineRows, "tt-switch", { get: $$ => $$('.VehicleClass') == 'Trailer Types' ? [ $$ ] : [] }, 
                    Form.field(ApplyToAllField, "field-55", { config: {type: 'truck', field: '.TrailerType'} }, 
                        Form.field(LabeledDropdown, {
                            atr: () => fields.choice('.TrailerType',  [ 'Semitrailers', 'Trailers', 'Service or Utility Trailer (0-200 lbs. Load Capacity)' ], { text: 'Trailer Type' })
                        })
                    )
                ),
                Form.field(ApplyToAllField, "field-58", { config: {type: 'truck', field: '.UseClassInd1'} }, 
                    Form.field(LabeledRadiolist, {
                        atr: () => fields.simple('.UseClassInd1', { text: 'Is this auto used for transporting personnel, tools and equipment to and from a job location where it is parked for the majority of the day?' })
                    })
                ),
                Form.field(ApplyToAllField, "field-59", { config: {type: 'truck', field: '.UseClassInd2'} }, 
                    Form.field(LabeledRadiolist, {
                        atr: () => fields.simple('.UseClassInd2', { text: 'Is this auto used for pick-up and/or delivery of property to residential households?' })
                    })
                ),
                Form.field(ApplyToAllField, "field-65", { config: {type: 'truck', field: '.RadiusClass'} }, 
                    Form.field(LabeledDropdown, {
                        atr: () => fields.choice('.RadiusClass',  [ 'Local up to 50 miles', 'Intermediate 51 to 200 miles', 'Long distance over 200 miles' ], { text: 'Radius' })
                    })
                ),
                Form.field(ApplyToAllField, "field-68", { config: {type: 'truck', field: '.DumpingOpInd'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.DumpingOpInd',  [], { text: 'Used in dumping' })
                    })
                ),
                Form.field(ApplyToAllField, "field-71", { config: {type: 'truck', field: '.SecondaryClass'} }, 
                    Form.field(LabeledDropdown, {
                        atr: () => fields.choice('.SecondaryClass',  [ 'Truckers', 'Food Delivery', 'Waste Disposal', 'Farmers', 'Dump & Transit Mix', 'Contractors', 'Not Otherwise Specified' ], { style: 'width: fit-content', text: 'Secondary Class' })
                    })
                ),
                Form.field(ApplyToAllField, "field-74", { config: {type: 'truck', field: '.SecondaryClassType'} }, 
                    Form.field(LabeledDropdown, {
                        atr: $$ => fields.ajaxChoice('.SecondaryClassType', {
                            method: 'CMAUVehicleScriptHelper',
                            action: 'getSecondaryClassTypeOptions',
                            secondaryClass: $$('.SecondaryClass')
                        }, { 
                            style: 'width: fit-content', text: 'Secondary Class Type' 
                        })
                    })
                )
            ]), Form.field(Table, "golf", {
                get: $$ => $$('.vehicletype') == 'golf' ? [ $$ ] : [],
                atr: () => ({
                    class: 'dfe-table col-3-centred tab-cols-4-3-3',
                    singleColumn: true
                }),
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-122", {
                get: () => 'Golf Carts and Low Speed Vehicles',
                layout: [ {
                    colSpan: "3",
                    class: "inline-section-header"
                } ]
            }),
                Form.field(ApplyToAllField, "field-125", { config: {type: 'golf', field: '.GolfType'} }, 
                    Form.field(LabeledDropdown, {
                        atr: () => fields.choice('.GolfType', [ 'Golf Cart', 'Low Speed Vehicles' ], { style: 'width: fit-content', text: 'Type' })
                    })
                ),
                Form.field(ApplyToAllField, "field-128", { config: {type: 'golf', field: '.GolfUse'} }, 
                    Form.field(LabeledDropdown, {
                        atr: () => fields.choice('.GolfUse', [ 'Used On Golf Course', 'Other Commercial Purposes' ], { style: 'width: fit-content', text: 'Use' })
                    })
                ),
                Form.field(ApplyToAllField, "field-131", { config: {type: 'golf', field: '.GolfVhsub'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.GolfVhsub',  [], { text: 'Vehicle subject to compulsory, financial or other law' })
                    })
                ) ]), 
            Form.field(Table, "mobile", {
                get: $$ => $$('.vehicletype') == 'mobile' ? [ $$ ] : [],
                atr: $$ => ({
                    class: 'dfe-table col-3-centred tab-cols-2-5-3',
                    singleColumn: true
                }),
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-123", {
                get: () => 'Mobile Homes',
                layout: [ {
                    colSpan: "3",
                    class: "inline-section-header"
                } ]
            }),
                Form.field(ApplyToAllField, "field-134", { config: {type: 'mobile', field: '.MobileHomeType'} }, 
                    Form.field(LabeledDropdown, {
                        atr: () => fields.choice('.MobileHomeType', [ 'Trailer Equipped As Living Quarters', 'Pickup Trucks Used Solely To Transport Camper Bodies', 'Motor Homes Self-Propelled Equipped As Living Quarters' ], { style: 'width: fit-content', text: 'Type' })
                    })
                ),
                Form.field(InlineRows, "size-switch", { get: $$ => $$('.MobileHomeType') == 'Motor Homes Self-Propelled Equipped As Living Quarters' ? [ $$ ] : [] }, 
                    Form.field(ApplyToAllField, "field-138", { config: {type: 'mobile', field: '.MotorHomeSize'} }, 
                        Form.field(LabeledDropdown, {
                            atr: () => fields.choice('.MotorHomeSize', [ 'Up To 22 feet', 'More Than 22 feet' ], { style: 'width: fit-content', text: 'Length' })
                        })
                    )
                ) ]), 
            Form.field(Table, "covs", {
                atr: $$ => ({
                    class: 'dfe-table col-3-centred tab-cols-4-3-3',
                    singleColumn: true
                }),
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-77", {
                get: () => 'Coverages',
                layout: [ {
                    colSpan: "3",
                    class: "inline-section-header"
                } ]
            }),
                Form.field(ApplyToAllField, "field-81", { config: { field: '.PhysDmgInd'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.PhysDmgInd',  [], { text: 'Physical Damage Only?' })
                    })
                ),
                Form.field(ApplyToAllField, "field-82", { config: { field: '.coverages.otc.ded'} }, 
                    Form.field(LabeledDropdown, {
                        atr: $$ => fields.ajaxChoice('.coverages.otc.ded', {
                            query: {
                                method: 'CMAUVehicleScriptHelper',
                                action: 'getCompDedOptions',
                                vehicleType: $$('.vehicletype')
                            },
                            mapper: o => ({ value: o.value, description: o.text })
                        }, { text: 'Comp. Ded' })
                    })
                ),
                Form.field(ApplyToAllField, "field-85", { config: { field: '.coverages.col.ded'} }, 
                    Form.field(LabeledDropdown, {
                        atr: $$ => fields.ajaxChoice('.coverages.col.ded', {
                            query: {
                                method: 'CMAUVehicleScriptHelper',
                                action: 'getCollDedOptions',
                                vehicleType: $$('.vehicletype')
                            },
                            mapper: o => ({ value: o.value, description: o.text })
                        }, { text: 'Coll. Ded' })
                    })
                ),
                Form.field(InlineRows, "val-switch", { get: $$ => ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/) ? [ $$ ] : [] }, 
                    Form.field(ApplyToAllField, "field-88", { config: { field: '.ValuationMethod'} }, 
                        Form.field(LabeledDropdown, {
                            atr: $$ => fields.ajaxChoice('.ValuationMethod', {
                                method: 'CMAUVehicleScriptHelper',
                                action: 'getValuationMethodOptions',
                                vehicleType: $$('.vehicletype')
                            }, { text: 'Valuation' })
                        })
                    )
                ),
                Form.field(InlineRows, "amt-switch", { get: $$ => ($$('.coverages.col.ded') + $$('.coverages.otc.ded')).toString().match(/\d|Full/) && $$('.ValuationMethod') == 'Stated Amount' ? [ $$ ] : [] }, 
                    Form.field(ApplyToAllField, "field-92", { config: { field: '.StatedAmt'} }, 
                        Form.field(LabeledEditboxMoney, {
                            atr: () => fields.simple('.StatedAmt', { format: '$9,999,999', text: 'Stated Amount', cstyle: 'padding-left: 10px;', style: 'width: 100px' })
                        })
                    )
                ),
                Form.field(InlineRows, "pdonly-switch", { get: $$ => $$('.PhysDmgInd') == 'Y' || $$('..state') != 'KS' ? [] : [ $$ ] }, 
                    Form.field(ApplyToAllField, "field-96", { config: { field: '.coverages.pip.IncludeInd'} }, 
                        Form.field(LabeledCheckbox, {
                            atr: () => fields.simple('.coverages.pip.IncludeInd',  [], { text: 'Personal Injury Protection Coverage' })
                        })
                    ),
                    Form.field(InlineRows, "pip-switch", { get: $$ => $$('.coverages.pip.IncludeInd') == 'Y' ? [ $$ ] : [] }, 
                        Form.field(ApplyToAllField, "field-100", { config: { field: '.coverages.pip.addedpipoption' } }, 
                            Form.field(LabeledDropdown, {
                                atr: () => fields.choice('.coverages.pip.addedpipoption', [ 'Option 1', 'Option 2' ], { cstyle: 'padding-left: 10px', style: 'width: fit-content', text: 'Additional Personal Injury Protection' })
                            })
                        ),
                        Form.field(ApplyToAllField, "field-103", { config: { field: '.coverages.pip.broadpipnum' } }, 
                            Form.field(LabeledEditbox, {
                                atr: () => fields.simple('.coverages.pip.broadpipnum', { pattern: '[0-9]{1,5}', cstyle: 'padding-left: 10px', style: 'width: 80px', text: 'Number of Individuals for Broadened PIP' })
                            })
                        ),
                        Form.field(InlineRows, "added-pip", { get: $$ => +$$('.coverages.pip.broadpipnum') > 0 ? [ $$ ] : [] }, 
                            Form.field(ApplyToAllField, "field-145", { config: { field: '.coverages.pip.addedbroadpipnum' } }, 
                                Form.field(LabeledEditbox, {
                                    atr: () => fields.simple('.coverages.pip.addedbroadpipnum', { pattern: '[0-9]{1,5}', cstyle: 'padding-left: 10px', style: 'width: 80px', text: 'Number of Named Individuals for Additional Broadened PIP' })
                                })
                            ), 
                            Form.field(InlineRows, "added-pip-s", { get: $$ => +$$('.coverages.pip.addedbroadpipnum') ? [ $$ ] : [] }, 
                                Form.field(ApplyToAllField, "field-149", { config: { field: '.coverages.pip.addedbpipoptioncd' } }, 
                                    Form.field(LabeledDropdown, {
                                        atr: () => fields.choice('.coverages.pip.addedbpipoptioncd', [ 'Option 1', 'Option 2' ], { cstyle: 'padding-left: 10px', style: 'width: fit-content', text: 'Additional Broadened Personal Injury Protection' })
                                    })
                                )
                            )
                        )
                    )
                )
            ]), Form.field(Table, "opt-covs", {
                atr: $$ => ({
                    class: `dfe-table col-3-centred tab-cols-4-3-3`,
                    skip: $$('..state') == 'KS' ? [ 'field-111', 'field-114' ] : [ 'field-113' ],
                    singleColumn: true
                }),
                layout: [ {
                    class: "dfe-inline-section"
                } ]
            }, [ Form.field(Label, "field-106", {
                get: () => 'Optional Coverages',
                layout: [ {
                    colSpan: "3",
                    class: "inline-section-header"
                } ]
            }), Form.field(InlineRows, "towing-switch", { get: $$ => $$('.vehicletype') == 'car' && $$('.coverages.otc.ded').toString().match(/\d|Full/) ? [ $$ ] : [] }, 
                    Form.field(ApplyToAllField, "field-118", { config: { field: '.coverages.towlabor.towlabor' } }, 
                        Form.field(LabeledDropdown, {
                            atr: () => fields.choice('.coverages.towlabor.towlabor', fields.choiceItems({
                                'No Coverage': 'No Coverage',
                                $50: '50',
                                $100: '100',
                                $200: '200'
                            }), { style: 'width: fit-content', text: 'Towing and Labor' })
                        })
                    )
                ),
                Form.field(ApplyToAllField, "field-108", { config: { field: '.losspayee.losspayeeInd'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.losspayee.losspayeeInd',  [], { text: 'Loss Payee' })
                    })
                ),
                Form.field(ApplyToAllField, "field-111", { config: { field: '.losspayee.ailessorInd'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.losspayee.ailessorInd',  [], { text: 'Additional Insured - Lessor' })
                    })
                ),
                Form.field(ApplyToAllField, "field-114", { config: { field: '.losspayee.haownInd'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.losspayee.haownInd',  [], { text: 'Hired Auto - Specified As Covered Auto You Own' })
                    })
                ),
                Form.field(ApplyToAllField, "field-157", { config: { field: '.emplessor'} }, 
                    Form.field(LabeledCheckbox, {
                        atr: () => fields.simple('.emplessor',  [], { text: 'Employee as Lessor' })
                    })
                ),
                Form.field(InlineRows, "field-113", 
                    Form.field(ApplyToAllField, "field-116", { config: { field: '.losspayee.namedinsuredInd'} }, 
                        Form.field(LabeledCheckbox, {
                            atr: () => fields.simple('.losspayee.namedinsuredInd',  [], { text: 'Additional Named Insured' })
                        })
                    ),
                    Form.field(InlineRows, "field-120", { get: $$ => $$('.losspayee.namedinsuredInd') == 'Y' ? [ $$ ] : [] },
                        Form.field(ApplyToAllField, "field-121", { config: { field: '.losspayee.namedInsured.Name'} }, 
                            Form.field(LabeledEditbox, {
                                atr: () => fields.simple('.losspayee.namedInsured.Name',  [], { cstyle: 'padding-left: 10px;', html: '<b style="color: red">*</b>Name' })
                            })
                        )
                    )
                )
           ]), Form.field(Div, "car-ctrl", {
                atr: $$ => ({
                    skip: $$('..car').length > 1 ? [] : [ 'remove-car' ],
                    style: 'padding: 5px; text-align: right; background: lightgray;'
                }),
                layout: [ {
                    style: "padding: 2px 0px"
                } ]
            }, [ Form.field(Button, "clone-car", {
                get: () => 'Clone Vehicle',
                set: $$ => $$.clone(),
                atr: () => ({
                    style: 'padding: 1px 10px; margin: 0px 5px'
                }),
                layout: [ {
                    style: "display: inline-block"
                } ]
            }), Form.field(Button, "remove-car", {
                get: () => 'Remove Vehicle',
                set: $$ => $$.detach(),
                atr: () => ({
                    style: 'padding: 1px 10px; margin: 0px 5px'
                }),
                layout: [ {
                    style: "display: inline-block"
                } ]
            }) ])  ]) ]) ]);
        }
        static vehProcessVin($$) {
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
    }
    if (typeof window !== 'undefined') {
        window.showHelp = function(url) {
            window.open(url, 'DetailWin', 'scrollbars=yes,resizable=yes,toolbar=no,height=250,width=250').focus();
        };
    }
    return QuoteCmauCarForm;
})