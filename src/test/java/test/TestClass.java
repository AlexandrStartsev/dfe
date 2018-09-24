package test;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeoutException;
import java.util.function.Function;
import java.util.function.Supplier;

import javax.script.Invocable;
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
import org.asynchttpclient.AsyncHttpClient;
import org.asynchttpclient.Dsl;
import org.asynchttpclient.ListenableFuture;
import org.asynchttpclient.Request;
import org.asynchttpclient.Response;
import org.junit.Test;

import com.coveo.nashorn_modules.Require;
import com.coveo.nashorn_modules.ResourceFolder;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import jdk.nashorn.api.scripting.NashornScriptEngine;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

@SuppressWarnings("restriction")
public class TestClass {
	public static interface I1 {
		static I1 get() {
			return null;
		}
	} 
	
	public static class I2 implements I1 {
		Number getA() {
			return Integer.valueOf(3);
		}
	} 
	
	public static class I3 extends I2 {
		@Override
		BigDecimal getA() {
			return BigDecimal.valueOf(3);
		}
	} 
	
	//private ResourceFolder root = ResourceFolder.create(getClass().getClassLoader(), "js/", "UTF-8");
	
	
	@Test
	public Object someTest() throws IOException {
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
		NashornScriptEngine e = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
		//Require.enable(e, root);
		
		AsyncHttpClient client = Dsl.asyncHttpClient();
		
		try{
			e.put("__httpClient", client);
			e.eval("load('classpath:./test.js')");
			/*e.eval("var jsonModel = JSON.stringify(require('model')), formClass =  require('forms/testform');");
			ScriptObjectMirror obj = (ScriptObjectMirror) e.eval("ssr( jsonModel, formClass, 10000, true )");
			System.out.println(obj.get("script"));
			System.out.println(obj.get("html"));
			System.out.println("ok");*/
		} catch(Throwable ex) {
			ex.printStackTrace(System.err);
		} finally {
			client.close();
		}
		return "";
	}
	
	/*public static class ZZ {
		public void gg(jdk.nashorn.api.scripting.ScriptObjectMirror c) {
			c.call(null);
		} 
	}*/
	
	
	public static void main(String[] args) throws ScriptException, InterruptedException, ExecutionException, IOException, TimeoutException {
		final LinkedBlockingQueue<Object> queue = new LinkedBlockingQueue<>();
		/*AsyncHttpClient client = Dsl.asyncHttpClient();
		try {
			Request req = Dsl.request("GET", "https://arrowheadexchange.com/AJAXServlet.srv?action=getSubcodes&classCode=0042&effectiveDate=20180511&lob=WORK&state=MO&method=WORKClassCodeScriptHelper").setBody("").build();
			ListenableFuture<Response> f = client.executeRequest(req);
			f.abort(new Exception("1234"));
			System.out.println(f.get().getResponseBody());
		//
		//f.cancel(true);
		} finally {
			client.close();
		} */
		//String data = f.get().getStat getResponseBody();
		
		//System.out.println(data);
		
		//client.close();
		//for(int i = 0; i < 1; i ++)
		
		/*CompletableFuture<Object> f = CompletableFuture.supplyAsync(() -> new TestClass().someTest());
		try {
			f.get(3, TimeUnit.SECONDS);
		} finally {
			f.cancel(true);
		}*/
		
		AsyncHttpClient client = Dsl.asyncHttpClient();
		List<Thread> all = new ArrayList<>();
		/*NashornScriptEngine e = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
		

		
		e.put("ink", new ZZ());
		
		e.put("all", all);
		long m = System.currentTimeMillis();
		//e.eval("for(var i = 0; i < 1000000; i++) (function(a, b, c) { all.size(); })()");
		e.eval("var ff = function(a, b, c) { all.size(); }; for(var i = 0; i < 1000000; i++) ink.gg(ff)");
		System.out.println(System.currentTimeMillis() - m);
		*/
		
		//int pattern[] = {200, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50}; //{0, 1, 2, 3, 10, 20, 6, 7, 7, 7, 30, 10, 2, 5, 10, 15, 1, 10, 2, 50, 50, 50 };
		//Executors.newSingleThreadExecutor().shutdownNow()
		
		try {
			for(int i = 0; i < 1; i ++) {
				//System.out.println("Interrupt test: interrupting in " + pattern[i] + " s");
				Thread tt = new Thread() {
					@Override
					public void run() {
						try {
							try{
								NashornScriptEngine e = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
								//jdk.nashorn.api.scripting.ScriptObjectMirror i = (jdk.nashorn.api.scripting.ScriptObjectMirror)e.eval("function(a, b, c) { print(b);}");
								//i.call(null, "fff", "ppp");
										
								e.put("__httpClient", client);
								e.put("queue", queue);
								e.eval("load('classpath:./test.js')");
							} catch(Throwable ex) {
								ex.printStackTrace(System.err);
							}
						} catch (Throwable e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
				};
				all.add(tt);
				tt.start();
				
				Thread.sleep(3000);
				queue.put("payload - 1");
				Thread.sleep(100);
				queue.put("payload - 2");
				Thread.sleep(100);
				queue.put("payload - 3");
				Thread.sleep(2000);
				queue.put("payload - 4");
				Thread.sleep(2000);
				queue.put("payload - 5");
				Thread.sleep(2000);
				queue.put("payload - 6");
				Thread.sleep(2000);
				queue.put("payload - 7");
				Thread.sleep(2000);
				tt.interrupt();
				tt.join();
				
				//tt.join();
				//Thread.sleep(pattern[i]*1000);
				//System.out.println("Attempt to interrupt");
				//tt.interrupt();
				//tt.join();
				//System.out.println("Success");
			}
			for(Thread tt : all) tt.join();
		} finally {
			client.close();
		}
	}
}
