# dfe

Developed to replace server side rendering quote forms for Arrowhead General Insurance Agency. 

This api is for building isomorphic applications, meant to run under nashorn on server side for purposes of user input validation and data model consistancy verification. 

Validation logic and structure of data flow are decoupled from view layer which may be dom html output or whatever else. Product of logic execution is passed to 'components' that may either render into dom (ui side) or gather various information (such as failed validation, on server side).  
