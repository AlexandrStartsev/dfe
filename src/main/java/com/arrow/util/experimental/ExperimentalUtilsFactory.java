package com.arrow.util.experimental;

import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.Future;
import java.util.function.Function;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

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
			// TODO: uncomment when we have eager initialization back. 
			ScriptEngine e = manager.getEngineByName("nashorn");
			e.put("baseUrl", baseUrl);
			e.eval("global = (function() { return this })()");
			//e.eval("load(baseUrl + '/experimental/babel.js')");
			//e.eval("load(baseUrl + '/experimental/uglify.js')");
			e.eval("load('classpath:com/arrow/js/nashorn-utils.js')");
			//backgroundWarmup(e);
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
	
	final static void backgroundWarmup(ScriptEngine e) {
		ForkJoinPool.commonPool().submit(new Callable<Object>() {
			@Override
			public Object call() throws Exception {
				long t = System.currentTimeMillis();
				try {
					// do something intense for a while, doesn't really matter what
					return e.eval("for(var i = 0; i < 100; i++ ) babel.transform('class abc{ f(a) { return a.map(b => b.c) } }', {presets: ['es2015']})");
				} finally {
					log.warn("Nashorn warmup complete in " + (System.currentTimeMillis() - t) + "ms");
				}
			}
		});
	}
}
