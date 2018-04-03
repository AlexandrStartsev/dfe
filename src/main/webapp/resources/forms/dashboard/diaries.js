defineForm("dashboard/diaries", [ "dfe-common", "ui/utils", "ui/shapes", "dfe-field-helper", "components/container", "components/label" ], function( cmn, uiUtils, shapes, fields, __c_container, __c_label ) {
    return new class {
        constructor() {
            this.dfe = __c_container("root", {
                get: $$ => [ $$ ],
                atr: () => ({
                    style: 'background-color: white; width: 900px'
                })
            }, [ __c_label("a", { get: () => 'sup, dude' }) ]);
        }
        setup() {
            uiUtils.setDfeCustomStyle(``, this.name);
        }
    }();
});