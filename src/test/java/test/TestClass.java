package test;

import java.io.File;
import java.net.MalformedURLException;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.junit.Test;
import jdk.nashorn.api.scripting.ScriptObjectMirror;

@SuppressWarnings("restriction")
public class TestClass {
	
	@Test
	public void someTest() throws ScriptException, MalformedURLException {
		/* CloseableHttpClient cl = org.apache.http.impl.client.HttpClients.createDefault();
		 HttpGet get = new HttpGet(uri)
		 HttpPost post;
		 HttpUriRequest req;
		 HttpEntity
		 post.setEntity(entity);
		 
		 new StringEntity()
		 CloseableHttpResponse resp = cl.execute(req);
		 resp.close();
		 cl.close();
		 req.setHeader(arg0, arg1);
		 resp.getEntity().to getStatusLine().getReasonPhrase() getStatusCode()  getEntity()
		 */
		//System.setProperty("log4j.configuration", new File("resources", "log4j.xml"). toURL().toString());
		//System.setProperty("log4j.error", "");
		ScriptEngine e = new ScriptEngineManager().getEngineByName("javascript");
		try{
			e.eval("var __AJAX_ROOT__ = 'https://arrowheadexchange.com', __STATIC_ROOT__ = 'classpath:'");
			e.eval("load('classpath:nashorn-utils.js')");
			e.eval("load('classpath:ajaxCache.js')");
			e.eval("load('classpath:test.js')");
			/*e.eval("var jsonModel = JSON.stringify(require('model')), formClass =  require('forms/testform');");
			ScriptObjectMirror obj = (ScriptObjectMirror) e.eval("ssr( jsonModel, formClass, 10000, true )");
			System.out.println(obj.get("script"));
			System.out.println(obj.get("html"));
			System.out.println("ok");*/
		} catch(Throwable ex) {
			ex.printStackTrace(System.err);
		}
	}
}
