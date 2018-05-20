package com.arrow.util.nashorn.collections;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

@SuppressWarnings("restriction")
public class JSArrayFactory {
	private final static ScriptObjectMirror arrayFactory = null; //ExperimentalUtilsFactory.jsEval.apply("function () { return [] }");
	
	private JSArrayFactory() {}
	
	public static ScriptObjectMirror newInstance() { return (ScriptObjectMirror)arrayFactory.call(null); }
}
