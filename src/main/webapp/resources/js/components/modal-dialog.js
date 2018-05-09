    /*
    
showNotes($$) {
            let qid = $$('.quoteid'), map = this.noteRt, rt = map.get(qid);
            if (!rt) {
                map.set(qid, rt = core.startRuntime({
                    form: notes.form,
                    model: $$,
                    node: jq('<div>').dialog({
                        title: 'Notes for quote #' + $$.get('.quoteid'),
                        width: 400,
                        height: 200,
                        close: function() {
                            ....
                        }
                    })[0]
                }));
            } else {
                jq(rt.rootUI).dialog('moveToTop');
            }
        }    
    */

define('components/modal-dialog', ['components/div', 'ui/utils', 'ui/jquery-ui'], function(CDiv, uiUtils, jQuery) {
	function _extend() { for(var i = arguments.length-1, to = arguments[i], from; from = arguments[--i];) for (var key in from) to[key] = from[key]; return to; }
    
    return _extend({
        cname: 'modal-dialog',
        render: function(nodes, control, data, errs, attrs, events) {

            //attrs.show 
{
            var rc = require('components/' + attrs.component), rt = this.runtime(control);
                if( rc != rt.renderingComponent ) {
                    rt.renderingComponent && rt.renderingComponent.emptyUI(control);
                    rt.renderingComponent = rc;
                }
                rt.renderingComponent.render(nodes, control, data, errs, attrs, events);
            }
        }
    }, Component, _base());
})