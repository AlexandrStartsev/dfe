package com.arrow.util.nashorn;

import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.net.InetAddress;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Function;

import javax.management.AttributeNotFoundException;
import javax.management.InstanceNotFoundException;
import javax.management.MBeanException;
import javax.management.MBeanServer;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectName;
import javax.management.Query;
import javax.management.QueryExp;
import javax.management.ReflectionException;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

import com.arrow.common.BuildEnvironment;
import com.arrow.common.EnvironmentInfo;
import com.arrow.common.IEnvironmentInfo;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

@SuppressWarnings("restriction")
public class NashornUtils {
	static final Logger log = Logger.getLogger(NashornUtils.class);
	
	final static IEnvironmentInfo env = EnvironmentInfo.getInstance();
	final static String rootUrl = env.getBaseAExUrl().toString();
	final static String baseUrl = env.getBaseAExStaticUrl().toString(); 
	final static ScriptEngineManager manager = new ScriptEngineManager();
	final static Future<ScriptEngine> engine = Executors.newSingleThreadExecutor().submit(new Callable<ScriptEngine>() {

		@Override
		public ScriptEngine call() throws Exception {
			ScriptEngine e = manager.getEngineByName("nashorn");
			e.put("__AJAX_ROOT__", rootUrl);
			e.put("__STATIC_ROOT__", baseUrl + "/");
			if( env.getBuildEnvironment() == BuildEnvironment.LOCAL /*|| env.getArrowheadSystem() == ArrowheadSystem.TOOLS*/ ) {
				try {
					String root = getEndPoints().get(0);
					String staticBase = guessStatic(root);
					e.put("__AJAX_ROOT__", root);
					e.put("__STATIC_ROOT__", staticBase);
				} catch(Exception ex) { }
			}
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
			return IOUtils.toString(NashornUtils.class.getClassLoader().getResourceAsStream(uri.replace("classpath:", "")), encoding);
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
	
	static String guessStatic(String base) throws MalformedURLException, IOException {
		final String test = "js/core/dfe-core.js";
		try {
			new URL(base + "/" + test).openStream().close();
			return base + "/";
		} catch(Exception e1) {
			try {
				new URL(base + "/aex-static/" + test).openStream().close();
				return base + "/aex-static/";
			} catch(Exception e2) {
				new URL(base + "/static/" + test).openStream().close();
				return base + "/static/";
			}
		}
	}
	
	static List<String> getEndPoints() throws MalformedObjectNameException,
	    NullPointerException, UnknownHostException, AttributeNotFoundException,
	    InstanceNotFoundException, MBeanException, ReflectionException {
		MBeanServer mbs = ManagementFactory.getPlatformMBeanServer();
		QueryExp subQuery1 = Query.match(Query.attr("protocol"), Query.value("HTTP/1.1"));
		QueryExp subQuery2 = Query.anySubString(Query.attr("protocol"), Query.value("Http11"));
		QueryExp query = Query.or(subQuery1, subQuery2);
		Set<ObjectName> objs = mbs.queryNames(new ObjectName("*:type=Connector,*"), query);
		String hostname = InetAddress.getLocalHost().getHostName();
		InetAddress[] addresses = InetAddress.getAllByName(hostname);
		ArrayList<String> endPoints = new ArrayList<>();
		for (Iterator<ObjectName> i = objs.iterator(); i.hasNext();) {
		    ObjectName obj = i.next();
		    String scheme = mbs.getAttribute(obj, "scheme").toString();
		    String port = obj.getKeyProperty("port");
		    for (InetAddress addr : addresses) {
		        if (addr.isAnyLocalAddress() || addr.isLoopbackAddress() || 
		            addr.isMulticastAddress()) {
		            continue;
		        }
		        String host = addr.getHostAddress();
		        String ep = scheme + "://" + host + ":" + port;
		        endPoints.add(ep);
		    }
		}
		return endPoints;
	}
}
