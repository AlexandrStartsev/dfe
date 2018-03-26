/*defineForm("a", [ "require", "dfe-common", "components/div", "components/svg-icon" ], function(require, cmn, __c_div, __c_svg_icon) {
    return new class {
        constructor() {
            this.dfe = [ {
                name: "root",
                component: __c_div,
                get: $$ => $$('.policy')
            }, {
                name: "field-1",
                component: __c_svg_icon,
                parent: "root",
                get: () => 'svg-icon-file-text'
            }
        ]}
    }();
});*/
"use strict";function _classCallCheck(n,e){if(!(n instanceof e)){throw new TypeError("Cannot call a class as a function")}}
defineForm("a",["require","dfe-common","components/div","components/svg-icon"],function(n,e,t,o){return new(function(){
    function n(){_classCallCheck(this,n);this.dfe=[{name:"root",component:t,get:function n(e){return e(".policy")}},
      {name:"field-1",component:o,atr:function(){ return {style:'width:16px; height:16px;'}},parent:"root",get:function n(){
          return"svg-icon-file-text"}}]}return n}())});