"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(["require", "dfe-core", "dfe-common", "dfe-field-helper", "components/div-button", "components/label", "components/button", "components/div", "components/labeled-radiolist", "components/labeled-editbox", "components/labeled-dropdown", "components/labeled-editbox-money", "components/table", "components/tab-s", "components/editbox", "components/dropdown", "components/either", "components/labeled-component", "components/container", "components/inline-rows", "components/labeled-checkbox"], function (require, Core, cmn, _fields, DivButton, Label, Button, Div, LabeledRadiolist, LabeledEditbox, LabeledDropdown, LabeledEditboxMoney, Table, TabS, Editbox, Dropdown, Either, LabeledComponent, Container, InlineRows, LabeledCheckbox) {
    var Form = Core.Form;

    var carDefaults = {
        losspayee: [{
            losspayeeInd: "N",
            ailessorInd: "N",
            haownInd: "N"
        }],
        emplessor: "N",
        PhysDmgInd: "N",
        DumpingOpInd: "N",
        vinoverride: "N",
        hasvin: "Y",
        vinvalid: "N",
        custom: "N",
        UseClassInd1: "N",
        UseClassInd2: "N",
        coverages: [{
            pip: [{
                IncludeInd: "N"
            }],
            liab: [{
                IncludeInd: "Y"
            }],
            towlabor: [{
                towlabor: "No Coverage"
            }]
        }]
    };

    var typeMap = {
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

    var VinNumber = function (_LabeledEditbox) {
        _inherits(VinNumber, _LabeledEditbox);

        function VinNumber() {
            _classCallCheck(this, VinNumber);

            return _possibleConstructorReturn(this, (VinNumber.__proto__ || Object.getPrototypeOf(VinNumber)).apply(this, arguments));
        }

        _createClass(VinNumber, [{
            key: "render",
            value: function render(data, error, attributes) {
                var structure = _get(VinNumber.prototype.__proto__ || Object.getPrototypeOf(VinNumber.prototype), "render", this).call(this, data.vin, error, _extends({}, attributes, { ref: function ref(dom) {
                        return dom.focus(), dom.select();
                    } }));
                data.vinvalid === 'Y' || data.vin && (structure[1][1] = 'vin not found'); // hax(!)
                return structure;
            }
        }]);

        return VinNumber;
    }(LabeledEditbox);

    function vehDetailsDisabled($$) {
        return $$.get('.hasvin') == 'Y' && ($$.get('.vinnumber') == 0 || $$.get('.vinoverride') != 'Y');
    }

    var VehDetailsChoice = function (_Form) {
        _inherits(VehDetailsChoice, _Form);

        function VehDetailsChoice() {
            _classCallCheck(this, VehDetailsChoice);

            return _possibleConstructorReturn(this, (VehDetailsChoice.__proto__ || Object.getPrototypeOf(VehDetailsChoice)).apply(this, arguments));
        }

        _createClass(VehDetailsChoice, null, [{
            key: "fields",
            value: function fields(children, config) {
                return Form.field(LabeledComponent, {
                    atr: function atr() {
                        return {
                            style: 'padding-left: 10px',
                            html: "<a href=\"javascript:showHelp('/cmau_help.html#" + config.helpId + "')\" class=\"css-qmark\"></a>" + config.label,
                            errorwatch: true
                        };
                    }
                }, Form.field(Either, {
                    val: config.validation,
                    atr: function atr($$) {
                        return {
                            first: vehDetailsDisabled($$) || $$.get('.custom') == 'Y'
                        };
                    }
                }, Form.field(Editbox, {
                    atr: function atr($$) {
                        return _fields.simple(config.field, {
                            pattern: config.pattern,
                            disabled: vehDetailsDisabled($$),
                            style: 'width: 150px; text-transform: uppercase;',
                            hideError: true
                        });
                    }
                }), Form.field(Dropdown, {
                    atr: function atr($$) {
                        return _fields.ajaxChoice(config.field, {
                            query: _extends({}, config.ajaxOptions($$), {
                                method: 'CMAUVehicleScriptHelper',
                                action: config.action
                            })
                        }, {
                            disabled: vehDetailsDisabled($$) || $$.get('.custom') == 'Y',
                            hideError: true
                        });
                    }
                })));
            }
        }]);

        return VehDetailsChoice;
    }(Form);

    var ApplyToAllField = function (_Form2) {
        _inherits(ApplyToAllField, _Form2);

        function ApplyToAllField() {
            _classCallCheck(this, ApplyToAllField);

            return _possibleConstructorReturn(this, (ApplyToAllField.__proto__ || Object.getPrototypeOf(ApplyToAllField)).apply(this, arguments));
        }

        _createClass(ApplyToAllField, null, [{
            key: "fields",
            value: function fields(children, config) {
                return [].concat(_toConsumableArray(children), [Form.field(Button, {
                    get: function get() {
                        return 'Apply to all ' + (config.type ? typeMap[config.type].btn || typeMap[config.type].name : 'Vehicles');
                    },
                    set: function set($$, value) {
                        return $$.get('...location.car').forEach(function (car) {
                            return config.type && car.data.vehicletype != config.type || car.set(config.field, $$.get(config.field));
                        });
                    },
                    atr: function atr() {
                        return { class: 'link-button' };
                    }
                })]);
            }
        }]);

        return ApplyToAllField;
    }(Form);

    var QuoteCmauCarForm = function (_Form3) {
        _inherits(QuoteCmauCarForm, _Form3);

        function QuoteCmauCarForm(node) {
            _classCallCheck(this, QuoteCmauCarForm);

            var _this4 = _possibleConstructorReturn(this, (QuoteCmauCarForm.__proto__ || Object.getPrototypeOf(QuoteCmauCarForm)).call(this, node));

            node.unboundModel.get('policy.cmau.location').forEach(function (loc) {
                return loc.defaultSubset('.car', carDefaults).forEach(function (car) {
                    return car.get('.hasvin') == 'Y' && QuoteCmauCarForm.vehProcessVin(car);
                });
            });
            return _this4;
        }

        _createClass(QuoteCmauCarForm, null, [{
            key: "fields",
            value: function fields() {
                return Form.field(TabS, "locs", {
                    atr: function atr() {
                        return _fields.simple('policy.cmau.location', {
                            haclass: 'tab-item-active',
                            focusnew: true,
                            rowclass$header: 'tab-header',
                            style: 'width: 900px;'
                        });
                    }
                }, [Form.field(DivButton, "header", {
                    get: function get($$) {
                        return ("<a style=\"color: #444\">Location #" + ($$.index(2) + 1) + "</a><br/>" + $$.get('.city') + " " + $$.get('.state') + " " + $$.get('.zip') + "-" + $$.get('.zipaddon')).replace(/-$/, '');
                    },
                    atr: function atr($$) {
                        return {
                            class: 'div-button',
                            errorwatch: { target: 'peers', accept: function accept() {
                                    return 'error';
                                } }
                        };
                    },
                    layout: [{
                        class: "tab-item"
                    }]
                }), Form.field(Div, "loc-title1", {
                    layout: [{
                        class: "inline-section-header"
                    }]
                }, [Form.field(Label, "field-159", {
                    get: function get($$) {
                        return 'Location #' + ($$.index() + 1);
                    }
                }), Form.field(Button, "add-car", {
                    get: function get() {
                        return 'Add Vehicle';
                    },
                    set: function set($$) {
                        return $$.append('.car', carDefaults);
                    },
                    atr: function atr() {
                        return {
                            style: 'padding: 1px 10px'
                        };
                    },
                    layout: [{
                        style: "position: absolute; right: 5px; top: 5px"
                    }]
                })]), Form.field(TabS, "cars", {
                    atr: function atr() {
                        return _fields.simple('.car', {
                            haclass: 'tab-item-active',
                            focusnew: true,
                            rowclass$header: 'tab-header'
                        });
                    }
                }, [Form.field(DivButton, "header", {
                    get: function get($$) {
                        return $$.get('..state') + " - Vehicle #" + ($$.index() + 1) + "<br/>" + $$.get('.ModelYr') + " " + $$.get('.make');
                    },
                    atr: function atr($$) {
                        return {
                            class: 'div-button',
                            errorwatch: { target: 'peers', accept: function accept() {
                                    return 'error';
                                } }
                        };
                    },
                    layout: [{
                        class: "tab-item"
                    }]
                }), Form.field(Table, "info", {
                    atr: function atr($$) {
                        var skip = $$.get('.hasvin') != 'Y' || $$.get('.vinvalid') == 'Y' || $$.get('.vinnumber') == 0 ? ['override'] : [];
                        vehDetailsDisabled($$) && skip.push('custom');
                        return {
                            singleColumn: true,
                            class: 'dfe-table tab-cols-5-5',
                            skip: skip
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-154", {
                    get: function get($$) {
                        return 'Vehicle #' + ($$.index() + 1);
                    },
                    layout: [{
                        colSpan: "2",
                        class: "inline-section-header"
                    }]
                }), Form.field(LabeledRadiolist, "field-9", {
                    set: function set($$, value) {
                        $$.set('.hasvin', value), 'Y' == value && QuoteCmauCarForm.vehProcessVin($$);
                    },
                    get: function get($$) {
                        return $$.get('.hasvin');
                    },
                    atr: function atr() {
                        return {
                            orientation: 'horizontal',
                            text: 'Do you have the VIN?'
                        };
                    }
                }), Form.field(InlineRows, { get: function get($$) {
                        return $$.get('.hasvin') == 'Y' ? [$$] : [];
                    } }, Form.field(VinNumber, "vin", {
                    get: function get($$) {
                        return { vin: $$.get('.vinnumber'), vinvalid: $$.get('.vinvalid') };
                    },
                    set: function set($$, value) {
                        $$.set('.vinnumber', value);
                        QuoteCmauCarForm.vehProcessVin($$);
                    },
                    val: function val($$) {
                        return $$.get('.vinoverride') == 'Y' || $$.required('.vinnumber') && $$.required('.vinnumber', /[a-zA-Z0-9]{17}/, 'Invalid VIN format') && ($$.get('.vinvalid') == 'Y' || $$.error('Vin not found'));
                    },
                    atr: function atr($$) {
                        return {
                            spellcheck: 'false',
                            disabled: $$.get('.hasvin') != 'Y',
                            style: 'width: 150px; text-transform: uppercase; display: block;',
                            pattern: /[a-zA-Z0-9]{1,17}/,
                            text: 'Vihicle Identification Number (VIN)'
                        };
                    }
                })), Form.field(LabeledRadiolist, "override", {
                    atr: function atr() {
                        return _fields.simple('.vinoverride', [], {
                            orientation: 'horizontal',
                            text: 'Override VIN?'
                        });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                }), Form.field(LabeledRadiolist, "custom", {
                    atr: function atr() {
                        return _fields.simple('.custom', [], {
                            orientation: 'horizontal',
                            text: 'Vehicle Year, Make and/or Model is not available in dropdown'
                        });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                }), Form.field(LabeledDropdown, "type-choice", {
                    atr: function atr($$) {
                        return _fields.choice('.vehicletype', Object.keys(typeMap).map(function (k) {
                            return {
                                value: k,
                                description: typeMap[k].name
                            };
                        }), {
                            disabled: vehDetailsDisabled($$),
                            text: 'Vehicle Type',
                            style: 'width: fit-content;'
                        });
                    }
                }), Form.field(VehDetailsChoice, "year-option", {
                    config: {
                        validation: function validation($$) {
                            return $$.required('.ModelYr', /(18|19|20)\d{2}/);
                        },
                        field: '.ModelYr',
                        pattern: /\d{1,4}/,
                        helpId: 'year',
                        label: 'Vehicle Year',
                        action: 'getYearOptions',
                        ajaxOptions: function ajaxOptions($$) {
                            return {
                                vehicleType: $$.get('.vehicletype')
                            };
                        }
                    }
                }), Form.field(VehDetailsChoice, "make-option", {
                    config: {
                        validation: function validation($$) {
                            return $$.required('.make', /[-\w ]{1,50}/);
                        },
                        field: '.make',
                        helpId: 'make',
                        label: 'Vehicle Make',
                        action: 'getMakeOptions',
                        ajaxOptions: function ajaxOptions($$) {
                            return {
                                vehicleType: $$.get('.vehicletype'),
                                vehicleYear: $$.get('.ModelYr')
                            };
                        }
                    }
                }), Form.field(VehDetailsChoice, "model-option", {
                    config: {
                        validation: function validation($$) {
                            return $$.required('.make', /[-\w ]{1,50}/);
                        },
                        field: '.modelinfo',
                        helpId: 'model',
                        label: 'Vehicle Model',
                        action: 'getModelOptions',
                        ajaxOptions: function ajaxOptions($$) {
                            return {
                                vehicleType: $$.get('.vehicletype'),
                                vehicleYear: $$.get('.ModelYr'),
                                vehicleMake: $$.get('.make')
                            };
                        }
                    }
                }), Form.field(LabeledEditboxMoney, "costnew-free", {
                    atr: function atr($$) {
                        return _fields.simple('.vehicleocostnew', {
                            disabled: vehDetailsDisabled($$),
                            style: 'width: 150px;',
                            format: '$9,999,999',
                            text: 'Original Cost New'
                        });
                    }
                })]), Form.field(Table, "private", {
                    get: function get($$) {
                        return $$.get('.vehicletype') == 'car' ? [$$] : [];
                    },
                    atr: function atr() {
                        return {
                            class: 'dfe-table col-3-centred tab-cols-2-5-3',
                            singleColumn: true
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-36", {
                    get: function get() {
                        return 'Private Passenger Auto';
                    },
                    layout: [{
                        colSpan: "3",
                        class: "inline-section-header"
                    }]
                }), Form.field(ApplyToAllField, "field-34", { config: { type: 'car', field: '.VehUseCd' } }, [Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.VehUseCd', ['Furnished for Non-Business Use', 'All Other'], { text: 'Usage' });
                    }
                })]), Form.field(InlineRows, "nonbus", { get: function get($$) {
                        return $$.get('.VehUseCd') == 'Furnished for Non-Business Use' ? [$$] : [];
                    } }, [Form.field(ApplyToAllField, "field-38", { config: { type: 'car', field: '.OperExp' } }, [Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.OperExp', ['No operator licensed less than 5 years', 'Licensed less than 5 yrs not owner or principal operator', 'Owner or principal operator licensed less than 5 yrs'], { text: 'Operator Experience' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                })]), Form.field(ApplyToAllField, "field-42", { config: { type: 'car', field: '.OperUse' } }, [Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.OperUse', ['Not driven to work or school', 'To of from work less than 15 miles', 'To or from work 15 or more miles'], { text: 'Operator Use' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                })])])]), Form.field(Table, "truck", {
                    get: function get($$) {
                        return $$.get('.vehicletype') == 'truck' ? [$$] : [];
                    },
                    atr: function atr($$) {
                        return {
                            class: 'dfe-table col-va-middle col-3-centred tab-cols-3-4-3',
                            singleColumn: true
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-49", {
                    get: function get() {
                        return 'Trucks, Tractors and Trailers';
                    },
                    layout: [{
                        colSpan: "3",
                        class: "inline-section-header"
                    }]
                }), Form.field(ApplyToAllField, "field-51", { config: { type: 'truck', field: '.VehicleClass' } }, [Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.VehicleClass', ['Light Truck 10,000 lbs GVW or less', 'Medium Truck 10,001 to 20,000 lbs GVW', 'Heavy Truck 20,001 to 45,000 lbs GVW', 'Extra-Heavy Truck over 45,000 lbs GVW', 'Heavy Truck-Tractor 45,000 lbs GCW or less', 'Extra-Heavy Truck-Tractor over 45,000 lbs GCW', 'Trailer Types'], { text: 'Vehicle Class' });
                    }
                })]), Form.field(InlineRows, "tt-switch", { get: function get($$) {
                        return $$.get('.VehicleClass') == 'Trailer Types' ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-55", { config: { type: 'truck', field: '.TrailerType' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.TrailerType', ['Semitrailers', 'Trailers', 'Service or Utility Trailer (0-200 lbs. Load Capacity)'], { text: 'Trailer Type' });
                    }
                }))), Form.field(ApplyToAllField, "field-58", { config: { type: 'truck', field: '.UseClassInd1' } }, Form.field(LabeledRadiolist, {
                    atr: function atr() {
                        return _fields.simple('.UseClassInd1', { text: 'Is this auto used for transporting personnel, tools and equipment to and from a job location where it is parked for the majority of the day?' });
                    }
                })), Form.field(ApplyToAllField, "field-59", { config: { type: 'truck', field: '.UseClassInd2' } }, Form.field(LabeledRadiolist, {
                    atr: function atr() {
                        return _fields.simple('.UseClassInd2', { text: 'Is this auto used for pick-up and/or delivery of property to residential households?' });
                    }
                })), Form.field(ApplyToAllField, "field-65", { config: { type: 'truck', field: '.RadiusClass' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.RadiusClass', ['Local up to 50 miles', 'Intermediate 51 to 200 miles', 'Long distance over 200 miles'], { text: 'Radius' });
                    }
                })), Form.field(ApplyToAllField, "field-68", { config: { type: 'truck', field: '.DumpingOpInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.DumpingOpInd', [], { text: 'Used in dumping' });
                    }
                })), Form.field(ApplyToAllField, "field-71", { config: { type: 'truck', field: '.SecondaryClass' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.SecondaryClass', ['Truckers', 'Food Delivery', 'Waste Disposal', 'Farmers', 'Dump & Transit Mix', 'Contractors', 'Not Otherwise Specified'], { style: 'width: fit-content', text: 'Secondary Class' });
                    }
                })), Form.field(ApplyToAllField, "field-74", { config: { type: 'truck', field: '.SecondaryClassType' } }, Form.field(LabeledDropdown, {
                    atr: function atr($$) {
                        return _fields.ajaxChoice('.SecondaryClassType', {
                            method: 'CMAUVehicleScriptHelper',
                            action: 'getSecondaryClassTypeOptions',
                            secondaryClass: $$.get('.SecondaryClass')
                        }, {
                            style: 'width: fit-content', text: 'Secondary Class Type'
                        });
                    }
                }))]), Form.field(Table, "golf", {
                    get: function get($$) {
                        return $$.get('.vehicletype') == 'golf' ? [$$] : [];
                    },
                    atr: function atr() {
                        return {
                            class: 'dfe-table col-3-centred tab-cols-4-3-3',
                            singleColumn: true
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-122", {
                    get: function get() {
                        return 'Golf Carts and Low Speed Vehicles';
                    },
                    layout: [{
                        colSpan: "3",
                        class: "inline-section-header"
                    }]
                }), Form.field(ApplyToAllField, "field-125", { config: { type: 'golf', field: '.GolfType' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.GolfType', ['Golf Cart', 'Low Speed Vehicles'], { style: 'width: fit-content', text: 'Type' });
                    }
                })), Form.field(ApplyToAllField, "field-128", { config: { type: 'golf', field: '.GolfUse' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.GolfUse', ['Used On Golf Course', 'Other Commercial Purposes'], { style: 'width: fit-content', text: 'Use' });
                    }
                })), Form.field(ApplyToAllField, "field-131", { config: { type: 'golf', field: '.GolfVhsub' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.GolfVhsub', [], { text: 'Vehicle subject to compulsory, financial or other law' });
                    }
                }))]), Form.field(Table, "mobile", {
                    get: function get($$) {
                        return $$.get('.vehicletype') == 'mobile' ? [$$] : [];
                    },
                    atr: function atr($$) {
                        return {
                            class: 'dfe-table col-3-centred tab-cols-2-5-3',
                            singleColumn: true
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-123", {
                    get: function get() {
                        return 'Mobile Homes';
                    },
                    layout: [{
                        colSpan: "3",
                        class: "inline-section-header"
                    }]
                }), Form.field(ApplyToAllField, "field-134", { config: { type: 'mobile', field: '.MobileHomeType' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.MobileHomeType', ['Trailer Equipped As Living Quarters', 'Pickup Trucks Used Solely To Transport Camper Bodies', 'Motor Homes Self-Propelled Equipped As Living Quarters'], { style: 'width: fit-content', text: 'Type' });
                    }
                })), Form.field(InlineRows, "size-switch", { get: function get($$) {
                        return $$.get('.MobileHomeType') == 'Motor Homes Self-Propelled Equipped As Living Quarters' ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-138", { config: { type: 'mobile', field: '.MotorHomeSize' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.MotorHomeSize', ['Up To 22 feet', 'More Than 22 feet'], { style: 'width: fit-content', text: 'Length' });
                    }
                })))]), Form.field(Table, "covs", {
                    atr: function atr($$) {
                        return {
                            class: 'dfe-table col-3-centred tab-cols-4-3-3',
                            singleColumn: true
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-77", {
                    get: function get() {
                        return 'Coverages';
                    },
                    layout: [{
                        colSpan: "3",
                        class: "inline-section-header"
                    }]
                }), Form.field(ApplyToAllField, "field-81", { config: { field: '.PhysDmgInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.PhysDmgInd', [], { text: 'Physical Damage Only?' });
                    }
                })), Form.field(ApplyToAllField, "field-82", { config: { field: '.coverages.otc.ded' } }, Form.field(LabeledDropdown, {
                    atr: function atr($$) {
                        return _fields.ajaxChoice('.coverages.otc.ded', {
                            query: {
                                method: 'CMAUVehicleScriptHelper',
                                action: 'getCompDedOptions',
                                vehicleType: $$.get('.vehicletype')
                            },
                            mapper: function mapper(o) {
                                return { value: o.value, description: o.text };
                            }
                        }, { text: 'Comp. Ded' });
                    }
                })), Form.field(ApplyToAllField, "field-85", { config: { field: '.coverages.col.ded' } }, Form.field(LabeledDropdown, {
                    atr: function atr($$) {
                        return _fields.ajaxChoice('.coverages.col.ded', {
                            query: {
                                method: 'CMAUVehicleScriptHelper',
                                action: 'getCollDedOptions',
                                vehicleType: $$.get('.vehicletype')
                            },
                            mapper: function mapper(o) {
                                return { value: o.value, description: o.text };
                            }
                        }, { text: 'Coll. Ded' });
                    }
                })), Form.field(InlineRows, "val-switch", { get: function get($$) {
                        return ($$.get('.coverages.col.ded') + $$.get('.coverages.otc.ded')).toString().match(/\d|Full/) ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-88", { config: { field: '.ValuationMethod' } }, Form.field(LabeledDropdown, {
                    atr: function atr($$) {
                        return _fields.ajaxChoice('.ValuationMethod', {
                            method: 'CMAUVehicleScriptHelper',
                            action: 'getValuationMethodOptions',
                            vehicleType: $$.get('.vehicletype')
                        }, { text: 'Valuation' });
                    }
                }))), Form.field(InlineRows, "amt-switch", { get: function get($$) {
                        return ($$.get('.coverages.col.ded') + $$.get('.coverages.otc.ded')).toString().match(/\d|Full/) && $$.get('.ValuationMethod') == 'Stated Amount' ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-92", { config: { field: '.StatedAmt' } }, Form.field(LabeledEditboxMoney, {
                    atr: function atr() {
                        return _fields.simple('.StatedAmt', { format: '$9,999,999', text: 'Stated Amount', style: 'width: 100px' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                }))), Form.field(InlineRows, "pdonly-switch", { get: function get($$) {
                        return $$.get('.PhysDmgInd') == 'Y' || $$.get('..state') != 'KS' ? [] : [$$];
                    } }, Form.field(ApplyToAllField, "field-96", { config: { field: '.coverages.pip.IncludeInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.coverages.pip.IncludeInd', [], { text: 'Personal Injury Protection Coverage' });
                    }
                })), Form.field(InlineRows, "pip-switch", { get: function get($$) {
                        return $$.get('.coverages.pip.IncludeInd') == 'Y' ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-100", { config: { field: '.coverages.pip.addedpipoption' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.coverages.pip.addedpipoption', ['Option 1', 'Option 2'], { style: 'width: fit-content', text: 'Additional Personal Injury Protection' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                })), Form.field(ApplyToAllField, "field-103", { config: { field: '.coverages.pip.broadpipnum' } }, Form.field(LabeledEditbox, {
                    atr: function atr() {
                        return _fields.simple('.coverages.pip.broadpipnum', { pattern: '[0-9]{1,5}', style: 'width: 80px', text: 'Number of Individuals for Broadened PIP' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                })), Form.field(InlineRows, "added-pip", { get: function get($$) {
                        return +$$.get('.coverages.pip.broadpipnum') > 0 ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-145", { config: { field: '.coverages.pip.addedbroadpipnum' } }, Form.field(LabeledEditbox, {
                    atr: function atr() {
                        return _fields.simple('.coverages.pip.addedbroadpipnum', { pattern: '[0-9]{1,5}', style: 'width: 80px', text: 'Number of Named Individuals for Additional Broadened PIP' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                })), Form.field(InlineRows, "added-pip-s", { get: function get($$) {
                        return +$$.get('.coverages.pip.addedbroadpipnum') ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-149", { config: { field: '.coverages.pip.addedbpipoptioncd' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.coverages.pip.addedbpipoptioncd', ['Option 1', 'Option 2'], { style: 'width: fit-content', text: 'Additional Broadened Personal Injury Protection' });
                    },
                    layout: [{ style: 'padding-left: 16px;' }]
                }))))))]), Form.field(Table, "opt-covs", {
                    atr: function atr($$) {
                        return {
                            class: "dfe-table col-3-centred tab-cols-4-3-3",
                            skip: $$.get('..state') == 'KS' ? ['field-111', 'field-114'] : ['field-113'],
                            singleColumn: true
                        };
                    },
                    layout: [{
                        class: "dfe-inline-section"
                    }]
                }, [Form.field(Label, "field-106", {
                    get: function get() {
                        return 'Optional Coverages';
                    },
                    layout: [{
                        colSpan: "3",
                        class: "inline-section-header"
                    }]
                }), Form.field(InlineRows, "towing-switch", { get: function get($$) {
                        return $$.get('.vehicletype') == 'car' && $$.get('.coverages.otc.ded').toString().match(/\d|Full/) ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-118", { config: { field: '.coverages.towlabor.towlabor' } }, Form.field(LabeledDropdown, {
                    atr: function atr() {
                        return _fields.choice('.coverages.towlabor.towlabor', _fields.choiceItems({
                            'No Coverage': 'No Coverage',
                            $50: '50',
                            $100: '100',
                            $200: '200'
                        }), { style: 'width: fit-content', text: 'Towing and Labor' });
                    }
                }))), Form.field(ApplyToAllField, "field-108", { config: { field: '.losspayee.losspayeeInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.losspayee.losspayeeInd', [], { text: 'Loss Payee' });
                    }
                })), Form.field(ApplyToAllField, "field-111", { config: { field: '.losspayee.ailessorInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.losspayee.ailessorInd', [], { text: 'Additional Insured - Lessor' });
                    }
                })), Form.field(ApplyToAllField, "field-114", { config: { field: '.losspayee.haownInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.losspayee.haownInd', [], { text: 'Hired Auto - Specified As Covered Auto You Own' });
                    }
                })), Form.field(ApplyToAllField, "field-157", { config: { field: '.emplessor' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.emplessor', [], { text: 'Employee as Lessor' });
                    }
                })), Form.field(InlineRows, "field-113", Form.field(ApplyToAllField, "field-116", { config: { field: '.losspayee.namedinsuredInd' } }, Form.field(LabeledCheckbox, {
                    atr: function atr() {
                        return _fields.simple('.losspayee.namedinsuredInd', [], { text: 'Additional Named Insured' });
                    }
                })), Form.field(InlineRows, "field-120", { get: function get($$) {
                        return $$.get('.losspayee.namedinsuredInd') == 'Y' ? [$$] : [];
                    } }, Form.field(ApplyToAllField, "field-121", { config: { field: '.losspayee.namedInsured.Name' } }, Form.field(LabeledEditbox, {
                    atr: function atr() {
                        return _fields.simple('.losspayee.namedInsured.Name', [], { cstyle: 'padding-left: 10px;', html: '<b style="color: red">*</b>Name' });
                    }
                }))))]), Form.field(Div, "car-ctrl", {
                    atr: function atr($$) {
                        return {
                            skip: $$.get('..car').length > 1 ? [] : ['remove-car'],
                            style: 'padding: 5px; text-align: right; background: lightgray;'
                        };
                    },
                    layout: [{
                        class: "inline-section-header",
                        style: "display: inline-block; width: 100%; box-sizing: border-box;"
                    }]
                }, [Form.field(Button, "clone-car", {
                    get: function get() {
                        return 'Clone Vehicle';
                    },
                    set: function set($$) {
                        return $$.clone();
                    },
                    atr: function atr() {
                        return {
                            style: 'padding: 1px 10px; margin: 0px 5px'
                        };
                    },
                    layout: [{
                        style: "display: inline-block; float: right;"
                    }]
                }), Form.field(Button, "remove-car", {
                    get: function get() {
                        return 'Remove Vehicle';
                    },
                    set: function set($$) {
                        return $$.detach();
                    },
                    atr: function atr() {
                        return {
                            style: 'padding: 1px 10px; margin: 0px 5px'
                        };
                    },
                    layout: [{
                        style: "display: inline-block; float: right;"
                    }]
                })])])]);
            }
        }, {
            key: "vehProcessVin",
            value: function vehProcessVin($$) {
                $$.get('.vinnumber').length == 17 ? ajaxCache.get({
                    method: 'CMAUVehicleScriptHelper',
                    action: 'getVinLookupResults',
                    vinNumber: $$.get('.vinnumber')
                }).then(function (data) {
                    var r = data.result,
                        isTrailer = r.vehicleType == 'x';
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
                }, function () {
                    return $$.set('.vinvalid', 'N');
                }) : $$.set('.vinvalid', 'N');
            }
        }]);

        return QuoteCmauCarForm;
    }(Form);
    if (typeof window !== 'undefined') {
        window.showHelp = function (url) {
            window.open(url, 'DetailWin', 'scrollbars=yes,resizable=yes,toolbar=no,height=250,width=250').focus();
        };
    }
    return QuoteCmauCarForm;
});