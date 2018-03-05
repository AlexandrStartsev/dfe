<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<%
   
%>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

	    <link rel="stylesheet" type="text/css" href="/resources/others/style.css"/>
        <script src="/resources/js/dfe-core.js"></script>
        <script src="/resources/js/dfe-components.js"></script>
        <script src="/resources/js/extras.js"></script>
        <script src="/resources/js/jquery.typeahead.js"></script>
        <link href="/resources/others/jquery.typeahead.css" type="text/css" rel="stylesheet"></link>
        <style id="custom-css-dfe" type="text/css"></style>

	    <script>
	        window.onkeydown = function(event) { if(event.key == "F10") window.open("/editor", "DFE editor", "height=460,width=1690,left=300,top=300,toolbar=no,titlebar=no,status=no,menubar=no"); }
	        
	        var manager = new DfeManager('/dfe', Components), runtime, arf, formName = '<%= request.getAttribute("form-name") %>';
	        var echo = true;
		    window.onload = function() {
		    	$.ajax({
		    		url: '/arf/test-arf-2', dataType: 'json', contentType:"application/json; charset=utf-8", success: function(data, status) {
		    			(arf = data).policy[0].formname = formName.replace(/-/g,'.');
		    			runtime = manager.startRuntime({  model : new JsonProxy(arf), node: document.getElementById('arf_edit'), formName: arf.policy[0].formname });
		    		}
		    	});
                
		    	document.getElementById('save').addEventListener('click', function() {
	                	ajaxPost(arf, '/post', function(r){ 
					                		echo && alert( r.result ? "Validated" : "Detected " + r.data.length + " error(s), F12 to see console");
					                		var ctrls = runtime.findErroringChildren().concat(runtime.findControls(r.data.map(function(v) {return v.field})));
					                		runtime.notifyControls(ctrls, 'validate');
	                                        console.log(r);
			                		   });
		    	     });
		    }
	    </script>
	</head>

	<body>
	   
	    <div id="arf_edit">
	    </div> 
	    <br/>
	    <br/> 
	    <input id="save" type="button" value="Validate on server"/> 
	    <br/>
	    <br/>
        <label>Hit F10...</label>
	</body>
</html>
