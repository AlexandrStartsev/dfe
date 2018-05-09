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
			e.eval("var __BASE_URL__ = 'https://arrowheadexchange.com'");
			e.eval("load('C:/Users/asta/eclipse/arrowhead-workspace/Workspace/dfe-on-spring/src/test/java/test/test.js')");
		} catch(Exception ex) {
			ex.printStackTrace(System.err);
		}
	}
}
