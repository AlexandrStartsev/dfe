package com.arrow.util.experimental;

import java.io.IOException;
import java.io.InputStreamReader;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;

//import com.arrow.common.EnvironmentInfo;
//import com.arrow.common.IEnvironmentInfo;

public class ExperimentalUtilsFactory {
	
	private String read(String path) throws IOException {
		return IOUtils.toString(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(path))); 
	} 

	public ScriptEngine createScriptEngine() throws ScriptException, IOException {
		ScriptEngine e = new ScriptEngineManager().getEngineByName("nashorn");
		e.eval(read("conf/dfe-experimental/js/nashorn-utils.js"));
		
		//IEnvironmentInfo env = EnvironmentInfo.getInstance();
		e.eval("load('http://localhost:7001/js/dfe-core.js')");
		e.eval("load('http://localhost:7001/js/dfe-validator.js')");
		e.eval("load('http://localhost:7001/js/extras.js')");
		return e;
	}

}
