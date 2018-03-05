<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html>
<html>
    <head>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="/resources/js/dfe-core.js"></script>
        <script src="/resources/js/dfe-editor.js"></script>
        <script src="/resources/js/dfe-validator.js"></script>
        <script src="/resources/js/dfe-components.js"></script>
        <script src="/resources/js/extras.js"></script>
        <link rel="stylesheet" type="text/css" href="/resources/others/style.css">

       <!--  <script src="/resources/js/jquery.typeahead.min.js"></script>
        <link href="/resources/others/jquery.typeahead.css" type="text/css" rel="stylesheet">
        <style id="custom-css-dfe" type="text/css"></style> -->
        <script>
            var runtime = window.opener.runtime;
            window.onload = function() {
	            runtime.manager.startRuntime( { params : {target_runtime : runtime},
	                                            model : runtime.form.getDfeArf(),
	                                            node : document.getElementById('dfe_edit'),
	                                            formName : 'dfe-edit-dfe',
	                                            formClass : DfeEditor
	            });
            }
        </script>        
    </head>

    <body>
        Changes will reflect on DFE page as you type. <br/>
        <div id="dfe_edit">
        </div>    
    </body>
</html>
