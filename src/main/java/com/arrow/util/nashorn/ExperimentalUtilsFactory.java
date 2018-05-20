package com.arrow.util.nashorn;

import java.net.URL;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Function;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

import com.arrow.common.EnvironmentInfo;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

@SuppressWarnings("restriction")
public class ExperimentalUtilsFactory {
	static final Logger log = Logger.getLogger(ExperimentalUtilsFactory.class);
	
	final static String baseUrl = EnvironmentInfo.getInstance().getBaseAExStaticUrl().toString(); 
	final static ScriptEngineManager manager = new ScriptEngineManager();
	final static Future<ScriptEngine> engine = Executors.newSingleThreadExecutor().submit(new Callable<ScriptEngine>() {

		@Override
		public ScriptEngine call() throws Exception {
			ScriptEngine e = manager.getEngineByName("nashorn");
			e.put("baseUrl", baseUrl);
			e.eval("global = (function() { return this })()");
			e.eval("load('classpath:com/arrow/js/nashorn-utils.js')");
			return e;
		}
	});
	
	private final static ConcurrentHashMap<String, ScriptObjectMirror> compiled = new ConcurrentHashMap<>();
	
	public final static Object execute(String script, Object... args) {
		return compiled.computeIfAbsent(script, new Function<String, ScriptObjectMirror>() {
			@Override
			public ScriptObjectMirror apply(String t) {
				try {
					return (ScriptObjectMirror) engine.get().eval(t);
				}
				catch (ScriptException | InterruptedException | ExecutionException e) {
					throw new RuntimeException(e);
				}
			}
		}).call(null, args);
	}
	
	public final static String getUriAsString(String uri) throws Exception {
		return getUriAsString(uri, "UTF-8");
	}
			
	public final static String getUriAsString(String uri, String encoding) throws Exception {
		if(uri.startsWith("classpath:")) {
			return IOUtils.toString(ExperimentalUtilsFactory.class.getClassLoader().getResourceAsStream(uri.replace("classpath:", "")), encoding);
		}
		if(uri.startsWith("http")) {
			return IOUtils.toString(new URL(uri).openStream(), encoding);
		}
		if(uri.startsWith("inline:")) {
			int length = Integer.parseInt(uri.replaceFirst("inline:(\\d+):.*", "$1"));
			return uri.substring(7, length + 7);
		}
		throw new UnsupportedOperationException("uri format is not supported yet");
	}
}
