define([ "dfe-core", "ui/utils", "ui/shapes", "components/html", "components/label", "components/div", "module" ], function(Core, uiUtils, shapes, Html, Label, Div, module) {
    uiUtils.setDfeCustomStyle(`
        .arrow-button {
            width:14px;
            height: 14px;
            fill: white;
            display: flex;
        }

        .arrow-button:active {
            transform: scale(0.8);
        }    
    `, module.id);
    
    let Form = Core.Form;

    return class SortableHeader extends Form {
        static fields() {
            return (
                Form.field(Div, "a",
                    Form.field(Label, "b", { get: $$ => $$.get('caption') }), 
                    Form.field(Html, "c", {
                        atr: function($$) { 
                            return {
                                class: 'arrow-button',
                                get: $$ => shapes.svgShape($$, 'svg-arrow-' + $$.get('dir')),
                                events: {
                                    onClick: () => this.store($$)
                                }
                            }
                        }
                    })
                )
            )
        }
    }
})